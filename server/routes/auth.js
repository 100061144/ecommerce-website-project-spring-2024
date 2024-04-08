// auth.js
const express = require('express');
const router = express.Router();
const readUserCredentials = require('./utils/readUserCredentials');

router.post('/login', (req, res) => {
 const { username, password } = req.body;

 if (!username || !password) {
   return res.status(400).json({ message: "Username or Password not present" });
 }

 const user = readUserCredentials(username, password);
 if (!user) {
   return res.status(401).json({ message: "Invalid credentials" });
 }

 res.status(200).json({ message: "Login successful", user });
});

module.exports = router;
