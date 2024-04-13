import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Cart.css';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [totalCost, setTotalCost] = useState(0);

    useEffect(() => {
        fetchCartItems();
    }, []);

    const fetchCartItems = async () => {
        const username = localStorage.getItem("username");
        if (username) {
            try {
                const response = await fetch(`http://localhost:3000/cart/${username}`);
                const data = await response.json();
                setCartItems(data);
    
                // Calculate the total cost
                const totalCost = data.reduce((acc, item) => acc + (item.price * item.quantity), 0);
                setTotalCost(totalCost); // Assuming you have a state variable for totalCost
            } catch (error) {
                console.error("Error fetching cart items:", error);
            }
        }
    };

    const updateQuantity = async (itemId, action) => {
        const username = localStorage.getItem("username");
        const endpoint = `http://localhost:3000/cart/${action}`;
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, itemId }),
            });
            const data = await response.json();
            if (data.success) {
                // Fetch the updated cart items after successful update
                fetchCartItems();
            } else {
                console.error("Failed to update cart item quantity:", data.message);
            }
        } catch (error) {
            console.error("Error updating cart item quantity:", error);
        }
    };

    const incrementQuantity = (itemId) => {
        updateQuantity(itemId, 'increment');
    };

    const decrementQuantity = (itemId) => {
        updateQuantity(itemId, 'decrement');
    };

    const confirmDelete = (itemId) => {
        if (window.confirm("Are you sure you want to delete this item from your cart?")) {
            deleteCartItem(itemId);
        }
    };
    
    const deleteCartItem = async (itemId) => {
        const username = localStorage.getItem("username");
        // Assuming your server has an endpoint to handle item deletion from the cart
        const response = await fetch(`http://localhost:3000/cart/delete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, itemId }),
        });
        const data = await response.json();
        if (data.success) {
            alert('Item removed successfully');
            fetchCartItems(); // Refresh the cart items
        } else {
            alert('Failed to remove item');
        }
    };

    return (
        <div className="cart-container">
            <h1>Your Cart</h1>
            <div className="cart-items">
                {cartItems.length > 0 ? (
                    cartItems.map((item, index) => (
                        <div key={index} className="cart-item">
                            <h2>{item.title}</h2>
                            <p>Price: ${item.price}</p>
                            <div className="quantity-controls">
                                <button onClick={() => decrementQuantity(item.id)}>-</button>
                                <span>{item.quantity}</span>
                                <button onClick={() => incrementQuantity(item.id)}>+</button>
                            </div>
                            <button className="delete-button" onClick={() => confirmDelete(item.id)}>Delete</button> {/* Add this line */}
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
            <div className="cart-total">
                <h2>Total Cost: ${totalCost}</h2>
            </div>
        </div>
    );
};

export default Cart;
