
const mongoose = require('mongoose');

// Define the product schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['Fruits', 'Vegetables', 'Grains', 'Dairy', 'Other'], 
  },
  prices: {
    price_1kg: { type: Number, required: true }, // Price for 1kg
    price_500g: { type: Number, required: true }, // Price for 500g
    price_250g: { type: Number, required: true }, // Price for 250g
  },
  visibility: { 
    type: String, 
    enum: ['visible', 'hidden'], 
    default: 'visible', 
  },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Product', productSchema);
