// server.js

const express = require('express');
const cors = require('cors'); // Import the cors package
const bodyParser = require('body-parser');
const { authenticateUser } = require('./routes/auth');
const { getUserData } = require('./routes/auth');
const fs = require('fs');
const path = require('path');
const util = require('util');
const getUserCartFilePath = (username) => path.join(__dirname, 'data', `${username}'s Cart Details.txt`);

// Convert fs.readFile into Promise version of same    
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const productsFilePath = path.join(__dirname, 'data', 'products.txt');

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

async function getProducts() {
    try {
        const data = await readFile(productsFilePath, 'utf8');
        const products = data.trim().split('\n\n').map(productBlock => {
            const [line1, description] = productBlock.split('\n');
            const [id, name, price, quantity] = line1.split('\t');
            return { id, name, price, quantity, description };
        });
        return products;
    } catch (error) {
        console.error("Error reading the products file:", error);
        throw error;
    }
}

async function addItemToCart(username, item) {
    const filePath = getUserCartFilePath(username);
    try {
        let fileContent = "";
        let cartItems = [];
        const userCartExists = fs.existsSync(filePath);

        if (userCartExists) {
            fileContent = await fs.promises.readFile(filePath, 'utf8');
            const lines = fileContent.trim().split('\n').slice(1); // Skip the first line containing the username
            cartItems = lines.map(line => {
                const [id, title, price, quantity] = line.split('\t');
                return { id, title, price, quantity: parseInt(quantity, 10) };
            });
        } else {
            // If the cart doesn't exist, start with the username
            fileContent = `${username}\n`;
        }

        // Check if the item already exists in the cart
        const existingItemIndex = cartItems.findIndex(cartItem => cartItem.id === item.id);
        if (existingItemIndex !== -1) {
            // If the item exists, increase the quantity
            cartItems[existingItemIndex].quantity += item.quantity;
        } else {
            // If the item doesn't exist, add it to the cart
            cartItems.push(item);
        }

        // Reconstruct the file content
        const updatedContent = cartItems.map(cartItem => `${cartItem.id}\t${cartItem.title}\t${cartItem.price}\t${cartItem.quantity}`).join('\n');
        await fs.promises.writeFile(filePath, `${username}\n${updatedContent}`, 'utf8');
        return { success: true, message: "Item added to cart successfully." };
    } catch (error) {
        console.error("Error updating the cart:", error);
        return { success: false, message: "Error updating the cart." };
    }
}

async function getCartContents(username) {
    const filePath = getUserCartFilePath(username);
    try {
        const fileContent = await readFile(filePath, 'utf8');
        const lines = fileContent.trim().split('\n');
        const items = lines.slice(1).map(line => {
            const [id, title, price, quantity, available] = line.split('\t');
            return { id, title, price, quantity, available: available === 'true' };
        });
        return { success: true, items };
    } catch (error) {
        console.error("Error reading the cart file:", error);
        return { success: false, message: "Error reading the cart." };
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

// Endpoint to get products
app.get('/products', async (req, res) => {
    try {
        const products = await getProducts();
        res.json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch products" });
    }
});

app.post('/addToCart', async (req, res) => {
    const { username, item } = req.body;
    const result = await addItemToCart(username, item);
    res.json(result);
});

app.get('/cart/:username', async (req, res) => {
    const { username } = req.params;
    const filePath = getUserCartFilePath(username);
    try {
        const cartContents = await fs.promises.readFile(filePath, 'utf8');
        const items = cartContents.trim().split('\n').slice(1).map(line => {
            const [id, title, price, quantity] = line.split('\t');
            return { id, title, price, quantity };
        });
        res.json(items); // Send the cart items back to the client
    } catch (error) {
        console.error("Error reading the cart file:", error);
        res.status(500).json({ message: "Error reading the cart." });
    }
});

// Define the port number
const PORT = 3000;
// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
