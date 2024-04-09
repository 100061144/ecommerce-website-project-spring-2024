// AdminDashboard.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AdminDashboard.css'; // Make sure you have this CSS file created based on the previous instructions
import './AdminDashboard.css'; // Assuming you have or will create a separate CSS file for admin styles

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    // Clear user session from local storage or any state management you are using
    localStorage.removeItem('user');
    // Redirect to the login page or home page
    navigate('/login');
  };

  return (
    <div className="admin-dashboard-container">
      <h1>Admin Dashboard</h1>
      <div className="admin-buttons">
        <Link to="/admin/products" className="admin-button">Manage Products</Link>
        <Link to="/admin/users" className="admin-button">Manage Users</Link>
        <Link to="/admin/orders" className="admin-button">Manage Orders</Link>
        <Link to="/admin/analytics" className="admin-button">View Analytics</Link>
        <button onClick={handleSignOut} className="admin-button">Sign Out</button> {/* Sign out button */}
      </div>
    </div>
  );
};

export default AdminDashboard;
