import React, { useState, useEffect } from 'react';
import axios from 'axios';
import socket from '../socket'; // Assuming socket setup
const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://us-farmconnect.onrender.com';
const CustomerChat = ({ productId, customerId }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  // Fetch previous messages for the specific product
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/messages/${productId}`);
        setMessages(response.data.messages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();

    // Listen for new incoming messages
    socket.on('receiveMessage', (messageData) => {
      if (messageData.productId === productId) {
        setMessages((prevMessages) => [...prevMessages, messageData]);
      }
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [productId]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      const messageData = {
        productId,
        customerId, // Make sure this is the authenticated customer ID
        text: message,
        sender: 'customer'
      };
      socket.emit('sendMessage', messageData);
      setMessages((prevMessages) => [...prevMessages, messageData]);
      setMessage('');
    }
  };

  return (
    <div>
      <h3>Chat for Product {productId}</h3>
      <div style={{ border: '1px solid #ccc', padding: '10px', height: '200px', overflowY: 'scroll' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ textAlign: msg.sender === 'customer' ? 'right' : 'left' }}>
            <strong>{msg.sender === 'customer' ? 'Customer' : 'Farmer'}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage}>
        <input 
          type="text" 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          placeholder="Type your message..."
          required 
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default CustomerChat;
