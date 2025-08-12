const mongoose = require("mongoose");

const variationSchema = new mongoose.Schema(
  {
    type: String,
    value: String,
  },
  { _id: false }
);

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  category: {
    // type: mongoose.Schema.Types.ObjectId,
    // ref: "Category",
    type:String
  },
  variations: [variationSchema], // Example: size, color
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
