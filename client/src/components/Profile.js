import React, { useState, useEffect } from 'react';
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

  const [initialValues, setInitialValues] = useState({
    username: '',
    password: '',
    email: '',
    phoneNumber: '',
    firstName: '',
    lastName: ''
  });

  const [editMode, setEditMode] = useState(false);
  const [formIsDirty, setFormIsDirty] = useState(false);

  const enterEditMode = () => {
    setInitialValues({
      username,
      password,
      email,
      phoneNumber,
      firstName,
      lastName
    });
    setEditMode(true);
    setFormIsDirty(false);
  };

  const leaveEditMode = () => {
    if (formIsDirty && !window.confirm("You have unsaved changes. Are you sure you want to leave?")) {
      return;
    }
    setUsername(initialValues.username);
    setPassword(initialValues.password);
    setEmail(initialValues.email);
    setPhoneNumber(initialValues.phoneNumber);
    setFirstName(initialValues.firstName);
    setLastName(initialValues.lastName);
    setEditMode(false);
    setFormIsDirty(false);
  };

  const handleSignOut = () => {
    // Clear user information from localStorage
    localStorage.clear();
    // Redirect to the login page
    navigate('/login');
  };

  const handleProfileUpdate = async () => {
    if (!username.trim() || !password.trim() || !email.trim() || !phoneNumber.trim() || !firstName.trim() || !lastName.trim()) {
      alert('Please fill in all fields before saving.');
      return; // Stop the function if any field is empty
    }

    // Check if the username already exists
    const checkUsernameResponse = await fetch(`http://localhost:3000/checkUsername`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, originalUsername: localStorage.getItem('username') }),
    });

    const usernameCheck = await checkUsernameResponse.json();
    if (!usernameCheck.success) {
        alert(usernameCheck.message);
        return;
    }

    // Confirmation dialog
    const isConfirmed = window.confirm("Are you sure you want to save these changes to your profile?");
    if (!isConfirmed) {
        return; // Stop the function if the user cancels
    }

    // Proceed with saving the profile if confirmed
    const updatedInfo = {
      originalUsername: localStorage.getItem('username'), // Use the original username to identify the user in the backend
      newUsername: username,
      newPassword: password,
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
        localStorage.setItem('username', username); 
        localStorage.setItem('email', email);
        localStorage.setItem('phoneNumber', phoneNumber);
        localStorage.setItem('firstName', firstName);
        localStorage.setItem('lastName', lastName);

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

  const navigateToHome = () => {
    navigate('/');
  };

  return (
    <div className="profile-container">
      <h1>User Profile</h1>
      {editMode ? (
        <>
          <label>Username:</label>
          <input type="text" value={username} onChange={(e) => { setUsername(e.target.value); setFormIsDirty(true); }} />
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setFormIsDirty(true); }} />
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setFormIsDirty(true); }} />
          <label>Phone Number:</label>
          <input type="text" value={phoneNumber} onChange={(e) => { setPhoneNumber(e.target.value); setFormIsDirty(true); }} />
          <label>First Name:</label>
          <input type="text" value={firstName} onChange={(e) => { setFirstName(e.target.value); setFormIsDirty(true); }} />
          <label>Last Name:</label>
          <input type="text" value={lastName} onChange={(e) => { setLastName(e.target.value); setFormIsDirty(true); }} />
          <button onClick={leaveEditMode} className="back-button">Back</button>
          <button onClick={handleProfileUpdate} className="profile-save-button">Save Changes</button>
        </>
      ) : (
        <>
          <p><strong>Username:</strong> {username}</p>
          <p><strong>Email:</strong> {email}</p>
          <p><strong>Phone Number:</strong> {phoneNumber}</p>
          <p><strong>First Name:</strong> {firstName}</p>
          <p><strong>Last Name:</strong> {lastName}</p>
          <button onClick={navigateToHome} className="profile-back-to-home-button">Back to Home</button>
          <button onClick={enterEditMode} className="edit-profile-button">Edit Profile</button>
          <button onClick={handleSignOut} className="profile-sign-out-button">Sign Out</button>
          <button onClick={handleDeleteAccount} className="delete-account-button">Delete My Account</button>
        </>
      )}
    </div>
  );
};

export default Profile;