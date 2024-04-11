import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();

  // Retrieve user information from localStorage directly within the component
  const [username, setUsername] = useState(localStorage.getItem('username'));
  const [password, setPassword] = useState(localStorage.getItem('password'));
  const [email, setEmail] = useState(localStorage.getItem('email'));
  const [phoneNumber, setPhoneNumber] = useState(localStorage.getItem('phoneNumber'));
  const [firstName, setFirstName] = useState(localStorage.getItem('firstName'));
  const [lastName, setLastName] = useState(localStorage.getItem('lastName'));

  const [editMode, setEditMode] = useState(false);

  const handleSignOut = () => {
    // Clear user information from localStorage
    localStorage.clear();
    // Redirect to the login page
    navigate('/login');
  };

  const handleProfileUpdate = async () => {
    // Confirmation dialog
    const isConfirmed = window.confirm("Are you sure you want to save these changes to your profile?");
    if (!isConfirmed) {
        return; // Stop the function if the user cancels
    }

    // Proceed with saving the profile if confirmed
    const updatedInfo = {
      originalUsername: localStorage.getItem('username'), // Use the original username to identify the user in the backend
      newUsername: username,
      newPassword: password, // Be cautious with handling passwords, especially in production
      email,
      phoneNumber,
      firstName,
      lastName,
    };

    const response = await fetch('http://localhost:3000/updateProfile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedInfo),
    });

    const data = await response.json();
    if (data.success) {
      // Update localStorage with new user info if the server confirms success
      // Assuming the server response includes all updated fields
      localStorage.setItem('username', username); // Username is already being updated correctly

      // Ensure these fields are updated based on the server's response
      // The following lines assume your server response includes these fields
      // If the server doesn't return the updated values, you'll need to adjust it accordingly
      localStorage.setItem('email', email);
      localStorage.setItem('phoneNumber', phoneNumber);
      localStorage.setItem('firstName', firstName);
      localStorage.setItem('lastName', lastName);

      // Note: Updating password in localStorage is generally not recommended for security reasons
      // Consider handling authentication and session management without storing passwords in localStorage

      alert('Profile updated successfully');
      setEditMode(false);
    } else {
      alert('Failed to update profile. ' + data.message);
    }
  };

  const handleDeleteAccount = async () => {
    // Confirmation dialog
    const isConfirmed = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
    if (!isConfirmed) {
        return; // Stop the function if the user cancels
    }

    // Proceed with the deletion logic if confirmed
    const username = localStorage.getItem('username'); // Get the username from localStorage

    const response = await fetch('http://localhost:3000/deleteAccount', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
    });

    const data = await response.json();
    if (data.success) {
        localStorage.clear(); // Clear all local storage
        alert('Account deleted successfully');
        navigate('/login'); // Redirect to login page or home page
    } else {
        alert('Failed to delete account. ' + data.message);
    }
  };

  return (
    <div className="profile-container">
      <h1>User Profile</h1>
      {editMode ? (
        <>
          <label>Username:</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <label>Phone Number:</label>
          <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
          <label>First Name:</label>
          <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <label>Last Name:</label>
          <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          <button onClick={() => setEditMode(false)} className="back-button">Back</button>
          <button onClick={handleProfileUpdate} className="profile-save-button">Save Changes</button>
        </>
      ) : (
        <>
          <p><strong>Username:</strong> {username}</p>
          <p><strong>Email:</strong> {email}</p>
          <p><strong>Phone Number:</strong> {phoneNumber}</p>
          <p><strong>First Name:</strong> {firstName}</p>
          <p><strong>Last Name:</strong> {lastName}</p>
          <button onClick={handleSignOut} className="profile-sign-out-button">Sign Out</button>
          <button onClick={() => setEditMode(true)} className="edit-profile-button">Edit Profile</button>
          <button onClick={handleDeleteAccount} className="delete-account-button">Delete My Account</button>
        </>
      )}
    </div>
  );
};

export default Profile;
