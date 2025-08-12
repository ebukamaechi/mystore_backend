const express = require("express");
const {createCategory,editCategory,fetchCategories,fetchOneCategory,deleteCategory} = require("../controllers/categoryController");
const {authenticateUser, authorizeRoles} =require("../middlewares/authMiddleware");
const router = express.Router();


//all the category routes
router.post("/", authenticateUser, authorizeRoles("admin","superAdmin","inventory","customer"),createCategory);
router.get("/",authenticateUser, authorizeRoles("admin","superAdmin","inventory", "customer"),fetchCategories);
router.get("/:categoryId",authenticateUser, authorizeRoles("admin","superAdmin","inventory","customer"),fetchOneCategory);
router.put("/:categoryId", authenticateUser, authorizeRoles("admin","superAdmin","inventory"), editCategory);
router.delete("/:categoryId", authenticateUser, authorizeRoles("admin","superAdmin","inventory"), deleteCategory );



module.exports=router;