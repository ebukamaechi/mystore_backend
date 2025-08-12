const express = require("express");

const {
  toggleUserStatus,
  addUser,
  editUser,
  getAllUsers,
  getOneUser,
  deleteUser,
  getUsersByRole,
  changeUserRole,
  disableUser,
  enableUser,
} = require("../controllers/userController");
const {
  authenticateUser,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const router = express.Router();

router.post(
  "/",
  authenticateUser,
  authorizeRoles("admin", "superAdmin"),
  addUser
);
router.get(
  "/",
  authenticateUser,
  authorizeRoles("admin", "superAdmin"),
  getAllUsers
);
router.get(
  "/users-by-role",
  authenticateUser,
  authorizeRoles("admin", "superAdmin"),
  getUsersByRole
);
router.put(
  "/change-role/:userId",
  authenticateUser,
  authorizeRoles("admin", "superAdmin"),
  changeUserRole
);
// router.put("/enable-user/:userId", enableUser);
// router.put("/disable-user/:userId", disableUser);
router.put("/toggle-user-status/:userId", toggleUserStatus);
router.get(
  "/:userId",
  authenticateUser,
  authorizeRoles("admin", "superAdmin"),
  getOneUser
);
router.put(
  "/:userId",
  authenticateUser,
  authorizeRoles("admin", "superAdmin"),
  editUser
);
router.delete(
  "/:userId",
  authenticateUser,
  authorizeRoles("admin", "superAdmin"),
  deleteUser
);

module.exports = router;
