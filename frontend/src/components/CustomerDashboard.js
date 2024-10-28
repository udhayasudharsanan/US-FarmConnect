import React, { useState, useEffect } from 'react';
import { getProducts } from '../api';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useCart } from '../context/CartContext'; // Import useCart from CartContext
import axios from 'axios';
import socket from '../socket'; // Assuming socket setup

const CustomerDashboard = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate(); // For navigation
  const { addToCart, cart, setCart } = useCart(); // Ensure cart and setCart are available
  const [negotiationMessages, setNegotiationMessages] = useState({});
  const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://us-farmconnect.onrender.com';
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts(); // Ensure this API call is correct
        setProducts(response.data.products); // Products should be set here
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
  
    fetchProducts();
  }, []);

  // Function to add product to the cart
  const handleAddToCart = (product) => {
    addToCart(product); // Add the product to the cart
    alert(`${product.name} added to cart!`);
  };

  // Handle negotiation message change
  const handleNegotiationChange = (e, productId) => {
    setNegotiationMessages({
      ...negotiationMessages,
      [productId]: e.target.value,
    });
  };

  // Send negotiation request
  const sendNegotiation = async (productId) => {
    const message = negotiationMessages[productId];
    if (!message) return alert('Please enter a negotiation message.');

    const token = localStorage.getItem('token'); // Retrieve the token from localStorage

    try {
      const response = await axios.post(
        `${API_URL}/api/negotiate`, // Adjust the endpoint accordingly
        {
          productId,
          message,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Ensure the token is passed in the headers
          },
        }
      );

      if (response.data.success) {
        alert('Negotiation request sent to the farmer.');
        setNegotiationMessages((prev) => ({ ...prev, [productId]: '' })); // Clear the message input
      } else {
        alert('Failed to send negotiation request. Please try again.');
      }
    } catch (error) {
      console.error('Error sending negotiation message:', error);
      alert('Error sending negotiation request. Please check your network and try again.');
    }
  };

  // Handle socket event to update the cart with the negotiated price
  useEffect(() => {
    socket.on('negotiationUpdated', (data) => {
      const { productId, newPrice } = data;
      // Update the cart with the new price for the product
      setCart((prevCart) => {
        return prevCart.map((item) =>
          item._id === productId ? { ...item, price: newPrice } : item
        );
      });
    });

    return () => {
      socket.off('negotiationUpdated');
    };
  }, [setCart]);

  return (
    <div className="container">
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <a className="navbar-brand" href="/">US FARM</a>
        
        <div className="ml-auto">
          <button className="btn btn-outline-success ml-2" onClick={() => navigate('/cart')}>
            <i className="fas fa-shopping-cart"></i> Cart
          </button>
          <button className="btn btn-outline-primary ml-2" onClick={() => navigate('/support')}>
            <i className="fas fa-headset"></i> Support
          </button>
        </div>
      </nav>

      <h2 className="my-4">Welcome to Our Marketplace</h2>

      <div className="row">
        {Array.isArray(products) && products.length > 0 ? (
          products.map(product => (
            <div className="col-md-4 mb-4" key={product._id}>
              <div className="card h-100">
                <img src={`${API_URL}/${product.image}`} alt={product.name} style={{ width: '100px', height: 'auto' }} />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{product.name}</h5>
                  <p className="card-text">Price: ${product.price}</p>
                  {product.farmer.certified && (
                  <p className="text-success">
                    <i className="fas fa-check-circle"></i> Certified Farmer</p>
                  )}
                  <p className="card-text">Quantity: {product.quantity}</p>
                  <div className="mt-auto">
                    <button className="btn btn-primary btn-block" onClick={() => handleAddToCart(product)}>
                      Add to Cart
                    </button>
                    {product.quantity >= product.minQuantityForNegotiation && (
                      <div>
                        <textarea
                          placeholder="Enter negotiation message"
                          value={negotiationMessages[product._id] || ''}
                          onChange={(e) => handleNegotiationChange(e, product._id)}
                        />
                        <button className="btn btn-secondary mt-2" onClick={() => sendNegotiation(product._id)}>
                          Send Negotiation
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No products available</p>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
