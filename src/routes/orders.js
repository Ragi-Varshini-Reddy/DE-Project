const express = require("express");
const Order = require("../models/Order");

const router = express.Router();

// Create order (used to generate sales data)
router.post("/", async (req, res, next) => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
});

// Get orders
router.get("/", async (req, res, next) => {
  try {
    const { status, start, end } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (start || end) {
      filter.orderedAt = {};
      if (start) filter.orderedAt.$gte = new Date(start);
      if (end) filter.orderedAt.$lte = new Date(end);
    }

    const orders = await Order.find(filter).sort({ orderedAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
