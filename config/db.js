// config/db.js
require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("attempting to connect to MongoDB...");

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ Mongoose is connected to MongoDB.");
  } catch (err) {
    console.error("❌ Mongoose connection error:", err.message);
    process.exit(1); // Stop the server if DB connection fails
  }
};

// Event listeners for mongoose connection states
mongoose.connection.on("connecting", () => {
  console.log("🔄 MongoDB is connecting...");
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ Mongoose disconnected.");
});

module.exports = connectDB;
