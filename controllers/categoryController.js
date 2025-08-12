const Category = require("../models/Category");
// const User = require("../models/User");

exports.createCategory = async (req, res) => {
      const {name} = req.body;
    if(!name) return res.status(400).json({message:"field is required"});
  try {
  const newCategory = new Category({
    name:name,
  });
  await newCategory.save();
  res.status(201).json({message:"Category created successfully", category:newCategory});

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error creating category" });
  }
};
exports.fetchOneCategory = async (req, res) => {
  try {
    const {categoryId} = req.params;
    const category = await Category.findById(categoryId);
    if(!category) return res.status(404).json({message:"Category not found"});
    res.json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error creating category" });
  }
};
exports.fetchCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({createdAt:-1});
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error creating category" });
  }
};
exports.editCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const [name] = req.body;

    const updateCategory = await Category.findById(categoryId);
    if (!updateCategory)
      return res.status(404).json({ message: "category not found" });

    updateCategory.name = name || updateCategory.name;

    await updateCategory.save();
    res.status(200).json({ message: "Category updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error creating category" });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const deleteCategory = await Category.findOneAndDelete({ _id: categoryId });
    if (!deleteCategory)
      return res.status(400).json({ message: "could not delete category" });
    res
      .status(200)
      .json({ message: `Category ${categoryId} deleted successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error creating category" });
  }
};
