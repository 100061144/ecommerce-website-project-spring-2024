import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css'; // Ensure this path matches your CSS file's location
import SearchBar from './SearchBar'; // Adjust the path as necessary

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [displaySection, setDisplaySection] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

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

  // New function to fetch orders
  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:3000/orders');
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      } else {
        alert('Failed to fetch orders');
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      alert('Failed to fetch orders');
    }
  };

  // Function to update order status
  const updateOrderStatus = async (orderID, newStatus) => {
    try {
      const response = await fetch('http://localhost:3000/updateOrderStatus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderID, newStatus }),
      });
      const data = await response.json();
      if (data.success) {
        alert('Order status updated successfully');
        fetchOrders(); // Refresh orders list
      } else {
        alert('Failed to update order status');
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert('Failed to update order status');
    }
  };

  useEffect(() => {
    if (displaySection === 'users') {
      fetchUsers();
    } else if (displaySection === 'orders') {
      fetchOrders();
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
    const isConfirmed = window.confirm(`Are you sure you want to delete the user ${username}? This action cannot be undone.`);
    if (!isConfirmed) {
      return; // Stop the function if the user cancels
    }

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
        const updatedUsers = users.filter(user => user.username !== username);
        setUsers(updatedUsers);
        setSelectedUser(null); // Optionally, reset selectedUser if the deleted user was being viewed
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

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const filteredOrders = orders.filter(order => 
    order.orderID.includes(searchQuery) || order.username.includes(searchQuery)
  );

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
      {displaySection === 'users' && (
        <div className="admin-users-content"> {/* Flex container for users list and details */}
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
              <p className="detail-heading">Username:</p>
              <p>{selectedUser.username}</p>
              <p className="detail-heading">Email:</p>
              <p>{selectedUser.email}</p>
              <p className="detail-heading">Phone Number:</p>
              <p>{selectedUser.phoneNumber}</p>
              <p className="detail-heading">First Name:</p>
              <p>{selectedUser.firstName}</p>
              <p className="detail-heading">Last Name:</p>
              <p>{selectedUser.lastName}</p>
              {selectedUser.username !== "admin" && ( // Conditionally render the delete button
                <button onClick={() => handleDeleteUser(selectedUser.username)} className="delete-user-button">Delete User</button>
              )}
            </div>
          )}
        </div>
      )}
      {displaySection === 'orders' && (
        <>
          <div className="search-bar-container">
            <SearchBar onSearch={handleSearch} placeholder="Search for OrderID..." />
          </div>
          <div className="orders-list">
            {filteredOrders.map((order, index) => (
              <div key={index} className="order-item">
                <p>Order ID: {order.orderID}</p>
                <p>Username: {order.username}</p>
                <p>Date: {order.orderDate}</p>
                <p>Total Price: {order.totalPrice} AED</p>
                <p>Status: {order.status}</p>
                <p>Address: {order.address}</p>
                <div>Products:</div>
                <ul>
                  {order.products.map((product, productIndex) => (
                    <li key={productIndex}>
                      {product.name} - {product.id} (Quantity: {product.quantity})
                    </li>
                  ))}
                </ul>
                <select value={order.status} onChange={(e) => updateOrderStatus(order.orderID, e.target.value)}>
                  <option value="Pending">Pending</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  </select>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
