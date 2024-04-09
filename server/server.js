// server.js

const express = require('express');
const cors = require('cors'); // Import the cors package
const bodyParser = require('body-parser');
const { authenticateUser } = require('./routes/auth');
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
    try {
        const authResult = await checkAuthentication(username, password);
        if (authResult.success) {
            // Include the isAdmin flag in the response
            res.json({ success: true, message: "Authentication successful", isAdmin: authResult.isAdmin });
        } else {
            res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } catch (error) {
        console.error("Error during authentication:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

app.get('/isAuthenticated', (req, res) => {
    // This is a simplified example. You should secure this endpoint.
    const isAuthenticated = checkAuthentication(); // Implement this function based on your .txt file logic
    res.json({ isAuthenticated });
});

// Define the port number
const PORT = 3000;
// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
