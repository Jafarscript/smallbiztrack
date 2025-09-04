import express from 'express';
import mongoose from 'mongoose';
import auth from '../middleware/auth.js';
import Product from '../models/Product.js';
import Sale from '../models/Sale.js';
import { getDateRange } from '../utils/dataFilters.js';

const router = express.Router();

// --- CREATE Sale ---
router.post("/", auth, async (req, res) => {
  try {
    const { productId, quantity, customerName, paymentMethod } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.quantity < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    const totalPrice = product.price * quantity;

    const sale = await Sale.create({
      product: productId,
      quantity,
      totalPrice,
      customerName,
      paymentMethod,
      user: new mongoose.Types.ObjectId(req.user.id), // ✅ FIXED
    });

    // Reduce stock
    product.quantity -= quantity;
    await product.save();

    res.status(201).json(sale);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- LIST Sales ---
router.get("/", auth, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id); // ✅ FIXED
    const {
      search = "",
      paymentMethod,
      minQty,
      maxQty,
      sort = "date",
      order = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const sortWhitelist = ["date", "quantity", "totalPrice", "customerName"];
    const sortField = sortWhitelist.includes(sort) ? sort : "date";
    const sortOrder = order === "asc" ? 1 : -1;

    const q = { user: userId };

    if (paymentMethod) q.paymentMethod = paymentMethod;
    if (minQty !== undefined || maxQty !== undefined) {
      q.quantity = {};
      if (minQty !== undefined) q.quantity.$gte = Number(minQty);
      if (maxQty !== undefined) q.quantity.$lte = Number(maxQty);
    }
    if (search) {
      q.$or = [{ customerName: { $regex: search, $options: "i" } }];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const lim = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * lim;

    const [data, total] = await Promise.all([
      Sale.find(q)
        .populate("product")
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

// --- UPDATE Sale ---
router.put("/:id", auth, async (req, res) => {
  try {
    const { productId, quantity, customerName, paymentMethod } = req.body;

    const sale = await Sale.findOne({
      _id: req.params.id,
      user: new mongoose.Types.ObjectId(req.user.id), // ✅ FIXED
    }).populate("product");

    if (!sale) return res.status(404).json({ error: "Sale not found" });

    const oldProduct = await Product.findById(sale.product._id);
    oldProduct.quantity += sale.quantity;
    await oldProduct.save();

    let newProduct = oldProduct;
    if (productId && productId !== String(sale.product._id)) {
      newProduct = await Product.findById(productId);
      if (!newProduct) return res.status(404).json({ error: "New product not found" });
    }

    if (newProduct.quantity < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    newProduct.quantity -= quantity;
    await newProduct.save();

    const totalPrice = newProduct.price * quantity;

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

// --- DELETE Sale ---
router.delete("/:id", auth, async (req, res) => {
  const sale = await Sale.findOne({ _id: req.params.id });
  if (!sale) return res.status(404).json({ error: "Not Found" });
  await sale.deleteOne();
  res.status(204).send();
});

// --- SUMMARY ---
router.get("/summary", auth, async (req, res) => {
  try {
    const { filter } = req.query;
    const { start, end } = getDateRange(filter);

    const match = { user: new mongoose.Types.ObjectId(req.user.id) }; // ✅ FIXED
    if (start && end) match.date = { $gte: start, $lte: end };

    const summary = await Sale.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          totalSales: { $sum: "$totalPrice" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(summary);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- BEST SELLERS ---
router.get("/best-sellers", auth, async (req, res) => {
  try {
    const { filter } = req.query;
    const { start, end } = getDateRange(filter);

    const match = { user: new mongoose.Types.ObjectId(req.user.id) }; // ✅ FIXED
    if (start && end) match.date = { $gte: start, $lte: end };

    const best = await Sale.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$product",
          totalQty: { $sum: "$quantity" },
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { totalQty: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          name: "$product.name",
          totalQty: 1,
          totalRevenue: 1,
        },
      },
    ]);

    res.json(best);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- STATS ---
router.get("/stats", auth, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id); // ✅ FIXED

    // today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayStats = await Sale.aggregate([
      { $match: { user: userId, date: { $gte: todayStart, $lte: todayEnd } } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);

    // week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekStats = await Sale.aggregate([
      { $match: { user: userId, date: { $gte: weekStart } } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);

    // total
    const totalStats = await Sale.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);

    res.json({
      today: todayStats[0]?.total || 0,
      week: weekStats[0]?.total || 0,
      totalRevenue: totalStats[0]?.total || 0,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- LOW STOCK ---
router.get("/low-stock", auth, async (req, res) => {
  try {
    const products = await Product.find({
      user: new mongoose.Types.ObjectId(req.user.id), // ✅ FIXED
      $expr: { $lte: ["$quantity", "$reorderLevel"] }
    }).select("name quantity reorderLevel category");

    res.json(products);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
