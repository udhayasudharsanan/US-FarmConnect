import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { getProducts } from '../api';
const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://us-farmconnect.onrender.com';
const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [farmerIdToCertify, setFarmerIdToCertify] = useState('');
  const [messages, setMessages] = useState([]); 
  const [replyMessage, setReplyMessage] = useState('');  // New state for reply input
  const [selectedMessageId, setSelectedMessageId] = useState(null);  // Track which message is selected
  const token = localStorage.getItem('token');
  // Fetch users, products, and support tickets on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token'); // Fetch token from localStorage
  
        if (!token) {
          throw new Error('Authorization token is missing. Please log in again.');
        }
  
        const headers = { Authorization: `Bearer ${token}` }; // Pass token consistently in the headers
  
        const usersResponse = await axios.get('${API_URL}/api/admin/users', { headers });
        setUsers(usersResponse.data);
  
        /* const productsResponse = await axios.get('http://localhost:5000/api/products', { headers });
        setProducts(Array.isArray(productsResponse.data) ? productsResponse.data : []); // Ensure it's an array */
  
        const supportResponse = await axios.get('${API_URL}/api/support', { headers });
        setSupportTickets(supportResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, []);
  

  // Function to certify a farmer
  const certifyFarmer = async (farmerId) => {
    try {
      const token = localStorage.getItem('token'); // Retrieve the token from localStorage
      if (!token) {
        throw new Error('Authorization token is missing. Please log in again.');
      }
      await axios.put(`${API_URL}/api/admin/certify-farmer/${farmerId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }, // Pass token in the headers
      });
      alert('Farmer certified');
      setUsers(users.map(user => user._id === farmerId ? { ...user, certified: true } : user));
    } catch (error) {
      console.error('Error certifying farmer:', error);
    }
  };
  

  // Function to delete a product
  const deleteProduct = async (productId) => {
    try {
      const token = localStorage.getItem('token'); // Retrieve the token from localStorage
      if (!token) {
        throw new Error('Authorization token is missing. Please log in again.');
      }
      await axios.delete(`${API_URL}/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }, // Pass token in the headers
      });
      setProducts(products.filter(product => product._id !== productId));
      alert('Product deleted');
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts(); 
        console.log("API response: ", response.data);  // Add this line to verify the response
        setProducts(response.data.products); 
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
  
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!token) {
        console.error('No token found. Please login again.');
        return;
      }

      try {
        const response = await axios.get('${API_URL}/api/support/all', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching support messages:', error);
      }
    };

    fetchMessages();
  }, [token]);

  const handleReply = async (e, messageId) => {
    e.preventDefault();
  
    if (!messageId || !replyMessage) {
      console.error('Message ID or reply is missing.');
      return;
    }
  
    const formData = new FormData();
    formData.append('replyMessage', replyMessage);  // Attach the reply message
     


    try {
      const response = await axios.put(`${API_URL}/api/support/reply/${messageId}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',  // Send as form-data for possible image uploads
        },
      });
      // Update state with the new support message
      setMessages(prevMessages =>
        prevMessages.map(msg =>
            msg._id === messageId ? response.data.supportMessage : msg
        )
    );
    setReplyMessage('');  // Clear the reply input
    // setImageFile(null); // Clear image file input if necessary
} catch (error) {
    console.error('Error sending reply:', error);
}
};
  
  
  
  return (
    <div className="container my-5">
      <h2 className="text-center mb-4">Admin Dashboard</h2>

      {/* Manage Farmers Section */}
      <div className="card mb-4">
        <div className="card-header">
          <h3>Manage Farmers</h3>
        </div>
        <div className="card-body">
          {users.filter(user => user.role === 'farmer').map(farmer => (
            <div key={farmer._id} className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <strong>{farmer.name}</strong> - Certified: {farmer.certified ? 'Yes' : 'No'}
              </div>
              {!farmer.certified && (
                <button className="btn btn-primary" onClick={() => certifyFarmer(farmer._id)}>
                  Certify Farmer
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Manage Products Section */}
      <div className="card mb-4">
  <div className="card-header">
    <h3>Manage Products</h3>
  </div>
  <div className="card-body">
    {Array.isArray(products) && products.length > 0 ? (
      products.map(product => (
        <div key={product._id} className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <strong>{product.name}</strong> - ${product.price} - Quantity: {product.quantity}
          </div>
          <button className="btn btn-danger" onClick={() => deleteProduct(product._id)}>
            Delete Product
          </button>
        </div>
      ))
    ) : (
      <p>No products available</p>
    )}
  </div>
</div>

      {/* Support Tickets Section */}
      <div className="card mb-4">
        <div className="card-header">
          <h3>Suuport  </h3>
        </div>
        <div className="card-body">
          {messages.length > 0 ? (
            messages.map((msg) => (
              <div key={msg._id} className="mb-3">
                <strong>{msg.userId.name}:</strong> {msg.message}
                {msg.image && (
                  <div>
                    <img 
                      src={`http://localhost:5000/uploads/${msg.image}`} 
                      alt="support-chat-img" 
                      style={{ maxWidth: '100px', marginTop: '5px' }} 
                    />
                  </div>
                )}
                <form onSubmit={(e) => handleReply(e, msg._id)}>
  <input 
    type="text" 
    value={replyMessage} 
    onChange={(e) => setReplyMessage(e.target.value)} 
    placeholder="Type your reply..." 
    required 
    style={{ width: '75%', marginRight: '10px' }}
  />
  <button type="submit" className="btn btn-primary">Send Reply</button>
</form>
              </div>
            ))
          ) : (
            <p>No messages from farmers</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
