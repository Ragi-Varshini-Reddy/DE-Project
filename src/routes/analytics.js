const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

// Product additions by day
router.get("/sales-by-day", async (req, res, next) => {
  try {
    const { start, end } = req.query;
    const match = {};

    if (start || end) {
      match.createdAt = {};
      if (start) match.createdAt.$gte = new Date(start);
      if (end) match.createdAt.$lte = new Date(end);
    }

    const results = await Product.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          products: { $sum: 1 },
          totalQuantity: { $sum: "$inventory.quantity" },
          totalValue: {
            $sum: { $multiply: ["$price", "$inventory.quantity"] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(results);
  } catch (error) {
    next(error);
  }
});

// Top products by stock value
router.get("/top-products", async (req, res, next) => {
  try {
    const limit = Number(req.query.limit || 10);

    const results = await Product.aggregate([
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          price: { $first: "$price" },
          quantity: { $sum: "$inventory.quantity" },
          totalValue: {
            $sum: { $multiply: ["$price", "$inventory.quantity"] }
          }
        }
      },
      { $sort: { totalValue: -1 } },
      { $limit: limit }
    ]);

    res.json(results);
  } catch (error) {
    next(error);
  }
});

// Inventory value trend by month
router.get("/revenue-trend", async (req, res, next) => {
  try {
    const results = await Product.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          products: { $sum: 1 },
          totalQuantity: { $sum: "$inventory.quantity" },
          totalValue: {
            $sum: { $multiply: ["$price", "$inventory.quantity"] }
          }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    res.json(results);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
