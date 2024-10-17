const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const SupportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Farmer or customer who initiated the message
  message: { type: String, required: true },  // Original message
  image: { type: String },  // Optional image URL
  createdAt: { type: Date, default: Date.now },
  userType: { type: String, required: true },  // Sender type: 'farmer' or 'customer'
  replies: [
    {
      replyMessage: { type: String },
      replyImage: { type: String },  // Image URL if the reply has an image
      repliedBy: { type: String, default: 'admin' },  // Admin replies
      createdAt: { type: Date, default: Date.now },
    }
  ],
}, { timestamps: true });

module.exports = mongoose.model('Support', SupportSchema);
