const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');

// Place Order
router.post('/placeOrder', async (req, res) => {
  const { userId, farmerId, items, address } = req.body;

  try {
    // Map items to include negotiated price if available
    const orderItems = items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.negotiatedPrice || item.originalPrice, // Use negotiated price if available
    }));

    // Create the order
    const order = new Order({
      userId,
      farmerId,
      items: orderItems,
      address,
      status: 'Pending',
    });

    const savedOrder = await order.save();
    res.status(201).json({ success: true, order: savedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
