// Signup.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css'; // Ensure this path is correct

const Signup = () => {
  const [userDetails, setUserDetails] = useState({
    username: '',
    password: '', // Ensure you have a password field in your form
    email: '',
    phoneNumber: '',
    firstName: '',
    lastName: '',
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserDetails(prevDetails => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://localhost:3000/signup', { // Adjust the URL/port as necessary
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userDetails),
    })
    .then(response => {
      if (response.ok) {
        return response.text();
      }
      throw new Error('Failed to sign up.');
    })
    .then(() => {
      alert('Signed up successfully.');
      navigate('/login'); // Redirect to login page after successful signup
    })
    .catch(error => {
      console.error('Signup error:', error);
      alert('Error signing up.');
    });
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        {/* Form fields for user details */}
        <input type="text" name="username" value={userDetails.username} onChange={handleChange} placeholder="Username" required />
        <input type="password" name="password" value={userDetails.password} onChange={handleChange} placeholder="Password" required />
        <input type="email" name="email" value={userDetails.email} onChange={handleChange} placeholder="Email" required />
        <input type="text" name="phoneNumber" value={userDetails.phoneNumber} onChange={handleChange} placeholder="Phone Number" required />
        <input type="text" name="firstName" value={userDetails.firstName} onChange={handleChange} placeholder="First Name" required />
        <input type="text" name="lastName" value={userDetails.lastName} onChange={handleChange} placeholder="Last Name" required />
        <button type="submit" className="signup-button">Sign Up</button>
      </form>
    </div>
  );
};

export default Signup;