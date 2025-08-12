const Product = require("../models/Product");
const Category = require("../models/Category");

// CRUD product view one, view all,
// view based on category, add variatation,
//  change product category,
//  change active status, update stock, update price
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      imageUrl,
      category,
      variations,
      isActive,
    } = req.body;

    if (!name) return res.status(400).json({ message: "Name is required" });
    if (price == null || isNaN(price))
      return res.status(400).json({ message: "Valid price is required" });
    if (stock == null || isNaN(stock))
      return res.status(400).json({ message: "Valid stock is required" });
    if (!imageUrl)
      return res.status(400).json({ message: "Image URL is required" });
    if (!category)
      return res.status(400).json({ message: "Category is required" });

    const newProduct = new Product({
      name,
      description,
      price,
      stock,
      imageUrl,
      category,
      variations,
      isActive,
    });

    await newProduct.save();
    res
      .status(201)
      .json({ message: "Product created successfully", product: newProduct });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .lean();

    const count = await Product.countDocuments();
    res.status(200).json({ products, count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!productId)
      return res.status(404).json({ message: "ProductID not found" });

    const product = await Product.findById(productId)
      .populate("category", "name")
      .lean();
    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findByIdAndDelete(productId);
    if (!product)
      return res
        .status(404)
        .json({ message: "Product not found or already deleted" });
    res.json({ message: `Product with ID ${productId} deleted successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
exports.updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!productId)
      return res.status(404).json({ message: "ProductID not found" });

    const product = await Product.findByIdAndUpdate(
      productId,
      { $set: req.body },
      { new: true }
    ).populate("category", "name");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product updated successfully", product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.viewBasedOnCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await Category.findById(categoryId);
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    const products = await Product.find({category:categoryId});
      if (!products.length) {
        return res
          .status(404)
          .json({ message: "No products found in this category" });
      }
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.addVariation = async (req, res) => {
    try {
        const { productId } = req.params;
        const { type, value } = req.body;
    
        if (!type || !value)
        return res.status(400).json({ message: "Type and value are required" });
    
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Product not found" });
    
        product.variations.push({ type, value });
        await product.save();
    
        res.status(200).json({
        message: "Variation added successfully",
        product,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

exports.changeProductCategory = async (req, res) => {
  try {
    const { productId } = req.params;
    const { categoryId } = req.body;

    if (!categoryId)
      return res.status(400).json({ message: "Category ID is required" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.category = categoryId;
    await product.save();

    res.status(200).json({
      message: "Product category updated successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
// change active status
exports.changeActiveStatus = async (req, res) => {
  try {
    const { productId } = req.params;
    const { isActive } = req.body;

    if (isActive == null)
      return res.status(400).json({ message: "isActive status is required" });

    const product = await Product.findByIdAndUpdate(
      productId,
      { isActive },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json({
      message: `Product ${isActive ? "activated" : "deactivated"} successfully`,
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
exports.updateStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const { stock } = req.body;

    if (stock == null || isNaN(stock))
      return res.status(400).json({ message: "Valid stock is required" });

    const product = await Product.findByIdAndUpdate(
      productId,
      { stock },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json({
      message: "Product stock updated successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.updatePrice = async (req, res) => {
  try {
    const { productId } = req.params;
    const { price } = req.body;

    if (price == null || isNaN(price))
      return res.status(400).json({ message: "Valid price is required" });

    const product = await Product.findByIdAndUpdate(
      productId,
      { price },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json({
      message: "Product price updated successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
