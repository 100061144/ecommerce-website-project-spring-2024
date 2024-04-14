import React, { useState, useEffect } from 'react';
import { Link, } from 'react-router-dom';
import './Orders.css';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [productNames, setProductNames] = useState({});

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                const response = await fetch('http://localhost:3000/products');
                const data = await response.json();
                if (data.success && Array.isArray(data.products)) {
                    const names = data.products.reduce((acc, product) => {
                        acc[product.id] = product.name;
                        return acc;
                    }, {});
                    setProductNames(names);
                } else {
                    console.error("Unexpected format for products:", data);
                }
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        fetchProductDetails();
    }, []);

    useEffect(() => {
        const fetchOrders = async () => {
            const username = localStorage.getItem("username");
            if (username) {
                try {
                    const response = await fetch(`http://localhost:3000/orders/${username}`);
                    const data = await response.json();
                    if (data.orders && Array.isArray(data.orders)) {
                        setOrders(data.orders);
                    } else {
                        console.error("Unexpected response format for orders:", data);
                    }
                } catch (error) {
                    console.error("Error fetching orders:", error);
                }
            }
        };

        if (Object.keys(productNames).length > 0) {
            fetchOrders();
        }
    }, [productNames]);

    return (
        <div className="orders-container">
            <div className="orders-header">
                <Link to="/" className="back-to-home">Back to Home</Link>
                <h1>Your Orders</h1>
                <div className="header-spacer"></div> {/* This is the new spacer */}
            </div>
            <div className="orders-content"> {/* This will be the scrollable container */}
            {orders.length > 0 ? (
                orders.map((order, index) => (
                    <div key={index} className="order-item">
                        <h2>Order ID: {order.orderID}</h2>
                        <p>Order Date: {order.orderDate}</p>
                        <p>Total Cost: {order.price} AED</p>
                        <p>Status: {order.orderStatus}</p>
                        <p>Address: {order.address}</p>
                        <p>Products:</p>
                        <ul>
                            {order.products.map((product, productIndex) => (
                                <li key={productIndex}>
                                    <Link to={`/products?search=${product.id}`}>
                                        {productNames[product.id] || 'Unknown Product'} - {product.id} (Quantity: {product.quantity})
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))
            ) : (
                <p>No orders found.</p>
            )}
            </div>
        </div>
    );
};

export default Orders;