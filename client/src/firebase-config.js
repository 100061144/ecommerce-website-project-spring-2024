import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDrOs6A4ddrqsdFj0YQpHXSgnvyBQMt3VM",
  authDomain: "ecommerce-website-project-demo.firebaseapp.com",
  projectId: "ecommerce-website-project-demo",
  storageBucket: "ecommerce-website-project-demo.appspot.com",
  messagingSenderId: "616950357410",
  appId: "1:616950357410:web:8ab130a854b36872d2e6fb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and set persistence
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    // Persistence is set to LOCAL, you can now authenticate users
    console.log("Persistence set to LOCAL");
  })
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });

// Initialize Firebase Realtime Database (if you're using it)
const database = getDatabase(app);

export { auth, database };
