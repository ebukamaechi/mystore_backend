const express = require('express');
const {addToCart,getCart,clearCart,removeItem,updateQuantity,getCartTotal} = require("../controllers/cartController");
const {authenticateUser, authorizeRoles}=require("../middlewares/authMiddleware");

const router = express.Router();
router.post("/remove-cart-item/:productId", authenticateUser, authorizeRoles("customer"), removeItem);

router.post("/update-quantity/:productId", authenticateUser, authorizeRoles("customer"), updateQuantity);

router.post("/clear", authenticateUser, authorizeRoles("customer"), clearCart);


router.get("/cart-total", authenticateUser, authorizeRoles("customer"), getCartTotal);

router.post("/", authenticateUser, authorizeRoles("customer"), addToCart);

router.get("/", authenticateUser, authorizeRoles("customer"), getCart);

module.exports = router;