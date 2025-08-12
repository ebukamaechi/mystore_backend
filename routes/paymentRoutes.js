const express = require("express");
const {
  initiatePayment,
  verifyPayment,
  getPaymentStatus,
  getAllPayments,
  getOnePayment,
  getPaymentsByCustomer,
  deletePayment,
  paidCashOnDeliveryPayment,
  initiateRefund,
} = require("../controllers/paymentController");
const {
  authenticateUser,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

const router = express.Router();
router.get(
  "/:paymentId",
  authenticateUser,
  authorizeRoles("customer", "admin"),
  getOnePayment
);
router.post(
  "/order/:orderId",
  authenticateUser,
  authorizeRoles("admin"),
  paidCashOnDeliveryPayment
);
router.get(
  "/user/:userId",
  authenticateUser,
  authorizeRoles("customer", "admin"),
  getPaymentsByCustomer
);

router.post("/verify", authenticateUser, verifyPayment);
router.get(
  "/status",
  authenticateUser,
  authorizeRoles("admin", "customer"),
  getPaymentStatus
);
router.get(
  "/all",
  authenticateUser,
  authorizeRoles("customer", "admin"),
  getAllPayments
);
router.post(
  "/refund",
  authenticateUser,
  authorizeRoles("customer", "admin", "accounts"),
  initiateRefund
);
router.post("/", authenticateUser, initiatePayment);
router.delete(
  "/:paymentId",
  authenticateUser,
  authorizeRoles("admin", "customer"),
  deletePayment
);

module.exports = router;
