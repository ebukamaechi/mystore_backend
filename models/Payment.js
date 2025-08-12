const mongoose = require("mongoose");
const { stringify } = require("uuid");

const paymentSchema = new mongoose.Schema({
  user: {
    // type: mongoose.Schema.Types.ObjectId,
    // ref: "User",
    type: String,
    required: true,
  },
  orderId: String,
  reference: String,
  amount: Number,
  status: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending",
  },
  paymentStatus: {
    type: String,
    enum: ["paid", "pending", "failed"],
    default: "pending",
  },
});

const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;
