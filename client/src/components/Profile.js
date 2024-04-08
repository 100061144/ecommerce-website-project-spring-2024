// Profile.js
import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";
import { auth, database } from '../firebase-config'; // Import your Firebase config

const Profile = () => {
 const [userData, setUserData] = useState({});

 useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const uid = user.uid;
        const userRef = ref(database, 'users/' + uid);
        get(userRef).then((snapshot) => {
          if (snapshot.exists()) {
            setUserData(snapshot.val());
          } else {
            console.log("No data available");
          }
        }).catch((error) => {
          console.error(error);
        });
      }
    });
 }, []);

 return (
    <div>
      <h1>Profile</h1>
      <p>Email: {userData.email || 'N/A'}</p>
      <p>Username: {userData.username || 'N/A'}</p>
      // Add more user data as needed
    </div>
 );
};

export default Profile;
