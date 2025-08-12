const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid"); // Import uuid for generating unique IDs

const addressSchema = new mongoose.Schema({
  addressId: {
    type: String,
    // We keep required: true because every address should have an ID.
    // We remove unique: true as it causes issues with null and global uniqueness for embedded docs.
    // We add a default value to ensure it's always unique upon creation.
    default: uuidv4, // Automatically generate a UUID for addressId
  },
  fullName: {
    type: String,
    required: true,
  },
  streetAddress: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zipCode: {
    type: String,
  },
  country: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
});

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    name: String,
    password: String,
    role: {
      type: String,
      enum: ["customer", "accounts", "inventory", "admin", "superAdmin"],
      default: "customer",
    },
    deliveryAddresses: {
      type: [addressSchema],
      default: [],
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
module.exports = User;
