// ResetPassword.js
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ResetPasswordAndForgotPassword.css';

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();
    const { token } = useParams();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
        alert("Passwords do not match.");
        return;
        }
        try {
        const response = await fetch(`http://localhost:3000/reset-password/${token}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newPassword }),
        });
        const data = await response.json();
        if (data.success) {
            alert('Password reset successful.');
            navigate('/login');
        } else {
            alert(data.message);
        }
        } catch (error) {
        console.error("An error occurred during password reset:", error);
        alert("An error occurred during password reset.");
        }
    };

    return (
        <div className="reset-password-container">
        <h1>Reset Password</h1>
        <form onSubmit={handleSubmit} className="reset-password-form">
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New Password" required className="reset-password-input" />
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password" required className="reset-password-input" />
            <button type="submit" className="reset-password-button">Reset Password</button>
        </form>
        </div>
    );
};

export default ResetPassword;