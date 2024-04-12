import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Cart.css';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        const username = localStorage.getItem("username");
        if (username) {
            fetch(`http://localhost:3000/cart/${username}`)
                .then(response => response.json())
                .then(data => {
                    // Assuming 'data' is the array of cart items
                    setCartItems(data); // Update state with fetched cart items
                })
                .catch(error => {
                    console.error("Error fetching cart items:", error);
                });
        }
    }, []); // Dependency array left empty to run once on mount

    return (
        <div className="cart-container">
            <h1>Your Cart</h1>
            <div className="cart-items">
                {cartItems.length > 0 ? (
                    cartItems.map((item, index) => (
                        <div key={index} className="cart-item">
                            <h2>{item.title}</h2>
                            <p>Price: ${item.price}</p>
                            <p>Quantity: {item.quantity}</p>
                            {/* Add more details as needed */}
                        </div>
                    ))
                ) : (
                    <p>Your cart is empty.</p>
                )}
            </div>
            <div className="cart-actions">
                <Link to="/" className="cart-button">Back to Home</Link>
                <Link to="/payment" className="cart-button">Proceed to Checkout</Link>
            </div>
        </div>
    );
};

export default Cart;