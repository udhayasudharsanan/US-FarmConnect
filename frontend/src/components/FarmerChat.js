import React, { useState, useEffect } from 'react';
import socket from '../socket'; // Ensure you have your socket instance set up
import axios from 'axios';

const FarmerChat = ({ productId, farmerId }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  // Fetch previous messages for the specific product when the component mounts
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/messages/${productId}`); // Adjust the API URL as necessary
        setMessages(response.data.messages); // Set the fetched messages into state
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();

    // Listen for incoming messages
    socket.on('receiveMessage', (messageData) => {
      if (messageData.productId === productId) {
        setMessages((prevMessages) => [...prevMessages, messageData]);
      }
    });

    return () => {
      socket.off('receiveMessage'); // Clean up the listener on unmount
    };
  }, [productId]);

  // Function to handle sending messages
  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      const messageData = {
        productId,
        farmerId, // Ensure this is the correct farmer ID
        text: message,
        sender: 'farmer' // Identifying the sender as a farmer
      };
      socket.emit('sendMessage', messageData); // Emit the message to the server
      setMessages((prevMessages) => [...prevMessages, messageData]); // Update local messages
      setMessage(''); // Clear the input field
    }
  };

  return (
    <div>
      <h3>Chat for Product {productId}</h3>
      <div style={{ border: '1px solid #ccc', padding: '10px', height: '200px', overflowY: 'scroll' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ textAlign: msg.sender === 'farmer' ? 'left' : 'right' }}>
            <strong>{msg.sender === 'farmer' ? 'Farmer' : 'Customer'}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage}>
        <input 
          type="text" 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          placeholder="Type your reply..."
          required // Require a message before sending
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default FarmerChat;


