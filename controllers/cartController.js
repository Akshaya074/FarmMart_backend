const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { ObjectId } = require('mongodb');

const mongoose = require('mongoose');


// Add product to cart
exports.addToCart = async (req, res) => {
  const { productId, quantity, weight, price, total } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find the user's cart
    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      // Create a new cart if it doesn't exist
      cart = new Cart({ userId: req.user.id, items: [] });
    }

    // Check if the product is already in the cart
    const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId && item.weight === weight);

    if (existingItemIndex !== -1) {
      // Update quantity and price for the existing item
      const item = cart.items[existingItemIndex];
      item.quantity += quantity; // Update quantity
      item.total = price * item.quantity; // Recalculate total price
    } else {
      // Add a new item to the cart
      cart.items.push({
        productId,
        quantity,
        weight,
        price,
        total,
      });
    }
   

    // Save the updated cart
    await cart.save();
    return res.status(200).json({ message: "Item added to cart", cart });
  } catch (err) {
    console.log("There is error on backend")
    return res.status(500).json({ message: err.message });
  }
};

// Get cart items for a user
exports.getCart = async (req, res) => {
  const userId = req.user.id; // Get the userId from the URL parameters
     
  try {
    const cart = await Cart.findOne({ userId })
   
    if (!cart) {
      return res.status(404).json({ message: "" });
    }

    // Format the cart for a better response
    const formattedCart = cart.items.map(item => ({
      product: item.productId,
      quantity: item.quantity,
      weight: item.weight,
      price: item.price,
      total: item.total,
    }));
  

    return res.status(200).json({ message: "Cart fetched successfully", cart: formattedCart });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.updateCart = async (req, res) => {
  try {
    const { itemId } = req.params;  // The `itemId` refers to `product._id` in the request
    const { quantity } = req.body;
    
    if (quantity <= 0) {
      return res.status(400).json({ message: "Quantity must be greater than 0" });
    }

    // Assuming that verifyToken middleware sets req.user.id correctly
    const cart = await Cart.findOne({ userId: req.user.id });

    // Log cart to inspect the structure

    // Check if the cart was found
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find the index of the item in the cart using product._id
    const itemIndex = cart.items.findIndex((item) => item.productId.toString() === itemId,);
    

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // Ensure that the item has the correct structure
    const item = cart.items[itemIndex];
    
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].total = cart.items[itemIndex].price * quantity;  // Update total price

    await cart.save();

    // Send the updated cart items as the response
    res.status(200).json(cart.items);
  } catch (err) {
    console.error("Error updating cart item:", err);
    res.status(500).json({ message: "An error occurred while updating the cart item" });
  }
};

exports.removeItemFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;  // This should match product._id from frontend
    const userId = req.user.id; // Extract user ID from the request

    if (!userId) {
      return res.status(400).json({ message: 'User ID is missing' });
    }

    const objectIdItemId = new mongoose.Types.ObjectId(itemId);  // Convert the `itemId` to ObjectId

    // Use $pull to remove the item with matching product._id from the user's cart
    const result = await Cart.updateOne(
      { userId: new mongoose.Types.ObjectId(userId) }, // Find the cart by userId
      { $pull: { items: { 'productId': objectIdItemId } } }  // Pull item with matching productId
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'Item not found in cart or already removed' });
    }

    res.json({ message: 'Product removed from cart' });
  } catch (err) {
    console.error("Error in backend:", err);
    res.status(500).json({ message: 'Error removing product from cart', error: err.message });
  }
};

