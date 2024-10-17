const Product = require('../models/Product'); // Assuming you have a Product model

// Function to add a product
const addProduct = async (req, res) => {
  const { name, price, quantity, minQuantityForNegotiation } = req.body;

  try {
    if (!name || !price || !quantity || !minQuantityForNegotiation || !req.file) {
      return res.status(400).json({ msg: 'All fields are required' });
    }

    const newProduct = new Product({
      name,
      price,
      quantity,
      minQuantityForNegotiation,
      image: req.file.path, // Path to the uploaded image
      farmer: req.user._id // Farmer's ID from the decoded token
    });

    await newProduct.save();
    res.status(201).json(newProduct); // Return the created product
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

// Function to fetch all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find(); // Fetch all products
    res.status(200).json({ message: 'Fetched products successfully', products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

module.exports = {
  addProduct,
  getProducts,
};
