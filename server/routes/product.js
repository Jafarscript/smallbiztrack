import express from "express";
import multer from "multer";
import { check, validationResult } from "express-validator"; // Import validator
import cloudinary from "../config/cloudinary.js";
import auth from "../middleware/auth.js";
import Product from "../models/Product.js";

const router = express.Router();

// --- Multer and Cloudinary setup (no changes) ---
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const ok = ['image/jpeg', "image/png", "image/webp"].includes(file.mimetype);
        cb(ok ? null : new Error("Unsupported file type"), ok);
    }
});

async function uploadToCloudinary(buffer) {
    return await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "smallbiztrack/products", resource_type: "image" },
            (err, result) => err ? reject(err) : resolve(result)
        );
        stream.end(buffer);
    });
}

// --- NEW: Validation Middleware ---
const validateProduct = [
    check("name").notEmpty().withMessage("Product name is required."),
    check("price").isFloat({ gt: 0 }).withMessage("Price must be a positive number."),
    check("quantity").isInt({ min: 0 }).withMessage("Quantity must be a non-negative integer."),
    check("category").notEmpty().withMessage("Category is required."),
    check("reorderLevel").optional().isInt({ min: 0 }).withMessage("Reorder level must be a non-negative integer."),
    check("cost").optional().isFloat({ min: 0 }).withMessage("Cost must be a non-negative number."),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const formattedErrors = {};
            errors.array().forEach(err => {
                // Use err.path instead of err.param
                if (err.path) formattedErrors[err.path] = err.msg;
            });
            // 422 Unprocessable Entity
            return res.status(422).json({ errors: formattedErrors });
        }
        next();
    },
];

// --- UPDATED: Create Product Route ---
router.post("/", auth, upload.single("image"), validateProduct, async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, price, quantity, category, reorderLevel, cost, sku } = req.body;

        let image = null;
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer);
            image = { url: result.secure_url, publicId: result.public_id };
        }

        const product = await Product.create({
            userId, name, price, quantity, category, reorderLevel, cost, sku, image
        });

        res.status(201).json(product);
    } catch (e) {
        if (e.code === 11000) {
            return res.status(400).json({ message: "A product with this name already exists." });
        }
        res.status(400).json({ message: e.message });
    }
});

// --- LIST with search/filter/sort/pagination (no changes) ---
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      search = "",
      category,
      minQty,
      maxQty,
      sort = "createdAt",
      order = "desc",
      page = 1,
      limit = 10
    } = req.query;

    const sortWhitelist = ["createdAt", "name", "price", "quantity"];
    const sortField = sortWhitelist.includes(sort) ? sort : "createdAt";
    const sortOrder = order === "asc" ? 1 : -1;

    const q = { userId };
    if (category) q.category = category;

    if (minQty !== undefined || maxQty !== undefined) {
      q.quantity = {};
      if (minQty !== undefined) q.quantity.$gte = Number(minQty);
      if (maxQty !== undefined) q.quantity.$lte = Number(maxQty);
    }

    if (search) {
      q.$or = [
        { name: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const lim = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * lim;

    const [data, total] = await Promise.all([
      Product.find(q).sort({ [sortField]: sortOrder }).skip(skip).limit(lim),
      Product.countDocuments(q)
    ]);

    res.json({
      data,
      page: pageNum,
      limit: lim,
      total,
      totalPages: Math.ceil(total / lim)
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// GET ONE (no changes)
router.get("/:id", auth, async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, userId: req.user.id });
  if (!product) return res.status(404).json({ error: "Not found" });
  res.json(product);
});


// --- UPDATED: Update Product Route ---
router.put("/:id", auth, upload.single("image"), validateProduct, async (req, res) => {
    try {
        const product = await Product.findOne({ _id: req.params.id, userId: req.user.id });
        if (!product) return res.status(404).json({ error: "Not found" });

        const fields = ["name", "price", "quantity", "category", "reorderLevel", "cost", "sku"];
        fields.forEach(f => {
            if (req.body[f] !== undefined) product[f] = req.body[f];
        });

        if (req.file) {
            if (product.image?.publicId) {
                try { await cloudinary.uploader.destroy(product.image.publicId); } catch { }
            }
            const result = await uploadToCloudinary(req.file.buffer);
            product.image = { url: result.secure_url, publicId: result.public_id };
        }

        await product.save();
        res.json(product);
    } catch (e) {
        if (e.code === 11000) {
            return res.status(400).json({ message: "A product with this name already exists." });
        }
        res.status(400).json({ message: e.message });
    }
});

// DELETE (no changes)
router.delete("/:id", auth, async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, userId: req.user.id });
  if (!product) return res.status(404).json({ error: "Not found" });

  if (product.image?.publicId) {
    try { await cloudinary.uploader.destroy(product.image.publicId); } catch {}
  }
  await product.deleteOne();
  res.status(204).send();
});


export default router;