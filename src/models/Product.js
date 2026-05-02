const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR" },
    inventory: {
      quantity: { type: Number, default: 0, min: 0 }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
