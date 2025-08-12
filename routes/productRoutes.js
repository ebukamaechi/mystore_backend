const express = require("express");
const {
  authenticateUser,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const router = express.Router();

const {
  createProduct,
  getAllProducts,
  getProductById,
  deleteProduct,
  updateProduct,
  viewBasedOnCategory,
  addVariation,
  changeProductCategory,
  changeActiveStatus,
  updateStock,
  updatePrice,
} = require("../controllers/productController");


// Create a new product
router.post("/", authenticateUser, authorizeRoles("admin","superAdmin","inventory"), createProduct);

// Get all products
router.get("/", getAllProducts);

// Get a single product by ID
router.get("/:productId", getProductById);

// Delete a product
router.delete("/:productId", authenticateUser, authorizeRoles("admin"), deleteProduct);

// Update a product
router.put("/:productId", authenticateUser, authorizeRoles("admin"), updateProduct);

// View products based on category
router.get("/category/:categoryId", viewBasedOnCategory);

// Add a variation to a product
router.post("/:productId/variations", authenticateUser, authorizeRoles("admin"), addVariation);

// Change product category
router.put("/:productId/category", authenticateUser, authorizeRoles("admin"), changeProductCategory);

// Change active status
router.put("/:productId/status", authenticateUser, authorizeRoles("admin"), changeActiveStatus);

// Update stock
router.put("/:productId/stock", authenticateUser, authorizeRoles("admin"), updateStock);

// Update price
router.put("/:productId/price", authenticateUser, authorizeRoles("admin"), updatePrice);

module.exports=router;