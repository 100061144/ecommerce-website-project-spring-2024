// ForgotPassword.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResetPasswordAndForgotPassword.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
        const response = await fetch('http://localhost:3000/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        const data = await response.json();
        if (data.success) {
            alert('Password reset link has been sent to your email.');
            navigate('/login');
        } else {
            alert(data.message);
        }
        } catch (error) {
        console.error("An error occurred during forgot password:", error);
        alert("An error occurred during forgot password: " + error.message);
        }
    };

    const handleBack = () => {
        navigate('/login'); // Navigates back to the login page
    };

    return (
        <div className="forgot-password-container">
            <img src={`/images/UAE_Traditional_Mart.png`} alt="Banner" className="home-banner" />
            <h1>Forgot Password</h1>
            <form onSubmit={handleSubmit} className="forgot-password-form">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="forgot-password-input" />
                <button type="submit" className="forgot-password-button">Send Reset Link</button>
                <button type="button" onClick={handleBack} className="forgot-password-back-button">Back</button>
            </form>
        </div>
    );
};

export default ForgotPassword;