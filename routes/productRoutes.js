// routes/productRoutes.js
const express = require("express");
const Product = require("../models/Product");
const User = require("../models/User");
const Review = require("../models/Review");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/add", authMiddleware, async (req, res) => {
  const { name, description, category, quantityOptions, image } = req.body;
  const farmerId = req.user.id;

  try {
    // Basic validation
    if (
      !name ||
      !description ||
      !category ||
      !quantityOptions ||
      !Array.isArray(quantityOptions)
    ) {
      return res.status(400).json({
        message:
          "All required fields must be provided, including valid quantity options.",
      });
    }

    // Validate and process each quantity option
    const prices = {};
    quantityOptions.forEach((option) => {
      const { quantity, basePrice } = option;
      if (!quantity || !basePrice) {
        return res.status(400).json({
          message:
            "Each quantity option must include 'quantity' and 'basePrice'.",
        });
      }

      if (quantity === "1kg") {
        prices.price_1kg = basePrice;
        prices.price_500g = basePrice / 2;
        prices.price_250g = basePrice / 4;
      } else if (quantity === "500g") {
        prices.price_500g = basePrice;
        prices.price_1kg = basePrice * 2;
        prices.price_250g = basePrice / 2;
      } else if (quantity === "250g") {
        prices.price_250g = basePrice;
        prices.price_500g = basePrice * 2;
        prices.price_1kg = basePrice * 4;
      } else {
        return res.status(400).json({
          message:
            "Invalid quantity specified. Only '1kg', '500g', '250g' are allowed.",
        });
      }
    });

    // Create the product
    const newProduct = new Product({
      name,
      description,
      category,
      prices,
      image,
      farmerId,
    });

    // Save the product
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error, could not add product." });
  }
});

router.get("/farmer-username/:id", async (req, res) => {
  try {
    // Fetch the user by ID
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Farmer not found" });
    }

    // Extract the username from the user document
    const username = user.username;

    // Respond with the username
    res.status(200).json({ username });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch farmer details" });
  }
});

// GET route to fetch all products (available to all users)
router.get("/all", async (req, res) => {
  try {
    const products = await Product.find(); // Populate to include farmer info
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

router.get("/related/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find related products with the same category, excluding the original product
    let relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: req.params.id },
    });

    // If no related products are found, fetch any products
    if (relatedProducts.length === 0) {
      relatedProducts = await Product.find({ _id: { $ne: req.params.id } });
    }

    res.status(200).json(relatedProducts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch related products" });
  }
});

router.post("/:id/reviews", authMiddleware, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { id } = req.params; // Product ID

    // Validate the product
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Ensure req.user contains name
    if (!req.user || !req.user.name) {
      return res.status(400).json({ message: "User name is missing" });
    }

    // Create a new review
    const review = new Review({
      name: req.user.name, // Assuming the user name is passed from the auth middleware
      rating,
      comment,
      product: id, // Correct field name 'product' instead of 'productId'
      user: req.user.id, // User ID from the auth middleware
    });

    await review.save();
    res.status(201).json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add review" });
  }
});

router.get("/:id/reviews", async (req, res) => {
  try {
    const { id } = req.params; // Destructure productId from params
    if (!id) {
      console.log(id);
      return res.status(400).json({ message: "Product ID is required" });
    }

    const reviews = await Review.find({ product: id }).populate(
      "user",
      "username"
    );

    if (!reviews || reviews.length === 0) {
      console.log("No reviews at backeground");
      return res
        .status(404)
        .json({ message: "No reviews found for this product" });
    }

    res.status(200).json(reviews);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to fetch reviews", error: err.message });
  }
});

// GET route to fetch products for the logged-in farmer (requires authentication)
router.get("/my-products", authMiddleware, async (req, res) => {
  const farmerId = req.user.id; // Get the farmer's ID from the auth middleware

  try {
    const products = await Product.find({ farmerId });
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// GET route to fetch a single product by its ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const productId = req.params.id; // Retrieve product ID from URL parameter
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    console.log(product);
    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to fetch product", error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting product", error: err.message });
  }
});

// Update Product
router.put("/:id", async (req, res) => {
  try {
    console.log("it is server calling");
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedProduct);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating product", error: err.message });
  }
});
module.exports = router;
