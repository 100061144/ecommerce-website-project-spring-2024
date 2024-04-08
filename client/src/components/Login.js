import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const auth = getAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Logged in successfully!");
      navigate('/'); // Redirect to the home page
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="home-container">
      <h1>Login</h1>
      <form onSubmit={handleSubmit} className="home-form">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="home-input" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required className="home-input" />
        <button type="submit" className="home-button">Login</button>
      </form>
      <div className="home-buttons">
        <Link to="/signup" className="home-button">Don't have an account? Sign Up</Link>
      </div>
    </div>
  );
};

export default Login;
