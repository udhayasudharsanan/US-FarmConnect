const express = require('express');
const multer = require('multer');
const Product = require('../models/Product');
const cloudinary = require('cloudinary').v2;
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Configure multer for image uploads
// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for image uploads (no local storage needed)
const storage = multer.memoryStorage(); // Store images in memory
const upload = multer({ storage: storage })






// POST route for adding a product
router.post('/add', [authMiddleware, upload.single('image')], async (req, res) => {
  const { name, price, quantity, minQuantityForNegotiation } = req.body;

  try {
    // Validate the incoming request data
    if (!name || !price || !quantity || !minQuantityForNegotiation ) {
      return res.status(400).json({ msg: 'All fields are required' });
    }
    console.log("Farmer ID:", req.user.userId);
    // Create new product instance
    const newProduct = new Product({
      name,
      price,
      quantity,
      minQuantityForNegotiation,
      image: req.file.path, // Path to the uploaded image
      farmer: req.user.userId // Set farmer's ID from the authenticated user
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error adding product:', error); // Log the error for debugging
    res.status(500).json({ message: 'Internal Server Error', error });
  }
});


// GET all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().populate('farmer', 'certified name'); // Database query
    res.json({ message: 'Fetched products successfully', products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET products for the logged-in farmer
router.get('/farmer', authMiddleware, async (req, res) => {
  try {
    const farmerId = req.user.userId; // Assuming `userId` represents the farmer ID from auth
    const products = await Product.find({ farmer: farmerId });
    if (!products || products.length === 0) {
      return res.status(404).json({ message: 'No products found for this farmer' });
    }
    res.status(200).json({ message: 'Fetched farmer products successfully', products });
  } catch (error) {
    console.error('Error fetching farmer products:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// DELETE route to delete a product by ID
router.delete('/:id', [authMiddleware, upload.single('image')], async (req, res) => {
  const { name, price, quantity, minQuantityForNegotiation } = req.body;
  const productId = req.params.id;

  try {
      const deletedProduct = await Product.findByIdAndDelete(
          productId,
          { name, price, quantity, minQuantityForNegotiation, image: req.file ? req.file.path : undefined },
          { new: true, runValidators: true }
      );

      if (!deletedProduct) {
          return res.status(404).json({ msg: 'Product not found' });
      }

      res.status(200).json(deletedProduct);
  } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ msg: 'Internal server error' });
  }
});



module.exports = router;


