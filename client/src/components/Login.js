import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Adjust the path as necessary

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/login', { // Ensure URL matches your server
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      console.log(data); // Log the response for debugging
      if (data.success) {
        console.log("Is Admin:", data.isAdmin); // Check the isAdmin value
        if (data.isAdmin) {
          navigate('/admin'); // Navigate to the admin dashboard
        } else {
          console.log('Navigating to home page');
          navigate('/'); // Navigate to the home page for regular users
        }
      } else {
        alert(data.message); // Show error message from server
      }
    } catch (error) {
      console.error("An error occurred during login:", error);
      alert("An error occurred during login.");
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      <form onSubmit={handleSubmit} className="login-form">
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required className="login-input" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required className="login-input" />
        <button type="submit" className="login-button">Login</button>
      </form>
    </div>
  );
};

export default Login;
