// Signup.js
import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import { auth, database } from '../firebase-config'; // Import your Firebase config

const Signup = () => {
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [username, setUsername] = useState('');

 const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Store additional user information in the database
      const userRef = ref(database, 'users/' + user.uid);
      set(userRef, {
        username: username,
        email: email
      });
      alert("User created successfully!");
      // Redirect to the home page or profile page
    } catch (error) {
      alert(error.message);
    }
 };

 return (
    <div>
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required />
        <button type="submit">Sign Up</button>
      </form>
    </div>
 );
};

export default Signup;
