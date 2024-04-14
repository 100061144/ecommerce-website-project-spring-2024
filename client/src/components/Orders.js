// src/components/Orders.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link from React Router
import './Orders.css';

const Orders = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            const username = localStorage.getItem("username");
            if (username) {
                try {
                    const response = await fetch(`http://localhost:3000/orders/${username}`);
                    const data = await response.json();
                    // Check if data.orders exists and is an array before setting it
                    if (data.orders && Array.isArray(data.orders)) {
                        setOrders(data.orders);
                    } else {
                        // Handle the case where data.orders is not as expected
                        console.error("Unexpected response format:", data);
                        setOrders([]); // Ensure orders is always an array
                    }
                } catch (error) {
                    console.error("Error fetching orders:", error);
                    setOrders([]); // Ensure orders is always an array
                }
            }
        };

        fetchOrders();
    }, []);

    return (
        <div className="orders-container">
            <h1>Your Orders</h1>
            {orders.length > 0 ? (
                orders.map((order, index) => (
                    <div key={index} className="order-item">
                        <h2>Order ID: {order.orderID}</h2>
                        <p>Order Date: {order.orderDate}</p>
                        <p>Status: {order.orderStatus}</p>
                        <p>Products:</p>
                        <ul>
                            {order.products.map(product => (
                                <li key={product.id}>
                                    {/* Using Link for client-side navigation */}
                                    <Link to={`/products?search=${product.id}`}>{product.name} ({product.id})</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))
            ) : (
                <p>No orders found.</p>
            )}
        </div>
    );
};

export default Orders;
