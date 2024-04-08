import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link along with useNavigate
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebase-config';
import './Home.css'; // Assuming you're using Home.css for styling

const Login = () => {
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const navigate = useNavigate();

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
        <Link to="/signup" className="home-button">Sign Up</Link> {/* Add this line for the Sign Up button */}
      </div>
    </div>
 );
};

export default Login;
