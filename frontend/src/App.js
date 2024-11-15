import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { decode as jwtDecode } from 'jwt-decode';
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

  if (token) {
    try {
      const decodedToken = jwtDecode(token); // Use the named import
      customerId = decodedToken.customerId; // Extract customerId from the token payload
    } catch (error) {
      console.error('Error decoding token:', error);
    }
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
        <Route path="/cart" element={<Cart />} />
        <Route path="/cart" element={<Cart customerId={customerId} />} />
        {/* Pass customerId to OrderTracking component */}
        <Route path="/orders" element={<OrderTracking customerId={customerId} />} />
      </Routes>
    </CartProvider>
  );
};

export default App;
