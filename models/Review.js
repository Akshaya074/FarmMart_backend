const mongoose = require('mongoose');

// Create Review schema with a reference to the Product model
const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // Reference to the Product model
    required: true
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Optional: if you want to link reviews to users
});

module.exports = mongoose.model('Review', reviewSchema);
