const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      // type: mongoose.Schema.Types.ObjectId,
      // ref:"Product",
      required: true,
    },
    name: String,
    price: Number,
    quantity: Number,
    imageUrl: String,
    selectedVariation: {
      type: {
        type: String,
      },
      value: String,
    },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: [cartItemSchema],
  // paymentMethod:{
  //   type:String,
  //   enum:["COD", "Paystack"],
  //   default:"Paystack",
  // },
  updatedAt: { type: Date, default: Date.now },
});

const Cart = mongoose.model("Cart", cartSchema);
module.exports=Cart;
