const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  minQuantityForNegotiation: { type: Number, required: true },
  image: { type: String, required: true }, // Assuming this is the path to the uploaded image
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Farmer's ID is required
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;

