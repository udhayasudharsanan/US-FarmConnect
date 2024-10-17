const express = require('express');
const router = express.Router();
const Support = require('../models/Support');
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware'); // Import auth middleware

// Set up multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
});

// Route to submit a support query to admin
router.post('/submit', authMiddleware, async (req, res) => { // Use auth middleware here
  try {
    const { message, userType } = req.body;
    
    if (!req.user || !req.user.userId) {
      return res.status(400).json({ msg: 'User not authenticated' });
    }

    const newSupportQuery = new Support({
      userId: req.user.userId,
      message,
      userType,
    });

    await newSupportQuery.save();
    res.status(200).json({ msg: 'Support query submitted successfully.' });
  } catch (error) {
    res.status(500).json({ msg: 'Failed to submit query.' });
  }
});

// Route for admin to view all support queries
router.get('/all', authMiddleware, async (req, res) => { // Use auth middleware here
  try {
    const queries = await Support.find().populate('userId', 'name');
    res.status(200).json(queries);
  } catch (error) {
    res.status(500).json({ msg: 'Failed to fetch support queries.' });
  }
});

// Route to handle new messages (with optional image upload)
router.post('/messages', [authMiddleware, upload.single('image')], async (req, res) => {
  try {
    const { text, sender } = req.body;

    if (!req.user || !req.user.userId) {
      return res.status(400).json({ msg: 'User not authenticated' });
    }

    const messageData = {
      message: text,
      userType: sender,
      userId: req.user.userId, // Use userId from authenticated user
      image: req.file ? req.file.filename : null,
    };

    const newMessage = new Support(messageData);
    await newMessage.save();

    res.status(201).json({ message: newMessage });
  } catch (error) {
    console.error('Error saving support message:', error);
    res.status(500).json({ error: 'Failed to save message' });
  }
});


// Route for admin to reply to a support message
router.put('/reply/:messageId', upload.single('image'), async (req, res) => { 
  // Use PUT here for updating an existing message
  try {
      const { messageId } = req.params;
      const { replyMessage } = req.body;

      if (!replyMessage && !req.file) {
          return res.status(400).json({ msg: 'Reply message or image is required' });
      }

      const supportMessage = await Support.findById(messageId);
      if (!supportMessage) {
          return res.status(404).json({ msg: 'Support message not found' });
      }

      const replyData = {
          replyMessage,
          replyImage: req.file ? req.file.filename : null,
      };

      supportMessage.replies.push(replyData);
      await supportMessage.save();

      res.status(201).json({ msg: 'Reply sent successfully.', supportMessage });
  } catch (error) {
      console.error('Error replying to support message:', error);
      res.status(500).json({ error: 'Failed to send reply' });
  }
});




module.exports = router;
