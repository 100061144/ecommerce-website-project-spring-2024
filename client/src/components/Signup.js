// Signup.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css';

const Signup = () => {
  const [userDetails, setUserDetails] = useState({
    username: '',
    password: '',
    email: '',
    phoneNumber: '',
    firstName: '',
    lastName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/login');
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserDetails(prevDetails => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://localhost:3000/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userDetails),
    })
    .then(response => {
      if (response.ok) {
          return response.json();
      }
      throw new Error('Failed to sign up.');
    })
    .then(data => {
      if (data.success) {
          alert(data.message);
          navigate('/login'); // Redirect to login page after successful signup
      } else {
          alert(data.message); // Display the error message from the server
      }
    })
    .catch(error => {
      console.error('Signup error:', error);
      alert('Error signing up: ' + error.message);
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="signup-container">
      <img src={`/images/UAE_Traditional_Mart.png`} alt="Banner" className="home-banner" />
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        {/* Form fields for user details */}
        <input type="text" name="username" value={userDetails.username} onChange={handleChange} placeholder="Username" required />
        <div className="password-input-container">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={userDetails.password}
            onChange={handleChange}
            placeholder="Password"
            required
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="show-password-button"
          >
            {showPassword ? 'Hide' : 'Show'} Password
          </button>
        </div>
        <input type="email" name="email" value={userDetails.email} onChange={handleChange} placeholder="Email" required />
        <input type="text" name="phoneNumber" value={userDetails.phoneNumber} onChange={handleChange} placeholder="Phone Number" required />
        <input type="text" name="firstName" value={userDetails.firstName} onChange={handleChange} placeholder="First Name" required />
        <input type="text" name="lastName" value={userDetails.lastName} onChange={handleChange} placeholder="Last Name" required />
        <button type="submit" className="signup-button">Sign Up</button>
        <button type="button" onClick={handleBack} className="back-button">Back to Login</button>
      </form>
    </div>
  );
};

export default Signup;
