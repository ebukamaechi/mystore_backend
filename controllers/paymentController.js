const Payment = require("../models/Payment");
const Order = require("../models/Order");
const axios = require("axios");

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

exports.initiatePayment = async (req, res) => {
  try {
    userId = req.user.id;
    const { reference, amount } = req.body;
    const refExists = await Payment.findOne({ reference: reference });
    if (refExists)
      return res.status(400).json({ error: "Reference already exists" });

    const newPayment = new Payment({
      user: userId,
      amount: amount,
      reference: reference,
      status: "pending",
    });
    await newPayment.save();
    res.status(201).json({
      message: "Payment Saved",
      payment: newPayment,
      paymentId: newPayment._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  const { reference } = req.body;
  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );
    const paymentData = response.data.data;
    if (paymentData.status !== "success") {
      return res.status(400).json({ error: "Payment not successful" });
    }

    const payment = await Payment.findOneAndUpdate(
      { reference: reference },
      { status: "success", paymentStatus: "paid" },
      { new: true }
    );

    if (!payment) return res.status(400).json({ error: "payment not found" });

    // Send email notification
    // await sendPaymentSuccessEmail(
    //   user.email,
    //   reference,
    //   payment.amount,
    //   payment.quota
    // );
    return res.status(200).json({
      message: "Payment verified and updated",
      status: "success",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to verify payments" + error?.message });
  }
};

exports.paidCashOnDeliveryPayment = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.paymentMethod !== "Cash on Delivery") {
      return res.status(400).json({ message: "This order is not COD" });
    }

    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }
    payment.status = "success";
    payment.paymentStatus = "paid";
    order.paymentStatus = "paid";
    order.status = "processing";

    await payment.save();
    await order.save();

    res.status(200).json({
      message: "COD payment confirmed",
      order,
      payment,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to confirm COD payment: " + error.message });
  }
};

exports.getPaymentStatus = async (req, res) => {
  const { reference } = req.params;
  try {
    const payment = await Payment.findOne({ reference });
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }
    res.status(200).json({ payment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to retrieve payment status" });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find();
    if (!payments)
      return res.status(404).json({ message: "payments not found" });
    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch payments" });
  }
};
exports.getOnePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ message: "payment not found" });
    res.json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch payment" });
  }
};
exports.getPaymentsByCustomer = async (req, res) => {
  try {
    const { userId } = req.params;
    const payments = await Payment.find({ user: userId });
    if (!payments)
      return res.status(404).json({ message: "payments not found" });
    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch payments" });
  }
};
exports.deletePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    if (payment.paymentStatus === "paid") {
      return res
        .status(400)
        .json({ message: "Paid payments cannot be deleted" });
    }
    await Payment.findByIdAndDelete(paymentId);

    res.status(200).json({ message: "payment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete payment" });
  }
};

exports.initiateRefund = async (req, res) => {
  try {
    const { reference } = req.body;
    console.log(reference);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
