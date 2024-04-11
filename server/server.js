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
const writeFile = util.promisify(fs.writeFile);

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

async function updateUserProfile(originalUsername, updates) {
    const filePath = path.join(__dirname, 'data', 'users.txt');
    try {
        const data = await readFile(filePath, 'utf8');
        const lines = data.split('\n');
        let fileUpdated = false;

        const updatedLines = lines.map(line => {
            const [username, password, email, phoneNumber, firstName, lastName] = line.split('\t');
            if (username === originalUsername) {
                fileUpdated = true;
                // Update each field if it's provided in the updates object, otherwise keep the original
                return [
                    updates.newUsername || username,
                    updates.newPassword || password,
                    updates.email || email,
                    updates.phoneNumber || phoneNumber,
                    updates.firstName || firstName,
                    updates.lastName || lastName,
                ].join('\t');
            }
            return line;
        });

        if (!fileUpdated) {
            return { success: false, message: "User not found." };
        }

        await writeFile(filePath, updatedLines.join('\n'), 'utf8');
        return { success: true, message: "Profile updated successfully." };
    } catch (error) {
        console.error("Error updating user profile:", error);
        return { success: false, message: "Error updating user profile." };
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

app.post('/updateProfile', async (req, res) => {
    const { originalUsername, ...updates } = req.body;
    const result = await updateUserProfile(originalUsername, updates);
    res.json(result);
});

app.delete('/deleteAccount', async (req, res) => {
  const { username } = req.body; // Assuming the username is sent in the request body

  const filePath = path.join(__dirname, 'data', 'users.txt');
  try {
      const data = await readFile(filePath, 'utf8');
      const lines = data.split('\n');
      const updatedLines = lines.filter(line => {
          const [fileUsername] = line.split('\t');
          return fileUsername !== username;
      });

      await writeFile(filePath, updatedLines.join('\n'), 'utf8');
      res.json({ success: true, message: "Account deleted successfully." });
  } catch (error) {
      console.error("Error deleting user account:", error);
      res.status(500).json({ success: false, message: "Error deleting user account." });
  }
});

app.get('/users', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'users.txt');
  fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
          console.error("Failed to read users file:", err);
          return res.status(500).json({ success: false, message: "Failed to read users data" });
      }

      const users = data.trim().split('\n').map(line => {
          const [username, , email, phoneNumber, firstName, lastName] = line.split('\t');
          return { username, email, phoneNumber, firstName, lastName };
      });

      res.json({ success: true, users });
  });
});

app.delete('/deleteUser', async (req, res) => {
  const { username } = req.body; // The username of the user to delete

  const filePath = path.join(__dirname, 'data', 'users.txt');
  try {
      const data = await fs.promises.readFile(filePath, 'utf8');
      const lines = data.split('\n');
      const filteredLines = lines.filter(line => line.split('\t')[0] !== username);
      await fs.promises.writeFile(filePath, filteredLines.join('\n'), 'utf8');
      res.json({ success: true, message: "User deleted successfully." });
  } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ success: false, message: "Error deleting user." });
  }
});

// Define the port number
const PORT = 3000;
// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
