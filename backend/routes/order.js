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

// Update Order Status
router.put('/order/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Customer Orders
router.get('/customer/orders', async (req, res) => {
  const { userId } = req.query;

  try {
    const orders = await Order.find({ userId }).populate('items.productId', 'name');
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Farmer Orders
router.get('/farmer/orders', async (req, res) => {
  const { farmerId } = req.query;

  try {
    const orders = await Order.find({ farmerId }).populate('items.productId', 'name');
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


module.exports = router;
