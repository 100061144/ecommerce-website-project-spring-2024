// Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css'; // Ensure this path matches your CSS file's location

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (data.success) {
        // Store user information in localStorage
        localStorage.setItem('username', data.username);
        localStorage.setItem('password', password);
        localStorage.setItem('email', data.email);
        localStorage.setItem('phoneNumber', data.phoneNumber);
        localStorage.setItem('firstName', data.firstName);
        localStorage.setItem('lastName', data.lastName);

        // Show pop-up for successful login
        alert('Login successful!');

        // Redirect based on isAdmin flag
        if (data.isAdmin) {
          navigate('/admin'); // Redirect to AdminDashboard for admin
        } else {
          navigate('/'); // Redirect to homepage or user dashboard for regular users
        }
      } else {
        alert(data.message); // Handle login failure
      }
    } catch (error) {
      console.error("An error occurred during login:", error);
      alert("An error occurred during login: " + error.message);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <img src={`/images/UAE_Traditional_Mart.png`} alt="Banner" className="home-banner" />
      <h1>Login</h1>
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
          className="login-input"
        />
        <div className="password-input-container">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="login-input"
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="show-password-button"
          >
            {showPassword ? 'Hide' : 'Show'} Password
          </button>
        </div>
        <button type="submit" className="login-button">
          Login
        </button>
        <button onClick={() => navigate('/signup')} className="login-button">
          Sign Up
        </button>
        <Link to="/forgot-password" className="forgot-password-link">
          Forgot Password?
        </Link>
      </form>
    </div>
  );
};

export default Login;
