import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import socket from '../socket'; // Assuming socket setup

export default function Cart() {
  const { cart, setCart } = useCart(); // Cart context
  const [negotiationMessages, setNegotiationMessages] = useState({});
  const [requestedPrices, setRequestedPrices] = useState({});
  const token = localStorage.getItem('token');
  const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://us-farmconnect.onrender.com';

  // Fetch updated cart data on mount or after negotiation
  useEffect(() => {
    const fetchUpdatedCart = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCart(response.data.cart);
      } catch (error) {
        console.error('Error fetching cart:', error);
      }
    };
    fetchUpdatedCart();
  }, [setCart, token, API_URL]);

  // Socket listener for negotiation updates from the farmer
  useEffect(() => {
    socket.on('negotiationUpdated', (data) => {
      const { productId, newPrice } = data;
      setCart((prevCart) =>
        prevCart.map(item => item._id === productId ? { ...item, price: newPrice } : item)
      );
    });
    return () => socket.off('negotiationUpdated');
  }, [setCart]);

  // Update negotiation message
  const handleNegotiationChange = (e, itemId) => {
    setNegotiationMessages(prev => ({ ...prev, [itemId]: e.target.value }));
  };

  // Update requested price
  const handlePriceChange = (e, itemId) => {
    setRequestedPrices(prev => ({ ...prev, [itemId]: e.target.value }));
  };

  // Send negotiation request to the farmer
  const sendNegotiation = async (itemId, farmerId) => {
    const message = negotiationMessages[itemId];
    const requestedPrice = requestedPrices[itemId];

    if (!message || !requestedPrice) {
      alert('Please provide both a message and requested price.');
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/negotiate`,
        { productId: itemId, farmerId, message, requestedPrice },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('Negotiation request sent.');
        setNegotiationMessages(prev => ({ ...prev, [itemId]: '' }));
        setRequestedPrices(prev => ({ ...prev, [itemId]: '' }));
      } else {
        alert('Failed to send negotiation.');
      }
    } catch (error) {
      console.error('Error sending negotiation:', error);
      alert('Error sending negotiation.');
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
            <li key={item._id}>
              <h4>{item.productName || 'Product Name Missing'}</h4>
              <p>Price: ${item.price}</p>
              <p>Quantity: {item.quantity}</p>
              {item.negotiationStatus === 'accepted' ? (
                <p>Negotiation accepted, price updated.</p>
              ) : item.quantity >= item.minQuantityForNegotiation ? (
                <div>
                  <textarea
                    placeholder="Enter negotiation message"
                    value={negotiationMessages[item._id] || ''}
                    onChange={(e) => handleNegotiationChange(e, item._id)}
                  />
                  <input
                    type="number"
                    placeholder="Enter requested price"
                    value={requestedPrices[item._id] || ''}
                    onChange={(e) => handlePriceChange(e, item._id)}
                  />
                  <button onClick={() => sendNegotiation(item._id, item.farmer)}>
                    Send Negotiation
                  </button>
                </div>
              ) : (
                <p>Negotiation not available (minimum quantity: {item.minQuantityForNegotiation})</p>
              )}
            </li>
          ))}
        </ul>
      )}
      <button className="btn btn-primary">Proceed to Checkout</button>
    </div>
  );
}
