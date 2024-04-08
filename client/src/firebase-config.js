// src/firebase-config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDrOs6A4ddrqsdFj0YQpHXSgnvyBQMt3VM",
  authDomain: "ecommerce-website-project-demo.firebaseapp.com",
  projectId: "ecommerce-website-project-demo",
  storageBucket: "ecommerce-website-project-demo.appspot.com",
  messagingSenderId: "616950357410",
  appId: "1:616950357410:web:8ab130a854b36872d2e6fb"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
