import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Ensure Link is imported here
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { auth, database } from '../firebase-config'; // Adjust the path as necessary
import './Signup.css'; // Ensure this points to your CSS file for styling

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Save the additional user info to your database
      set(ref(database, `users/${userCredential.user.uid}`), {
        email,
        username,
        phone,
        firstName,
        lastName
      });
      alert("User created successfully!");
      navigate('/'); // Redirect to the home page
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="signup-container">
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit} className="signup-form">
        <label className="signup-label">Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="signup-input" />
        
        <label className="signup-label">Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="signup-input" />
        
        <label className="signup-label">Username:</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="signup-input" />
        
        <label className="signup-label">Phone Number:</label>
        <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required className="signup-input" />
        
        <label className="signup-label">First Name:</label>
        <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="signup-input" />
        
        <label className="signup-label">Last Name:</label>
        <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="signup-input" />
        
        <button type="submit" className="signup-button">Sign Up</button>
      </form>
      <Link to="/login" className="back-to-login-link">Back to Login</Link> {/* Back to Login button */}
    </div>
  );
};

export default Signup;
