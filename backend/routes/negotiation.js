const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Negotiation = require('../models/Negotiation'); // Assuming you have a Negotiation model
const Product = require('../models/Product'); // Import the Product model
const auth = require('../middleware/authMiddleware.js');
const Cart = require('../models/Cart');


// Route to create a negotiation request from the customer
router.post('/', auth, async (req, res) => {
  const { productId, message, requestedPrice } = req.body;
  // Ensure customerId is correctly set from req.user
  const customerId = req.user.userId; // This should match how you're setting it in the auth middleware
   // Log productId and customerId for debugging
  console.log("Received productId in frontend request:", productId);
  console.log("CustomerId from auth:", customerId);
  //console.log("Sending negotiation with", { productId: itemId, farmerId, message, requestedPrice });


  if (!customerId) {
    return res.status(400).json({ success: false, message: 'Customer ID is required' });
  }
  // Log productId for debugging
  console.log("Received productId:", productId);
  try {
    // Fetch the product to get the farmerId
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const farmerId = product.farmer; // Assuming your product model has a farmerId field

    const negotiation = new Negotiation({
      productId,
      customerId, // Use the extracted customerId
      farmerId, // Include farmerId in the negotiation
      message,
      requestedPrice,
      status: 'pending',
    });
    console.log("Received data in backend:");
  console.log("Product ID:", productId);
  console.log("Customer ID:", customerId);
  console.log("Farmer ID:", farmerId);
  console.log("Message:", message);
  console.log("Requested Price:", requestedPrice);

    await negotiation.save();
    res.status(200).json({ success: true, negotiation });
  } catch (error) {
    console.error('Error saving negotiation request:', error);
    res.status(500).json({ success: false, message: 'Failed to send negotiation request' });
  }
});

// Route to get negotiation requests for a farmer
router.get('/requests', auth, async (req, res) => {
  try {
    const farmerId = req.user.userId; // Farmer ID from auth middleware
    const requests = await Negotiation.find({ farmerId }).populate('productId');
    res.status(200).json({ success: true, requests });
  } catch (error) {
    console.error('Error fetching negotiation requests:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch negotiation requests' });
  }
});

// Route to respond to a negotiation request
router.post('/respond', auth, async (req, res) => {
  const { productId, newPrice, customerId } = req.body; // Ensure customerId is in the request body
  // Log to verify correct IDs
  console.log('Product ID:', productId);
  console.log('Customer ID:', customerId);
  console.log('Farmer ID:', req.user.userId); // Farmer's ID
  // Get the farmer's ID from the authentication token
  const farmerId = req.user.userId;

  try {
    // Convert productId, customerId, and farmerId to ObjectId
    const negotiation = await Negotiation.findOneAndUpdate(
      {
        productId: new mongoose.Types.ObjectId(productId),
        customerId: new mongoose.Types.ObjectId(customerId),
        farmerId: new mongoose.Types.ObjectId(farmerId),
      },
      { negotiatedPrice: newPrice, status: 'accepted' },
      { new: true } // Return the updated document
    );

    if (!negotiation) {
      return res.status(404).json({ success: false, message: 'Negotiation not found' });
    }

    // Update cart after negotiation is accepted
let cart = await Cart.findOne({ customerId: new mongoose.Types.ObjectId(customerId) });

if (!cart) {
  cart = new Cart({
    customerId: new mongoose.Types.ObjectId(customerId),
    items: [],
    totalAmount: 0,
  });
}

// Check if the product exists in the cart
const productIndex = cart.items.findIndex(item => item.productId.toString() === productId);

if (productIndex >= 0) {
  // Update the product details and negotiation status
  cart.items[productIndex].price = newPrice;
  cart.items[productIndex].negotiationStatus = 'accepted'; // Update negotiation status
} else {
  // Fetch product details to add new product in the cart
  const product = await Product.findById(productId);

  // Add the product to the cart if it doesn't exist
  cart.items.push({
    productId: new mongoose.Types.ObjectId(productId),
    productName: product.name, // Include product name
    price: newPrice,
    quantity: 1, // Default quantity
    minQuantityForNegotiation: product.minQuantityForNegotiation, // Include min quantity for negotiation
    negotiationStatus: 'accepted' // Set negotiation status to accepted
  });
}

// Recalculate the total amount of the cart
cart.totalAmount = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

await cart.save();


    res.status(200).json({ success: true, negotiation });
  } catch (error) {
    console.error('Error responding to negotiation:', error);
    res.status(500).json({ success: false, message: 'Failed to respond to negotiation' });
  }
});




module.exports = router;
