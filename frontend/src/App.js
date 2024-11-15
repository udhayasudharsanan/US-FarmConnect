import React from 'react';
import { Route, Routes } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import AdminDashboard from './components/AdminDashboard';
import FarmerDashboard from './components/FarmerDashboard';
import CustomerDashboard from './components/CustomerDashboard';
import SupportChat from './components/SupportChat';
import MessagesPage from './components/MessagesPage';
import Cart from './components/Cart';
import OrderTracking from './components/OrderTracking';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { CartProvider } from './context/CartContext'; // Import CartProvider
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Import bootstrap JS
import 'bootstrap/dist/css/bootstrap.min.css';      // Import bootstrap CSS

  // Decode token if it's available and extract customerId
const App = () => {
  const token = localStorage.getItem('token');
  let customerId = null;

// Helper function to decode JWT token manually
const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1]; // Extract the payload part
    const decodedPayload = atob(payload); // Decode the base64-encoded payload
    return JSON.parse(decodedPayload); // Convert JSON string to object
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// Decode token if it's available and extract customerId
const App = () => {
  const token = localStorage.getItem('token');
  let customerId = null;

  if (token) {
    const decodedToken = decodeToken(token); // Use manual decoding function
    customerId = decodedToken?.customerId || null; // Extract customerId from the payload
  }
  
  return (
    <CartProvider>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        <Route path="/support" element={<SupportChat />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/cart" element={<Cart customerId={customerId} />} />
        <Route path="/orders" element={<OrderTracking customerId={customerId} />} />
      </Routes>
    </CartProvider>
  );
};

export default App;
