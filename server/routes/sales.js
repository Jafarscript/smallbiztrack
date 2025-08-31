import express from 'express';
import auth from '../middleware/auth.js';
import Product from '../models/Product.js';
import Sale from '../models/Sale.js';


const router = express.Router()

router.post("/", auth, async (req, res) => {
  try {
    const { productId, quantity, customerName, paymentMethod } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.stock < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    const totalPrice = product.price * quantity;

    const sale = await Sale.create({
      product: productId,
      quantity,
      totalPrice,
      customerName,
      paymentMethod,
      user: req.user.id,
    });

    // Reduce stock
    product.quantity -= quantity;
    await product.save();

    res.status(201).json(sale);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- LIST sales with search/filter/sort/pagination ---
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      search = "",
      paymentMethod,
      minQty,
      maxQty,
      sort = "date",       // default sort field
      order = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    // Whitelist fields that can be sorted
    const sortWhitelist = ["date", "quantity", "totalPrice", "customerName"];
    const sortField = sortWhitelist.includes(sort) ? sort : "date";
    const sortOrder = order === "asc" ? 1 : -1;

    // Base query
    const q = { user: userId };

    // Filter: paymentMethod
    if (paymentMethod) {
      q.paymentMethod = paymentMethod;
    }

    // Filter: minQty/maxQty
    if (minQty !== undefined || maxQty !== undefined) {
      q.quantity = {};
      if (minQty !== undefined) q.quantity.$gte = Number(minQty);
      if (maxQty !== undefined) q.quantity.$lte = Number(maxQty);
    }

    // Search: customerName OR product name (requires populate later)
    if (search) {
      q.$or = [
        { customerName: { $regex: search, $options: "i" } },
        // NOTE: product search has to be done after populate if you want it,
        // but we can do it using `Sale.find(...).populate(...).match`
      ];
    }

    // Pagination setup
    const pageNum = Math.max(1, parseInt(page, 10));
    const lim = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * lim;

    // Query DB
    const [data, total] = await Promise.all([
      Sale.find(q)
        .populate("product") // get product details
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(lim),
      Sale.countDocuments(q),
    ]);

    res.json({
      data,
      page: pageNum,
      limit: lim,
      total,
      totalPages: Math.ceil(total / lim),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.put("/:id", auth, async (req, res) => {
  try {
    const { productId, quantity, customerName, paymentMethod } = req.body;

    // Find sale (ensure user ownership)
    const sale = await Sale.findOne({
      _id: req.params.id,
      user: req.user.id, // fixed: should match "user" field, not "userId"
    }).populate("product");

    if (!sale) return res.status(404).json({ error: "Sale not found" });

    // --- Step 1: restore stock from old sale ---
    const oldProduct = await Product.findById(sale.product._id);
    oldProduct.quantity += sale.quantity; // add back old sold qty
    await oldProduct.save();

    // --- Step 2: check & update new product ---
    let newProduct = oldProduct;
    if (productId && productId !== String(sale.product._id)) {
      newProduct = await Product.findById(productId);
      if (!newProduct) return res.status(404).json({ error: "New product not found" });
    }

    // Check stock
    if (newProduct.quantity < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    // Deduct new quantity
    newProduct.quantity -= quantity;
    await newProduct.save();

    // --- Step 3: recalc total price ---
    const totalPrice = newProduct.price * quantity;

    // --- Step 4: update sale record ---
    sale.product = productId || sale.product._id;
    sale.quantity = quantity;
    sale.totalPrice = totalPrice;
    if (customerName) sale.customerName = customerName;
    if (paymentMethod) sale.paymentMethod = paymentMethod;

    await sale.save();

    res.json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete (no changes)
router.delete('/:id', auth, async (req, res) => {
    const sale = await Sale.findOne({_id : req.params.id})

    if (!sale) return res.status(404).json({error: "Not Found"});

    await sale.deleteOne();
    res.status(204).send();
})

export default router;