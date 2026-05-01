const express = require("express");
const cors = require("cors");
const productsRouter = require("./routes/products");
const analyticsRouter = require("./routes/analytics");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/products", productsRouter);
app.use("/api/analytics", analyticsRouter);

app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({
    message: err.message || "Server error",
    details: err.errors || undefined
  });
});

module.exports = app;
