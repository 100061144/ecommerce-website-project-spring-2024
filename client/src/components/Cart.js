import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Cart.css';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [totalCost, setTotalCost] = useState(0);
    const navigate = useNavigate();

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
                setTotalCost(totalCost); // Setting totalCost
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

    const incrementQuantity = async (itemId) => {
        const item = cartItems.find((item) => item.id === itemId);
        if (!item) {
            alert('Item not found in cart.');
            return;
        }

        // Fetch product details to get maxQuantity
        try {
            const productResponse = await fetch(`http://localhost:3000/product/${itemId}`);
            const productData = await productResponse.json();
            const maxQuantity = productData.quantity; // Getting quantity field for maxQuantity

            if (item.quantity < maxQuantity) {
                updateQuantity(itemId, 'increment');
            } else {
                alert('You have reached the maximum available quantity for this item.');
            }
        } catch (error) {
            console.error("Error fetching product details:", error);
            alert('Failed to fetch product details: ' + error.message);
        }

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
            alert('Failed to remove item: ' + data.message);
        }
    };

    const handleActionClick = () => {
        if (cartItems.length > 0) {
            navigate('/payment');
        } else {
            navigate('/products');
        }
    };

    return (
        <div className="cart-container">
            <img src={`/images/UAE_Traditional_Mart.png`} alt="Banner" className="home-banner" />
            <h1>Your Cart</h1>
            <div className="cart-items">
                {cartItems.length > 0 ? (
                    cartItems.map((item, index) => (
                        <div key={index} className="cart-item">
                            <h2>{item.title}</h2>
                            <p>Price: {item.price} AED</p>
                            <div className="quantity-controls">
                                <button onClick={() => decrementQuantity(item.id)}>-</button>
                                <span>{item.quantity}</span>
                                <button
                                    onClick={() => incrementQuantity(item.id)}
                                    disabled={item.quantity >= item.maxQuantity}
                                >
                                    +
                                </button>
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
                    <div className="cart-button" onClick={handleActionClick}>
                        {cartItems.length > 0 ? 'Proceed to Checkout' : 'Add Items to Cart'}
                    </div>
                    {/* Add this button for going back */}
                    <button className="cart-button back-button" onClick={() => navigate(-1)}>Go Back</button>
                </div>
            <div className="cart-total">
                <h2>Total Cost: {totalCost} AED</h2>
            </div>
        </div>
    );
};

export default Cart;
