import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();

  // Retrieve user information from localStorage directly within the component
  const username = localStorage.getItem('username');
  const email = localStorage.getItem('email');
  const phoneNumber = localStorage.getItem('phoneNumber');
  const firstName = localStorage.getItem('firstName');
  const lastName = localStorage.getItem('lastName');

  const handleSignOut = () => {
    // Clear user information from localStorage
    localStorage.clear(); // This clears all data in localStorage. Use removeItem for specific keys.
    // Redirect to the login page
    navigate('/login');
  };

  return (
    <div className="profile-container">
      <h1>User Profile</h1>
      <p><strong>Username:</strong> {username}</p>
      <p><strong>Email:</strong> {email}</p>
      <p><strong>Phone Number:</strong> {phoneNumber}</p>
      <p><strong>First Name:</strong> {firstName}</p>
      <p><strong>Last Name:</strong> {lastName}</p>
      <button onClick={handleSignOut} className="profile-sign-out-button">Sign Out</button>
      {/* Placeholder button for Edit Profile functionality */}
      <button className="edit-profile-button">Edit Profile</button>
    </div>
  );
};

export default Profile;