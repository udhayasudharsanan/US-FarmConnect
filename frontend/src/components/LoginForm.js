import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api'; // Ensure you have this API function defined

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login({ email, password });
      const { token, role } = response.data;

      // Store the token in localStorage
      localStorage.setItem('token', token);

      // Redirect based on user role
      navigate(`/${role}-dashboard`);
    }catch(error){
      alert('Login failed. Please check your credentials.')
    }
  };  
  return (
    <div className="form-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      <p>
        New user? <span className="signup-link" onClick={() => navigate('/signup')}>Sign Up</span>
      </p>
    </div>
  );
};

export default LoginForm;



