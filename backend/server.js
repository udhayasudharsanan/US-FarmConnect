const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const Support = require('./models/Support');
const negotiationRoutes = require('./routes/negotiation');
const cartRoutes = require('./routes/Cart');
const productRoutes = require('./routes/product');
const supportRoutes = require('./routes/support');
dotenv.config();


const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
      cors: {
    origin: "*",
    methods: ["GET", "POST","DELETE","PUT"]
  }
});
app.use(cors(corsOptions));

// Middlewares
app.use(cors({
  origin: 'https://us-farm-connect.vercel.app', // Allow requests from your React app
  credentials: true,
}))
app.use(express.json());
// app.use(express.static('uploads'));

dotenv.config();

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/product'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/support', require('./routes/support'));
// app.use('/api/messages', require('./routes/message')); // Add this line to include the message routes
app.use('/uploads', express.static('uploads'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/negotiate', negotiationRoutes);
app.use('/api/cart', cartRoutes);


// Real-time connection with Socket.io
io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('newProduct', (product) => {
    io.emit('productAdded', product);
  });

  socket.on('sendMessage', (messageData) => {
    console.log("Message received:", messageData);
    // Emit the message to the intended farmer
    socket.to(messageData.farmerId).emit('receiveMessage', messageData); // Broadcast to the farmer's socket
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Handle socket connections
/* io.on('connection', (socket) => {
  console.log('New client connected');

  // Listen for incoming chat messages
  socket.on('sendMessage', async (messageData) => {
    console.log("Message received:", messageData);
    
    // Save message to the database
    try {
      const newMessage = new Message(messageData); // Create a new message instance
      await newMessage.save(); // Save it to the database
      console.log('Message saved:', newMessage);
    } catch (error) {
      console.error('Error saving message:', error);
    }

    // Emit the message to the intended farmer
    socket.to(messageData.farmerId).emit('receiveMessage', messageData); // Broadcast to the farmer's socket
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
}); */

io.on('connection', (socket) => {
  socket.on('sendSupportMessage', async (data) => {
      const { text, sender, image } = data;
      try {
          const newMessage = new Support({
              text,
              sender,
              image,
              // Add other required fields if any, based on your Support model
          });
          await newMessage.save();
          io.emit('supportMessageReceived', newMessage); // Emit back to clients
      } catch (error) {
          console.error('Error saving support message:', error);
      }
  });
}); 


// Listen on a port
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
