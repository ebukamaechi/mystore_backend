const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Payment = require("../models/Payment");
const Product = require("../models/Product");
const crypto = require("crypto");

// -------------------//
const generateTrackingNumber = (prefix = "TRK", length = 10) => {
  const randomString = crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length)
    .toUpperCase();
  return `${prefix}-${randomString}`;
};
// --------------------//

exports.placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reference, paymentMethod, shippingAddress } = req.body;
    const trackingNumber = generateTrackingNumber();

    const calculateTotalAmount = (items) =>
      items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // if payment method is cash on delivery, create order directly
    if (paymentMethod === "Cash on Delivery") {
      // If payment method is COD, create order directly
      const cart = await Cart.findOne({ userId });
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      const order = new Order({
        userId,
        items: cart.items,
        trackingNumber,
        totalAmount: calculateTotalAmount(cart.items),
        amountPaid: 0, // COD means no payment yet
        paymentMethod: "Cash on Delivery",
        paymentStatus: "pending", // Payment status is pending for COD
        status: "pending",
        shippingAddress,
        orderDate: new Date(),
      });
      await order.save();
      // 4. Reduce stock for each item in the order
      await reduceStock(cart.items);

      //insert pending payment
      const payment = new Payment({
        user: userId,
        orderId: order._id, // ✅ Add this to create direct linkage
        amount: calculateTotalAmount(cart.items),
        paymentStatus: "pending",
      });

      await payment.save();

      // Clear cart after order is placed
      await Cart.findOneAndDelete({ userId });
      return res
        .status(201)
        .json({ message: "Order placed successfully", order });
    }

    // If payment method is Paystack, verify payment first
    if (!reference || !shippingAddress) {
      return res
        .status(400)
        .json({ message: "Reference and shipping address are required" });
    }

    // 1. Confirm payment is successful
    const payment = await Payment.findOne({ reference, user: userId });

    if (!payment || payment.paymentStatus !== "paid") {
      return res.status(400).json({ message: "Payment not verified" });
    }

    // 2. Get cart
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }
    // 3. Create order
    const order = new Order({
      userId,
      items: cart.items,
      trackingNumber,
      totalAmount: calculateTotalAmount(cart.items),
      amountPaid: payment.amount,
      paymentMethod: "Paystack",
      paymentStatus: "paid",
      status: "pending",
      shippingAddress,
      orderDate: new Date(),
    });

    await order.save();
    // 4. Reduce stock for each item in the order
    await reduceStock(cart.items);

    // 4. Link payment to order
    payment.orderId = order._id;
    await payment.save();

    // 5. Clear cart
    await Cart.findOneAndDelete({ userId });

    return res
      .status(201)
      .json({ message: "Order placed successfully", order });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to place order", error: error.message });
  }
};

/// work on stock reduction logic

// -------------------------------------------------
// services/stockService.js

const reduceStock = async (items) => {
  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) continue;

    if (item.selectedVariation?.type && item.selectedVariation?.value) {
      const variation = product.variations.find(
        (v) =>
          v.type === item.selectedVariation.type &&
          v.value === item.selectedVariation.value
      );
      if (!variation || variation.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }
      variation.stock -= item.quantity;
    } else {
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }
      product.stock -= item.quantity;
    }

    await product.save({ validateBeforeSave: false });
  }
};

// ------------------------------------------------------//

exports.acceptOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const newStatus = "processing";
    // const trackingNumber = generateTrackingNumber();

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (["shipped", "cancelled"].includes(order.status)) {
      return res.status(400).json({ message: "Order already processed" });
    }
    if (order.status === "delivered") {
      return res.status(400).json({ message: "Order already delivered" });
    }
    order.status = newStatus;
    trackingNumber = order.trackingNumber;

    // order.trackingNumber = trackingNumber;

    //go through order items and generate a tracking number concatenated with trackingNumber
    //items will get their personalised tracking number when the admin has accepted the order
    order.items.forEach((item, index) => {
      item.trackingNumber = `${trackingNumber}-${index + 1}`;
    });

    await order.save();

    res.status(200).json({ message: "Order accepted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to place order", error: error.message });
  }
};
exports.viewOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "No orders found" });

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
exports.viewOrdersByCustomer = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId });
    if (!orders) return res.status(404).json({ message: "No Orders found" });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
exports.viewAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    if (!orders) return res.status(404).json({ message: "No Orders found" });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
exports.viewOrdersByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    const orders = await Order.find({ status });
    if (!orders) return res.status(404).json({ message: "No Orders found" });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.reassignDeliveryDate = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByIdAndUpdate(
      orderId,
      { $set: req.body },
      { new: true }
    );

    if (!order)
      return res
        .status(400)
        .json({ message: "could not update the delivery date" });
    res.status(200).json({ message: "update successful", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
