require("dotenv").config();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.register = async (req, res) => {
  const { email, name, password, role } = req.body;
  try {
    if (!email) return res.status(400).json({ message: "email is required" });

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      name,
      password: hashedPassword,
      role,
    });
    await newUser.save();

    res.status(201).json({ message: `${role} registered successfully` });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error during registration" });
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "user not found" });
    if (user.isDisabled === true)
      return res.status(400).json({ message: "user is disabled" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "invalid password" });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("login_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Ensure this is true in production (https)
      maxAge: 24 * 60 * 60 * 1000, // 1 day expiration
      sameSite: "strict", // Security to prevent CSRF
    });
    res.json({
        message:"Login Successful",
        token,
        user:{name:user.name, email:user.email, role:user.role},
    });


  } catch (error) {
       console.error(error);
    res.status(500).json({ message: `Login failed: ${error.message}` });
  }
};


exports.currentUser = async (req,res)=>{
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    if(!user) return res.status(404).json({message:"user not found"});
    res.json({
      user:{
        _id:user._id,
        name:user.name,
        email:user.email,
        role:user.role,
        isDisabled:user.isDisabled,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({message:"Server error"});
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie("login_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Logout error somewhere here" });
  }
};
