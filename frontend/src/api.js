import axios from 'axios';
const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://us-farmconnect.onrender.com';

export const login = (credentials) => {
  return axios.post(`${API_URL}/auth/login`, credentials); // Ensure the endpoint is correct
};

export const signup = (userData) => {
  return axios.post(`${API_URL}/auth/signup`, userData);
};

export const getProducts = () => {
  return axios.get(`${API_URL}/products`);
};

// Function to add a product
export const addProduct = async (formData) => {
  const token = localStorage.getItem('token'); // Get the JWT token from local storage (or however you're storing it)
  try {
    const response = await axios.post(`${API_URL}/products/add`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}` // Include the token in the Authorization header
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

export const getSupportTickets = () => {
  return axios.get(`${API_URL}/support`);
};

export const submitSupportTicket = (ticketData, token) => {
  return axios.post(`${API_URL}/support/raise`, ticketData, {
    headers: {
        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        'Content-Type': 'multipart/form-data', // Specify content type
      },
    });
  };



// Fetch negotiation requests for a farmer
export const getNegotiationRequests = async () => {
  const response = await axios.get('/api/negotiate/requests', {
    headers: { Authorization: localStorage.getItem('token') },
  });
  return response.data.requests;
};

// Respond to negotiation
export const respondToNegotiation = async (productId, newPrice) => {
  const response = await axios.post(
    '/api/negotiate/respond',
    { productId, newPrice },
    { headers: { Authorization: localStorage.getItem('token') } }
  );
  return response.data;
};
