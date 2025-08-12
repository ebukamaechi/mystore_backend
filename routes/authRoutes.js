const express = require("express");

const {
  register,
  login,
  logout,
  currentUser,
} = require("../controllers/authController");
const {
  authenticateUser,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

const router = express.Router();

//register route
router.post("/register", register);

//login route
router.post("/login", login);

//me route
router.get("/me", authenticateUser, currentUser);

//logout
router.post("/logout", logout);

module.exports = router;
