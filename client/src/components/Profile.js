import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { database } from '../firebase-config';
import { ref, get } from "firebase/database";
import './Home.css';

const Profile = () => {
  const [userData, setUserData] = useState({});
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = ref(database, 'users/' + user.uid);
        get(userRef).then((snapshot) => {
          if (snapshot.exists()) {
            setUserData(snapshot.val());
          } else {
            console.log("No user data available");
          }
        }).catch((error) => {
          console.error(error);
        });
      } else {
        navigate('/login');
      }
    });
  }, [navigate, auth]);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div className="home-container">
      <h1>Profile</h1>
      <div className="home-form">
        <p>Email: {userData.email || 'N/A'}</p>
        <p>Username: {userData.username || 'N/A'}</p>
        <p>Phone Number: {userData.phone || 'N/A'}</p>
        <p>First Name: {userData.firstName || 'N/A'}</p>
        <p>Last Name: {userData.lastName || 'N/A'}</p>
      </div>
      <div className="home-buttons">
        <button onClick={() => navigate(-1)} className="home-button">Back</button>
        <button onClick={handleSignOut} className="home-button">Sign Out</button>
      </div>
    </div>
  );
};

export default Profile;
