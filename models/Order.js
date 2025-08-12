const mongoose = require('mongoose');

const variationSchema = new mongoose.Schema({
  type: { type: String },
  value: { type: String }
}, { _id: false });

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      // type: mongoose.Schema.Types.ObjectId,
      type:String,
      // ref:"Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    selectedVariation: {
      type: variationSchema,
      default: null,
    },
    trackingNumber: {
      type: String,
      default: null,
    },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  streetAddress: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true },
  phoneNumber: { type: String, required: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId: {
    // type: mongoose.Schema.Types.ObjectId,
    type:String,
    required: true,
    // ref: 'User'
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  totalAmount: {
    type: Number,
    required: true
  },
  amountPaid: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  shippingAddress: {
    type: shippingAddressSchema,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['Credit Card', 'Paystack', 'Mobile Money', 'Cash on Delivery'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'pending', 'failed'],
    default: 'pending'
  },
  items: {
    type: [orderItemSchema],
    required: true
  },
  trackingNumber: {
    type: String,
    default: null
  },
  deliveryDate: {
    type: Date,
    default: null
  }
});

const Order = mongoose.model('Order', orderSchema);
module.exports=Order;