import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Payment.css'; // Make sure to create and link this CSS file

const Payment = () => {
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    // Add new fields for the shipping address
    address: '',
    city: '',
    country: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails(prevDetails => ({
      ...prevDetails,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const username = localStorage.getItem("username"); // Getting stored username in localStorage
    if (!username) {
      alert('You must be logged in to make a payment.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/createOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          address: paymentDetails.address,
          city: paymentDetails.city,
          country: paymentDetails.country,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Payment Successful and Order Created!');
        navigate('/'); // Navigate to the homepage or another route upon success
      } else {
        alert('Failed to process payment and create order: ' + data.message);
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      alert('An error occurred while processing your payment: ' + error.message);
    }
  };

  return (
    <div className="payment-container">
      <h1>Payment Page</h1>
      <form onSubmit={handleSubmit} className="payment-form">
        {/* Shipping Address Section */}
        <h2>Shipping Address</h2>
        <div className="form-group">
          <label htmlFor="address">Address:</label>
          <input type="text" id="address" name="address" value={paymentDetails.address} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="city">City:</label>
          <input type="text" id="city" name="city" value={paymentDetails.city} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="country">Country:</label>
          <input type="text" id="country" name="country" value={paymentDetails.country} onChange={handleChange} required />
        </div>

        {/* Credit Card Details Section */}
        <h2>Credit Card Details</h2>
        <div className="form-group">
          <label htmlFor="cardNumber">Credit Card Number:</label>
          <input type="text" id="cardNumber" name="cardNumber" value={paymentDetails.cardNumber} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="expiryDate">Expiry Date:</label>
          <input type="text" id="expiryDate" name="expiryDate" value={paymentDetails.expiryDate} onChange={handleChange} placeholder="MM/YY" required />
        </div>
        <div className="form-group">
          <label htmlFor="cvv">CVV:</label>
          <input type="text" id="cvv" name="cvv" value={paymentDetails.cvv} onChange={handleChange} required />
        </div>
        <button type="submit" className="confirm-payment-button">Confirm Payment</button>
      </form>
    </div>
  );
};

export default Payment;
