import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css'; // Ensure this path matches your CSS file's location

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [displaySection, setDisplaySection] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // Function to fetch users from the backend
  const fetchUsers = async () => {
    try {
        const response = await fetch('http://localhost:3000/users');
        const data = await response.json();
        if (data.success) {
            setUsers(data.users);
        } else {
            alert('Failed to fetch users');
        }
    } catch (error) {
        console.error("Error fetching users:", error);
        alert('Failed to fetch users');
    }
  };

  useEffect(() => {
    if (displaySection === 'users') {
      fetchUsers();
    }
  }, [displaySection]);

  const handleDisplaySection = (section) => {
    setDisplaySection(section);
    setSelectedUser(null); // Reset selected user when changing sections
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user); // Set the selected user to display details
  };

  const handleDeleteUser = async (username) => {
    // Confirmation dialog
    const isConfirmed = window.confirm(`Are you sure you want to delete the user ${username}? This action cannot be undone.`);
    if (!isConfirmed) {
        return; // Stop the function if the user cancels
    }

    // Proceed with the deletion logic if confirmed
    try {
        const response = await fetch('http://localhost:3000/deleteUser', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username }),
        });
        const data = await response.json();
        if (data.success) {
            // Remove the user from the users state
            const updatedUsers = users.filter(user => user.username !== username);
            setUsers(updatedUsers);
            // Optionally, reset selectedUser if the deleted user was being viewed
            setSelectedUser(null);
            alert('User deleted successfully');
        } else {
            alert('Failed to delete user');
        }
    } catch (error) {
        console.error("Error deleting user:", error);
        alert('Failed to delete user');
    }
  };

  const handleSignOut = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div className="admin-buttons">
        <button onClick={() => handleDisplaySection('products')} className="admin-button">Manage Products</button>
        <button onClick={() => handleDisplaySection('users')} className="admin-button">Manage Users</button>
        <button onClick={() => handleDisplaySection('orders')} className="admin-button">Manage Orders</button>
        <button onClick={() => handleDisplaySection('analytics')} className="admin-button">View Analytics</button>
        <button onClick={handleSignOut} className="admin-sign-out-button">Sign Out</button>
      </div>
      <div className="admin-content">
        {displaySection === 'users' && (
          <>
            <div className="user-list">
              {users.map((user, index) => (
                <div key={index} className="user-item">
                  {user.username}
                  <button onClick={() => handleSelectUser(user)} className="details-button">Details</button>
                </div>
              ))}
            </div>
            {selectedUser && (
              <div className="user-details">
                <p>Username: {selectedUser.username}</p>
                <p>Email: {selectedUser.email}</p>
                <p>Phone Number: {selectedUser.phoneNumber}</p>
                <p>First Name: {selectedUser.firstName}</p>
                <p>Last Name: {selectedUser.lastName}</p>
                <button onClick={() => handleDeleteUser(selectedUser.username)} className="delete-user-button">Delete User</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
