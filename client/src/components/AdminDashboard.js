import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css'; // Make sure the path to your CSS file is correct

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [displaySection, setDisplaySection] = useState('');

  // Function to handle displaying different sections based on the button clicked
  const handleDisplaySection = (section) => {
    setDisplaySection(section);
  };

  // Function to handle the sign-out process
  const handleSignOut = () => {
    localStorage.clear(); // Clear all stored data in localStorage
    navigate('/login'); // Redirect the user to the login page
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1> {/* Title of the Admin Dashboard */}
      <div className="admin-buttons">
        {/* Buttons for different admin actions */}
        <button onClick={() => handleDisplaySection('products')} className="admin-button">Manage Products</button>
        <button onClick={() => handleDisplaySection('users')} className="admin-button">Manage Users</button>
        <button onClick={() => handleDisplaySection('orders')} className="admin-button">Manage Orders</button>
        <button onClick={() => handleDisplaySection('analytics')} className="admin-button">View Analytics</button>
        <button onClick={handleSignOut} className="admin-sign-out-button">Sign Out</button>
      </div>
      <div className="admin-content">
        {/* Conditional rendering based on the selected section */}
        {displaySection === 'products' && <div>Products Management Section</div>}
        {displaySection === 'users' && <div>Users Management Section</div>}
        {displaySection === 'orders' && <div>Orders Management Section</div>}
        {displaySection === 'analytics' && <div>Analytics View Section</div>}
        {/* Replace the above divs with your actual components or data display logic */}
      </div>
    </div>
  );
};

export default AdminDashboard;