// server.js

const express = require('express');
const cors = require('cors'); // Import the cors package
const bodyParser = require('body-parser');
const { authenticateUser } = require('./routes/auth');
const { getUserData } = require('./routes/auth');
const fs = require('fs');
const path = require('path');
const util = require('util');

// Convert fs.readFile into Promise version of same    
const readFile = util.promisify(fs.readFile);

async function checkAuthentication(username, password) {
    try {
        const filePath = path.join(__dirname, 'data', 'users.txt');
        const data = await readFile(filePath, 'utf8');
        const lines = data.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const [fileUsername, filePassword] = line.split('\t');
            if (fileUsername === username && filePassword === password) {
                // If it's the first line, treat the user as an admin
                const isAdmin = (i === 0);
                return { success: true, isAdmin };
            }
        }

        return { success: false };
    } catch (error) {
        console.error("Error reading the users file:", error);
        throw error; // Rethrow or handle as needed
    }
}

const app = express();

// Use cors middleware to enable CORS
app.use(cors());

// Use bodyParser middleware to parse JSON bodies
app.use(bodyParser.json());

// Login endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const result = authenticateUser(username, password);
    if (result.success) {
      res.json(result); // Ensure this includes username, email, phoneNumber, firstName, lastName
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
});

app.post('/signup', (req, res) => {
const { username, password, email, phoneNumber, firstName, lastName } = req.body;
const newUserLine = `${username}\t${password}\t${email}\t${phoneNumber}\t${firstName}\t${lastName}\n`;

const filePath = path.join(__dirname, 'data', 'users.txt'); // Adjust the path to your users.txt file

fs.appendFile(filePath, newUserLine, (err) => {
    if (err) {
    console.error('Failed to append new user to file:', err);
    return res.status(500).send('Error signing up the user.');
    }
    res.status(200).send('User signed up successfully.');
});
});

app.get('/isAuthenticated', (req, res) => {
    // This is a simplified example. You should secure this endpoint.
    const isAuthenticated = checkAuthentication(); // Implement this function based on your .txt file logic
    res.json({ isAuthenticated });
});

app.get('/profile/:username', (req, res) => {
  const { username } = req.params;
  const userData = getUserData(username);

  if (userData) {
    res.json({ success: true, userData });
  } else {
    res.status(404).json({ success: false, message: 'User not found' });
  }
});



// Define the port number
const PORT = 3000;
// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
