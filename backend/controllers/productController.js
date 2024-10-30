const Product = require('../models/Product'); // Assuming you have a Product model

// Function to add a product
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
    
         let imageUrl = '';
    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { resource_type: 'image' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(req.file.buffer);
      });

      imageUrl = uploadResult.secure_url; // Get the URL from the Cloudinary response
    }

    // Ensure that imageUrl is not empty before proceeding
    if (!imageUrl) {
      return res.status(400).json({ msg: 'Image upload failed. Please try again.' });
    }
    // Create new product instance
    const newProduct = new Product({
      name,
      price,
      quantity,
      minQuantityForNegotiation,
      image: imageUrl , // Path to the uploaded image
      farmer: req.user.userId // Set farmer's ID from the authenticated user
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error adding product:', error); // Log the error for debugging
    res.status(500).json({ message: 'Internal Server Error', error });
  }
});



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
