// ResetPassword.js
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ResetPasswordAndForgotPassword.css';

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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
        alert("An error occurred during password reset: " + error.message);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="reset-password-container">
            <img src={`/images/UAE_Traditional_Mart.png`} alt="Banner" className="home-banner" />
            <h1>Reset Password</h1>
            <form onSubmit={handleSubmit} className="reset-password-form">
                <div className="password-input-container">
                <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New Password"
                    required
                    className="reset-password-input"
                />
                <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="show-password-button"
                >
                    {showPassword ? 'Hide' : 'Show'} Password
                </button>
                </div>
                <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                required
                className="reset-password-input"
                />
                <button type="submit" className="reset-password-button">
                    Reset Password
                </button>
            </form>
        </div>
    );
};

export default ResetPassword;