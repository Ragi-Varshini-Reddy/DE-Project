const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "USD" },
    category: { type: String, default: "general" },
    tags: [{ type: String, trim: true }],
    images: [{ type: String, trim: true }],
    inventory: {
      quantity: { type: Number, default: 0, min: 0 },
      backorder: { type: Boolean, default: false }
    },
    attributes: { type: mongoose.Schema.Types.Mixed, default: {} },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

productSchema.index({ name: "text", category: "text", tags: "text" });

module.exports = mongoose.model("Product", productSchema);
