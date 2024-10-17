const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      productName: { type: String, required: true }, // Store the product name
      price: { type: Number, required: true },
      quantity: { type: Number, default: 1, required: true },
      minQuantityForNegotiation: { type: Number }, // Minimum quantity required for negotiation
      negotiationStatus: { type: String, default: 'pending' } // Status of negotiation
    }
  ],
  totalAmount: { type: Number, required: true },
}, { timestamps: true });

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;

