//add , edit , view one/all users, view by role, delete user, change role, disable/enable account
const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.addUser = async (req, res) => {
  try {
    const { email, name, role } = req.body;
    const password = "password123"; // Consider generating a strong random password or requiring it from req.body

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const findEmail = await User.findOne({ email });
    if (findEmail) {
      return res
        .status(400)
        .json({ message: "This email is already a registered user" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      name,
      password: hashedPassword,
      role,
      // deliveryAddresses will default to an empty array, and any new addresses
      // added later will automatically get a uuid for addressId.
    });
    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error adding user:", error); // More descriptive error logging

    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

exports.editUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const payload = req.body;
    const updateUser = await User.findByIdAndUpdate(userId, payload, { new: true });
    if (!updateUser)
      return res.status(400).json({ message: "could not update user" });
    res.status(200).json({ message: "user updated successfully", user:updateUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
const users = await User.find()
  .sort({ createdAt: -1 })
  .select("-password")
  .lean();

    const count = await User.countDocuments();
    res.json({users, total:count});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
exports.getOneUser = async (req, res) => {
  try {
    const userId = req.params.userId;
const user = await User.findById(userId)
  .select("-password")
  .lean();

    if (!user) return res.status(404).json({ message: "user not found" });
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(400).json({ message: "user not deleted" });
    res.status(200).json({ message: "user deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
exports.getUsersByRole = async (req, res) => {
  try {
    const role = req.query.role;
    const users = await User.find({role}).select("-password").lean();
    if (!users) return res.status(400).json({ message: "users not found" });
       const count = await User.countDocuments();
    res.json({users, total:count});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
exports.changeUserRole = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { role } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "user not found" });
    user.role = role;
    await user.save();
    res.status(200).json({ message: "user role updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
// exports.disableUser = async (req, res) => {
//   try {
//     const userId = req.params.userId;
//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ message: "user not found" });
//     user.isDisabled = true;
//     await user.save();
//     res.status(200).json({ message: "user disabled successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// };
// exports.enableUser = async (req, res) => {
//   try {
//     const userId = req.params.userId;
//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ message: "user not found" });
//     user.isDisabled = false;
//     await user.save();
//     res.status(200).json({ message: "user enabled successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// };
exports.toggleUserStatus = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { isDisabled } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isDisabled },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res
      .status(200)
      .json({
        message: `User ${isDisabled ? "disabled" : "enabled"} successfully`,
        user,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
