import React from 'react';
import { Link } from 'react-router-dom';
import './Cart.css';

const Cart = () => {
  return (
    <div className="cart-container">
      <h1>Your Cart</h1>
      <div className="cart-items">
        {/* Example cart item */}
        <div className="cart-item">
          <img src="path/to/product/image.jpg" alt="Product Name" className="cart-item-image" />
          <div className="cart-item-details">
            <h2>Product Name</h2>
            <p>Price: $99.99</p>
            <p>Quantity: 1</p>
          </div>
        </div>
        {/* Add more cart items as needed */}
      </div>
      <div className="cart-actions">
        <Link to="/" className="cart-button">Back to Home</Link> {/* Add this line for the Back to Home button */}
        <Link to="/payment" className="cart-button">Proceed to Checkout</Link>
      </div>
    </div>
  );
};

export default Cart;
