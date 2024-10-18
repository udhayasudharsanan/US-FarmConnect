import React, { useState, useEffect, useRef } from 'react';
import socket from '../socket';
import axios from 'axios';
const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://us-farmconnect.onrender.com';
const SupportChat = ({ farmerId }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [image, setImage] = useState(null); // State for image upload
  const messagesEndRef = useRef(null); // Ref to automatically scroll to the bottom
  const token = localStorage.getItem('token'); // Fetch token once and reuse it

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Fetch previous messages when the component mounts
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/support/all`, {
          headers: {
            'Authorization': `Bearer ${token}`, // Attach token for authentication
          },
        });
        setMessages(response.data); // Assuming the response contains a list of messages
      } catch (error) {
        console.error('Error fetching support messages:', error);
      }
    };
    fetchMessages();

    // Listen for incoming messages
    socket.on('receiveMessage', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [token]);

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!token) {
      console.error('No token found. Please login again.');
      return;
    }

    const formData = new FormData();
    formData.append('text', message);
    formData.append('sender', 'farmer');
    
    if (image) {
      formData.append('image', image);
    }

    try {
      const response = await axios.post(`${API_URL}/api/support/messages`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`, // Attach token to Authorization header
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update the message list with the new message
      setMessages((prevMessages) => [...prevMessages, response.data.message]);
      setMessage(''); // Clear the input field after sending
      setImage(null); // Clear the image after sending
    } catch (error) {
      console.error('Error sending message:', error.response ? error.response.data : error);
    }
  };

  return (
    <div>
      <h2>Support Chat</h2>
      <div style={{ border: '1px solid #ccc', padding: '10px', height: '300px', overflowY: 'scroll' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ textAlign: msg.sender === 'farmer' ? 'right' : 'left', margin: '10px' }}>
            <strong>{msg.sender}:</strong> {msg.message}
            {/* Display the image if present in the message */}
            {msg.image && (
              <div>
                <img 
                  src={`${API_URL}/uploads/${msg.image}`} 
                  alt="support-chat-img" 
                  style={{ maxWidth: '100px', marginTop: '5px' }} 
                />
              </div>
            )}
          </div>
        ))}
        {/* Reference for auto-scroll */}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} style={{ marginTop: '10px' }}>
        <input 
          type="text" 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          placeholder="Type your message..." 
          required 
          style={{ width: '75%', marginRight: '10px' }}
        />
        <input 
          type="file" 
          onChange={(e) => setImage(e.target.files[0])} // Capture the image
          accept="image/*"
        />
        <button type="submit" style={{ marginLeft: '10px' }}>Send</button>
      </form>
    </div>
  );
};

export default SupportChat;
