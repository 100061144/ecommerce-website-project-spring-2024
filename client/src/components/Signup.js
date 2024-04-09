import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css'; // Adjust the path as necessary

const Signup = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // Add other state variables as necessary
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/signup', { // Ensure URL matches your server
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password /*, other fields */ }),
      });
      const data = await response.json();
      if (data.success) {
        alert("User created successfully!");
        navigate('/login'); // Redirect to the login page
      } else {
        alert(data.message); // Show error message from server
      }
    } catch (error) {
      alert("An error occurred during signup.");
    }
  };

  return (
    <div className="signup-container">
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit} className="signup-form">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="signup-input" placeholder="Email" />
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="signup-input" placeholder="Username" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="signup-input" placeholder="Password" />
        {/* Include other input fields as necessary */}
        <button type="submit" className="signup-button">Sign Up</button>
      </form>
    </div>
  );
};

export default Signup;