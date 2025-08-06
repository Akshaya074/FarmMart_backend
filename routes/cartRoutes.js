const express = require("express");
const { addToCart, getCart, removeItemFromCart, updateCart } = require("../controllers/cartController");
const verifyToken = require("../middleware/authMiddleware");
const Cart = require("../models/Cart")
const router = express.Router();
// Add product to cart (Ensure verifyToken middleware is used)
router.post("/add", verifyToken, addToCart);

router.get("/", verifyToken, getCart);
router.put("/:itemId", verifyToken, updateCart);

// Remove a product from the cart
router.delete("/:itemId", verifyToken, removeItemFromCart)
module.exports = router;
