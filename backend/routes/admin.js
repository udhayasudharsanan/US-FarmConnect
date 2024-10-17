const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Certify Farmer (Admin only)
router.put('/certify-farmer/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'farmer') {
      return res.status(400).json({ msg: 'Invalid farmer' });
    }

    user.certified = true;
    await user.save();
    res.status(200).json({ msg: 'Farmer certified successfully' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Manage Products
router.delete('/delete-product/:id', authMiddleware, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ msg: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Manage Users (Admin only)
router.get('/users', authMiddleware, async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
