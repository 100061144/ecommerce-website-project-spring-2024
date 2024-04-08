import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database"; // Import ref and set
import { auth, database } from '../firebase-config'; // Ensure database is imported
import './Signup.css';

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
    <div className="home-container">
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit} className="home-form">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="home-input" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required className="home-input" />
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required className="home-input" />
        <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" required className="home-input" />
        <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" required className="home-input" />
        <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" required className="home-input" />
        <button type="submit" className="home-button">Sign Up</button>
      </form>
    </div>
  );
};

export default Signup;
