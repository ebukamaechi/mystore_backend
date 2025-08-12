const express = require("express");
const {
  placeOrder,
  acceptOrder,
  viewAllOrders,
  viewOrder,
  viewOrdersByCustomer,
  viewOrdersByStatus,
  reassignDeliveryDate,
} = require("../controllers/orderController");
const {
  authenticateUser,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authenticateUser, placeOrder);
router.put(
  "/:orderId/accept",
  authenticateUser,
  authorizeRoles("admin"),
  acceptOrder
);
router.get("/", authenticateUser, authorizeRoles("admin"), viewAllOrders);
router.get("/:orderId", authenticateUser, viewOrder);
router.get("/customer/:userId", authenticateUser, viewOrdersByCustomer);
router.get(
  "/status/:status",
  authenticateUser,
  authorizeRoles("admin"),
  viewOrdersByStatus
);
router.put(
  "/delivery/:orderId",
  authenticateUser,
  authorizeRoles("admin"),
  reassignDeliveryDate
);

module.exports = router;
