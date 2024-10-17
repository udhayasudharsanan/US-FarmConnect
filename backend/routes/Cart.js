const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Cart = require('../models/Cart');
const auth = require('../middleware/authMiddleware'); // Assuming you have auth middleware

// Route to fetch the cart for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ customerId: req.user.userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }
    res.status(200).json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

  
  /* router.get('/cart', auth, async (req, res) => {
    const customerId = req.user.userId;
    const cart = await Cart.findOne({ customerId });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }
    res.json({ success: true, cart });
  }); */
  

// Route to add an item to the cart
router.post('/add', auth, async (req, res) => {
  const { productId, quantity, price } = req.body;
  const customerId = req.user.userId;

  try {
    let cart = await Cart.findOne({ customerId });

    if (!cart) {
      cart = new Cart({ customerId, items: [] });
    }

    // Check if the product already exists in the cart
    const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    if (existingItemIndex >= 0) {
      // Update quantity and price if the product is already in the cart
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].price = price;
    } else {
      // Add new product to cart
      cart.items.push({ productId, quantity, price });
    }

    await cart.save();

    res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ success: false, message: 'Failed to add item to cart' });
  }
});

// Route to update the cart item quantity or price
router.put('/update', auth, async (req, res) => {
  const { productId, quantity, price } = req.body;
  const customerId = req.user.userId;

  try {
    const cart = await Cart.findOne({ customerId });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    if (itemIndex >= 0) {
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].price = price;

      await cart.save();

      res.status(200).json({ success: true, cart });
    } else {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ success: false, message: 'Failed to update cart' });
  }
});

// Route to remove an item from the cart
router.delete('/remove/:productId', auth, async (req, res) => {
  const { productId } = req.params;
  const customerId = req.user.userId;

  try {
    const cart = await Cart.findOne({ customerId });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);

    await cart.save();

    res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ success: false, message: 'Failed to remove item from cart' });
  }
});

module.exports = router;
