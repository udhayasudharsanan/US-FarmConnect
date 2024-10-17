import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import socket from '../socket';
const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://us-farmconnect.onrender.com';
const ChatPage = () => {
  const { productId, farmerId } = useParams();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const userId = localStorage.getItem('userId'); // Get user ID from auth

  useEffect(() => {
    // Fetch previous messages
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/messages/${productId}`);
        setMessages(response.data.messages);
      } catch (error) {
        console.error('Error fetching messages:', error);
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
      socket.off('receiveMessage');
    };
  }, [productId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (message.trim()) {
      const messageData = {
        productId,
        farmerId,
        userId,
        text: message,
        sender: 'customer',
      };

      // Emit the message to the server
      socket.emit('sendMessage', messageData);

      // Save the message to the database
      try {
        await axios.post('${API_URL}/api/messages', messageData);
        setMessages((prevMessages) => [...prevMessages, messageData]);
        setMessage('');
      } catch (error) {
        console.error('Error saving message:', error);
      }
    }
  };

  return (
    <div className="container">
      <h2>Chat with Farmer</h2>
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${msg.sender === 'farmer' ? 'farmer' : 'customer'}`}
          >
            <strong>{msg.sender === 'farmer' ? 'Farmer' : 'You'}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="mt-3">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
          <div className="input-group-append">
            <button className="btn btn-primary" type="submit">
              Send
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatPage;


