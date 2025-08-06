const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer", required: true },
  name: { type: String, required: true },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true },
      weight: { type: String, required: true },
      price: { type: Number, required: true },
      total: { type: Number, required: true },
    },
  ],
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  deliveryAddress: { type: String, required: true },
  phoneNumber: { type: String, required: true }, // New field for phone number
  email: { type: String, required: true }, // New field for email
  status: { type: String, default: "Processing" }, // New field for order status with default value "Processing"
  deliveryTime: { type: String, default: "3-5 days" }, // New field for delivery time with default value "3-5 days"
},
  { timestamps: true }
);

// Create and export the model
module.exports = mongoose.model("Order", orderSchema);