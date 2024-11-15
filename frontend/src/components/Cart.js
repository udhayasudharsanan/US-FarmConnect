import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import socket from '../socket'; // Assuming socket setup

export default function Cart() {
  const { cart, setCart } = useCart(); // Add setCart to update the cart state
  const { cart, checkout } = useCart()
  const [negotiationMessages, setNegotiationMessages] = useState({});
  const [requestedPrices, setRequestedPrices] = useState({});
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [customerAddress, setCustomerAddress] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token'); // Retrieve the token from localStorage
  const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://us-farmconnect.onrender.com';
  // Fetch updated cart data after login or negotiation (if needed)
  const fetchUpdatedCart = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(response.data.cart); // Update cart with fetched data
    } catch (error) {
      console.error('Error fetching updated cart:', error);
    }
  };

  // Listen for negotiation updates from the farmer
  useEffect(() => {
    socket.on('negotiationUpdated', (data) => {
      const { productId, newPrice } = data;
      setCart((prevCart) =>
        prevCart.map(item => item._id === productId ? { ...item, price: newPrice } : item)
      );
    });
  
    return () => socket.off('negotiationUpdated');
  }, [setCart]);
  // Handle changes in negotiation message input
  const handleNegotiationChange = (e, productId) => {
    setNegotiationMessages({
      ...negotiationMessages,
      [productId]: e.target.value,
    });
  };

  // Handle changes in requested price input
  const handlePriceChange = (e, productId) => {
    setRequestedPrices({
      ...requestedPrices,
      [productId]: e.target.value,
    });
  };

  // Function to send negotiation request to the farmer
  const sendNegotiation = async (productId, farmerId) => {
    const message = negotiationMessages[productId];
    const requestedPrice = requestedPrices[productId];
    
    if (!message || !requestedPrice) {
      alert('Please provide both a message and a requested price.');
      return;
    }
  
    try {
      // Ensure the token is available
      if (!token) {
        alert('Authorization token is missing. Please log in again.');
        return;
      }
      
      const response = await axios.post(
        `${API_URL}/api/negotiate`,
        { productId, farmerId, message, requestedPrice },  // Send farmerId along with the request
        {
          headers: { Authorization: `Bearer ${token}` },  // Ensure the token is passed in the headers
        }
      );
  
      if (response.data.success) {
        alert('Negotiation request sent to the farmer.');
        // Clear the message and requested price after sending
        setNegotiationMessages((prev) => ({ ...prev, [productId]: '' }));
        setRequestedPrices((prev) => ({ ...prev, [productId]: '' }));
        fetchUpdatedCart(); // Fetch the updated cart after negotiation
      } else {
        alert('Failed to send negotiation request. Please try again.');
      }
    } catch (error) {
      console.error('Error sending negotiation message:', error);
      alert('Error sending negotiation request. Please check your network and try again.');
    }
  };

const handleCheckout = async () => {
    const result = await checkout(customerId, customerAddress);
    if (result.success) {
      navigate('/orders');
    } else {
      console.error("Checkout error:", result.error);
    }
  };

  return (
    <div>
      <h2>Your Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <ul>
          {cart.map((item) => (
  <li key={item.productId}>
    <h4>{item.productName || 'Product Name Missing'}</h4>
    <p>Price: ${item.price}</p>
    <p>Quantity: {item.quantity}</p>
    {item.negotiationStatus === 'accepted' ? (
      <p>Negotiation accepted, price updated.</p>
    ) : item.quantity >= item.minQuantityForNegotiation ? (
                <div>
                  <textarea
          placeholder="Enter your negotiation message"
          value={negotiationMessages[item.productId] || ''}
          onChange={(e) => handleNegotiationChange(e, item.productId)}
        />
                  <input
          type="number"
          placeholder="Enter your requested price"
          value={requestedPrices[item.productId] || ''}
          onChange={(e) => handlePriceChange(e, item.productId)}
        />
                  <button onClick={() => sendNegotiation(item.productId, item.farmer)}> {/* Pass farmerId */}
                    Send Negotiation
                  </button>
                </div>
              ) : (
                <p>{item.negotiationStatus === 'accepted' ? 'Negotiation accepted' : `Negotiation not available (min quantity for negotiation: ${item.minQuantityForNegotiation})`}</p>
              )}
            </li>
          ))}
        </ul>
      )}
      <div>
        <h3>Enter Address</h3>
        <input
          type="text"
          value={customerAddress}
          onChange={(e) => setCustomerAddress(e.target.value)}
          placeholder="Enter delivery address"
          className="form-control mb-3"
        />
        <button className="btn btn-primary" onClick={handleCheckout}>Proceed to Checkout</button>
      </div>
    </div>
  );
};
