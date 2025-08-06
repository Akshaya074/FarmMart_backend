const Product = require('../models/Product');

// Add a new product
exports.addProduct = async (req, res) => {
  const { name, category, price, image, description } = req.body;
  try {
    const newProduct = new Product({ name, category, price, image, description });
    await newProduct.save();
    return res.status(201).json({ message: 'Product added successfully', product: newProduct });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to add product' });
  }
};

// Update an existing product
exports.updateProduct = async (req, res) => {
  const { productId } = req.params;
  const { name, category, price, image, description } = req.body;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(productId, { name, category, price, image, description }, { new: true });
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to update product' });
  }
};

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    return res.status(200).json(products);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to fetch products' });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  const { productId } = req.params;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.status(200).json(product);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to fetch product' });
  }
};
