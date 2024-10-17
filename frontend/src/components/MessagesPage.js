import React, { useEffect, useState } from 'react';
import axios from 'axios';
import socket from '../socket';

const MessagePage = ({ productId }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  
  // Fetch messages when the component mounts
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/messages/${productId}`);
        setMessages(response.data.messages); // Assuming your API returns a messages array
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();

    // Listen for incoming messages
    socket.on('receiveMessage', (messageData) => {
      if (messageData.productId === productId) {
        setMessages((prevMessages) => [...prevMessages, messageData]); // Update state with new message
      }
    });

    return () => {
      socket.off('receiveMessage'); // Clean up the listener on unmount
    };
  }, [productId]);

  // Function to send messages
  const sendMessage = async (e) => {
    e.preventDefault();
    if (message.trim()) {
      const messageData = {
        productId,
        text: message,
        sender: 'customer', // Adjust this based on the user role
      };

      // Emit the message to the server
      socket.emit('sendMessage', messageData);

      // Save the message to the database
      try {
        await axios.post('http://localhost:5000/api/messages', messageData);
        setMessages((prevMessages) => [...prevMessages, messageData]); // Update local messages
        setMessage(''); // Clear input field
      } catch (error) {
        console.error('Error saving message:', error);
      }
    }
  };

  return (
    <div className="message-page">
      <h2>Messages</h2>
      <div className="message-list" style={{ border: '1px solid #ccc', padding: '10px', height: '400px', overflowY: 'scroll' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ textAlign: msg.sender === 'customer' ? 'right' : 'left' }}>
            <strong>{msg.sender}:</strong> {msg.text}
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

export default MessagePage;
