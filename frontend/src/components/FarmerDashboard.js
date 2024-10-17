import React, { useState, useEffect } from 'react';
import { getProducts, addProduct } from '../api';
import socket from '../socket';
import FarmerChat from './FarmerChat';
import SupportChat from './SupportChat'; // Import Support Chat component
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

const FarmerDashboard = ({ farmerId }) => {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [minQuantityForNegotiation, setMinQuantityForNegotiation] = useState('');
  const [image, setImage] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [showSupportChat, setShowSupportChat] = useState(false); // State for support chat visibility
  const [negotiationRequests, setNegotiationRequests] = useState([]);
  const [negotiatedPrices, setNegotiatedPrices] = useState({}); // To store each product's new price

  useEffect(() => {
    const token = localStorage.getItem('token'); // Get token from local storage

    const fetchNegotiationRequests = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/negotiate/requests', {
          headers: {
            Authorization: `Bearer ${token}`, // Add the token in the headers
          },
        });
        setNegotiationRequests(response.data.requests);
      } catch (error) {
        console.error('Error fetching negotiation requests:', error);
      }
    };

    fetchNegotiationRequests();
  }, []); // No dependencies, so this runs once on mount


  // Handle negotiation response from farmer
  const handleResponse = async (productId,customerId) => {
    const newPrice = negotiatedPrices[productId]; // Get the entered price
    const token = localStorage.getItem('token'); // Get token from local storage
    // const newPrice = negotiatedPrices[productId]; // Retrieve the entered price (this should be a number)
    
    
    // Ensure that a valid price is entered
  if (!newPrice || isNaN(newPrice)) {
    alert('Please enter a valid price before sending.');
    return;
  }
    
    try {
      const response = await axios.post('http://localhost:5000/api/negotiate/respond', {
        productId,
        newPrice:Number(newPrice) ,
        customerId,
      }, {
        headers: {
          Authorization: `Bearer ${token}`, // Add the token in the headers
        },
      });
      if (response.data.success) {
        const respondedNegotiationId = response.data.negotiation._id; // Get the responded negotiation ID
        alert('Negotiation response sent.');
        // Emit socket event to notify customer about the update
        setNegotiationRequests((prevRequests) =>
          prevRequests.filter(request => request._id !== respondedNegotiationId)
        );
        
        socket.emit('negotiationUpdated', {
        productId,
        customerId,
        newPrice : Number(newPrice),
      });
      
       // Remove responded negotiation from state
      }
    } catch (error) {
      console.error('Error responding to negotiation:', error);
    }
  }; 
  
  useEffect(() => {
    const fetchFarmerProducts = async () => {
      const token = localStorage.getItem('token'); // Get token from local storage
      try {
        const response = await axios.get('http://localhost:5000/api/products/farmer', {
          headers: {
            Authorization: `Bearer ${token}`, // Add the token in the headers
          },
        });
        setProducts(response.data.products); // Set products into state
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchFarmerProducts();

    socket.on('productAdded', (newProduct) => {
      setProducts((prevProducts) => [...prevProducts, newProduct]);
    });

    return () => socket.off('productAdded');
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('quantity', quantity);
    formData.append('minQuantityForNegotiation', minQuantityForNegotiation);
    formData.append('image', image); // Ensure this is a File object

    const token = localStorage.getItem('token'); // Get token from local storage

    try {
      await axios.post('http://localhost:5000/api/products/add', formData, {
        headers: {
          Authorization: `Bearer ${token}`, // Add the token in the headers
        },
      });
      // Reset fields after successful addition
      setName('');
      setPrice('');
      setQuantity('');
      setMinQuantityForNegotiation('');
      setImage(null); // Clear image
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product. Please try again.');
    }
  };

  const handleProductSelect = (productId) => {
    setSelectedProductId(productId); // Set the selected product ID for chat
  };

  const toggleSupportChat = () => {
    setShowSupportChat(!showSupportChat); // Toggle the support chat visibility
  };
  
  const handlePriceChange = (e, productId) => {
    setNegotiatedPrices({
      ...negotiatedPrices,
      [productId]: Number(e.target.value),
    });
  };
  
  

  return (
    <div className="container">
      <h2 className="my-4">Farmer Dashboard</h2>
      
      {/* Add Product Form */}
      <form onSubmit={handleAddProduct} encType="multipart/form-data" className="mb-4">
        <div className="form-group">
          <input
            type="text"
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-control"
            required
          />
        </div>
        <div className="form-group">
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="form-control"
            required
          />
        </div>
        <div className="form-group">
          <input
            type="number"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="form-control"
            required
          />
        </div>
        <div className="form-group">
          <input
            type="number"
            placeholder="Min Quantity for Negotiation"
            value={minQuantityForNegotiation}
            onChange={(e) => setMinQuantityForNegotiation(e.target.value)}
            className="form-control"
            required
          />
        </div>
        <div className="form-group">
          <input
            type="file"
            onChange={(e) => setImage(e.target.files[0])} // Capture the image file
            className="form-control-file"
          />
        </div>
        <button type="submit" className="btn btn-primary">Add Product</button>
      </form>

      {/* Farmer's Products */}
      <h3>Your Products</h3>
      <div className="row">
        {products.map(product => (
          <div key={product._id} className="col-md-4">
            <div className="card mb-4" onClick={() => handleProductSelect(product._id)}>
              <img src={`http://localhost:5000/uploads/${product.image}`} className="card-img-top" alt={product.name} />
              <div className="card-body">
                <h5 className="card-title">{product.name}</h5>
                <p className="card-text">Price: ${product.price}</p>
                <p className="card-text">Quantity: {product.quantity}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Render FarmerChat only if a product is selected */}
      {selectedProductId && (
        <FarmerChat productId={selectedProductId} farmerId={farmerId} /> 
      )}

      {/* Support Chat Button */}
      <div className="text-center my-4">
        <button className="btn btn-info" onClick={toggleSupportChat}>
          {showSupportChat ? "Close Support Chat" : "Chat with Admin"}
        </button>
      </div>
      <div>
        <h2>Negotiation Requests</h2>
        <ul>
  {negotiationRequests.map((request) => (
    <li key={request._id}>
      <h4>{request.productId.name}</h4>
      <p>Requested Price: ${request.requestedPrice}</p>
      <p>Message: {request.message}</p>
      {/* Handle negotiation response */}
      <input
        type="number"
        placeholder="Enter new price"
        value={negotiatedPrices[request.productId._id] || ''} // Use state to track entered price
        onChange={(e) => handlePriceChange(e, request.productId._id)} // Track price change
      />
      {/* Button to send the negotiation response */}
      <button
        className="btn btn-success mt-2"
        onClick={() => handleResponse(request.productId._id, request.customerId)} // Send response on click
      >
        Send Negotiated Price
      </button>
    </li>
  ))}
</ul>

      </div>

      {/* Render Support Chat if visible */}
      {showSupportChat && (
        <SupportChat farmerId={farmerId} />
      )}
    </div>
  );
};

export default FarmerDashboard;





