import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './index.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { CartProvider } from './context/CartContext'; // Import CartProvider
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Import bootstrap JS
import 'bootstrap/dist/css/bootstrap.min.css';      // Import bootstrap CSS

// Wrap App with both Router and CartProvider
ReactDOM.render(
  <CartProvider>
    <Router>
      <App />
    </Router>
  </CartProvider>,
  document.getElementById('root')
);

