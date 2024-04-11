import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Payment.css'; // Make sure to create and link this CSS file

const Payment = () => {
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails(prevDetails => ({
      ...prevDetails,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would usually handle the payment processing
    alert('Payment Successful!');
    navigate('/');
  };

  return (
    <div className="payment-container">
      <h1>Payment Page</h1>
      <form onSubmit={handleSubmit} className="payment-form">
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
