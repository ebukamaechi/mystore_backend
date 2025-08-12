require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const authRoute = require("./routes/authRoutes.js");
const categoryRoute = require("./routes/categoryRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const productRoutes = require("./routes/productRoutes.js");
const cartRoutes = require("./routes/cartRoutes.js");
const orderRoutes = require("./routes/orderRoutes.js");
const paymentRoutes = require("./routes/paymentRoutes.js");
const app = express();

app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [`${process.env.FRONTEND_URL}`,`${process.env.ADMIN_FRONTEND_URL}`],
    credentials: true,
  })
);

app.use(express.static(path.join(__dirname, "views")));
app.get("/", (req, res) => {
  try {
    res.sendFile(path.join(__dirname, "index.html"));
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//routes
app.use("/api/auth", authRoute);

app.use("/api/users", userRoutes);

app.use("/api/products", productRoutes);

app.use("/api/categories", categoryRoute);

app.use("/api/cart", cartRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/payments", paymentRoutes);

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

console.log("attempting to connect to MongoDB...");

mongoose
  .connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`SERVER RUNNING ON http://localhost:${PORT}`));
  })
  .catch((error) => console.log(error));
  mongoose.connection.on("connecting", () => {
  console.log("🔄 MongoDB is connecting...");
});

mongoose.connection.on("connected", () => {
  console.log("✅ Mongoose is connected to MongoDB.");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ Mongoose connection error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ Mongoose disconnected.");
});
