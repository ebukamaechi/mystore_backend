const Cart = require("../models/Cart");
const Product = require("../models/Product");
// add to cart,
// get cart, update cart,
//update cart item
// update quantity of cartitem
//remove item from cart,
// clear cart
//calculate total price of cart
//set payment method
// Add to Cart
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, name, price, quantity, imageUrl, selectedVariation } =
      req.body;

    if (!productId || !quantity) {
      return res
        .status(400)
        .json({ message: "ProductID and quantity are required" });
    }

    const qty = parseInt(quantity);

    // 1. Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 2. Check stock availability
    let availableStock = product.stock;

    if (selectedVariation) {
      const variation = product.variations.find(
        (v) =>
          v.type === selectedVariation.type &&
          v.value === selectedVariation.value
      );

      if (!variation) {
        return res
          .status(400)
          .json({ message: "Selected variation not found" });
      }

      // if (variation.stock != null) {
      //   availableStock = variation.stock;
      // }
    }

    // Check stock before adding
    if (qty > availableStock) {
      return res.status(400).json({ message: "Insufficient stock available" });
    }

    // 3. Get or create cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // 4. Check if item already exists in cart
    const existingItem = cart.items.find(
      (item) =>
        item.productId === productId &&
        JSON.stringify(item.selectedVariation) ===
          JSON.stringify(selectedVariation)
    );

    if (existingItem) {
      // Prevent going over stock
      if (existingItem.quantity + qty > availableStock) {
        return res
          .status(400)
          .json({ message: "Adding this quantity exceeds stock limit" });
      }
      existingItem.quantity += qty;
    } else {
      const newItem = {
        productId,
        name,
        price,
        quantity: qty,
        imageUrl,
        selectedVariation,
      };
      cart.items.push(newItem);
    }

    // 5. Save updated cart
    cart.updatedAt = Date.now();
    await cart.save();

    res.status(200).json({ message: "Item added to cart successfully", cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Get Cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ userId });

    if (!cart || cart.items.length === 0)
      return res.status(200).json({ items: [], total: 0 });
    const total = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity
    );

    return res.status(200).json({ cart, total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
exports.getCartTotal = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0)
      return res.status(400).json({ total: 0 });

    const total = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    return res.status(200).json({ total });
  } catch (error) {
    console.error("Update quantity error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOneAndDelete({ userId });
    if (!cart) return res.status(404).json({ message: "cart not found" });
    res.status(200).json({ message: "cart cleared" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

//remove item
exports.removeItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    cart.items.splice(itemIndex, 1); // remove the item
    await cart.save();

    res.status(200).json({ message: "Item removed from cart", cart });
  } catch (error) {
    console.error("Remove item error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateQuantity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { quantity } = req.body;
    const qty = parseInt(quantity);
    if (!qty || qty < 1) {
      return res
        .status(400)
        .json({ message: "Quantity must be a positive integer" });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find((item) => item.productId === productId);

    if (!item) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    item.quantity = quantity;
    await cart.save();

    res.status(200).json({ message: "Item quantity updated", cart });
  } catch (error) {
    console.error("Update quantity error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
