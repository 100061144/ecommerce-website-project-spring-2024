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
const ordersFilePath = path.join(__dirname, 'data', 'orders.txt');

// Convert fs.readFile into Promise version of same    
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const appendFile = util.promisify(fs.appendFile);
const productsFilePath = path.join(__dirname, 'data', 'products.txt');
const multer = require('multer'); // Import multer
const upload = multer({ dest: 'uploads/' }); // Temporary upload directory


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
        // Handle both Unix (\n) and Windows (\r\n) newlines
        const productBlocks = data.trim().split(/\r?\n\r?\n/);
        const products = productBlocks.map(block => {
            const lines = block.split(/\r?\n/);
            const [id, name, price, quantity] = lines[0].split('\t');
            const description = lines.slice(1).join(' '); // Join the rest as description
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

async function createNewOrder(username, address, city, country) {
    try {
    // Read the user's cart
    const cartFilePath = getUserCartFilePath(username);
    const cartContents = await readFile(cartFilePath, 'utf8');
    const cartLines = cartContents.trim().split('\n').slice(1); // Skip the first line containing the username

    if (cartLines.length === 0) {
        return { success: false, message: "Cart is empty." };
    }

    // Calculate total price
    let totalPrice = 0;
    const productsWithQuantities = cartLines.map(line => {
        const [id, , price, quantity] = line.split('\t');
        totalPrice += parseFloat(price) * parseInt(quantity, 10);
        return `${id}(${quantity})`; // Format: productID(quantity)
    });

    // Generate a new order ID
    const ordersData = await readFile(ordersFilePath, 'utf8');
    const orderLines = ordersData.trim().split('\n\n');
    const lastOrderLine = orderLines[orderLines.length - 1].split('\n')[0];
    const lastOrderId = lastOrderLine.split('\t')[0];
    const orderIdNumber = lastOrderId.startsWith('201-') ? parseInt(lastOrderId.split('-')[1], 10) + 1 : 1;
    const newOrderId = `201-${String(orderIdNumber).padStart(4, '0')}`;

    // Format the new order
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

    const newOrder = `${newOrderId}\t${username}\t${formattedDate}\t${totalPrice}\tPending\t${address}, ${city}, ${country}\n${productsWithQuantities.join('\t')}\n`;

    // Append the new order to orders.txt
    await appendFile(ordersFilePath, `\n${newOrder}`);

    // Clear the user's cart
    await writeFile(cartFilePath, `${username}\n`);

    return { success: true, message: "Order created successfully." };
    } catch (error) {
    console.error("Error creating new order:", error);
    return { success: false, message: "Error creating new order." };
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

// Endpoint to increment item quantity in the cart
app.post('/cart/increment', async (req, res) => {
    const { username, itemId } = req.body;
    const result = await updateCartItemQuantity(username, itemId, 1); // Increment by 1
    res.json(result);
});

// Endpoint to decrement item quantity in the cart
app.post('/cart/decrement', async (req, res) => {
    const { username, itemId } = req.body;
    const result = await updateCartItemQuantity(username, itemId, -1); // Decrement by 1
    res.json(result);
});

app.post('/cart/delete', async (req, res) => {
    const { username, itemId } = req.body;
    const filePath = getUserCartFilePath(username); // Assuming this function returns the path to the user's cart file

    try {
        // Read the current contents of the cart file
        const cartContents = await fs.promises.readFile(filePath, 'utf8');
        const lines = cartContents.split('\n');
        const updatedLines = lines.filter(line => !line.startsWith(itemId)); // Remove the line that starts with the itemId

        // Write the updated lines back to the cart file
        await fs.promises.writeFile(filePath, updatedLines.join('\n'), 'utf8');

        res.json({ success: true, message: "Item deleted successfully." });
    } catch (error) {
        console.error("Error deleting item from cart:", error);
        res.status(500).json({ success: false, message: "Error deleting item from cart." });
    }
});

// Add this endpoint to server.js
app.get('/orders/:username', async (req, res) => {
    const { username } = req.params;
    const ordersFilePath = path.join(__dirname, 'data', 'orders.txt');
    const productsFilePath = path.join(__dirname, 'data', 'products.txt');
    try {
        const productsData = await fs.promises.readFile(productsFilePath, 'utf8');
        const ordersData = await fs.promises.readFile(ordersFilePath, 'utf8');

        // Create a map of product IDs to product names
        const productMap = productsData.trim().split('\n\n').reduce((acc, block) => {
            const [idLine, nameLine] = block.split('\n');
            const id = idLine.split('\t')[0];
            const name = nameLine;
            acc[id] = name;
            return acc;
        }, {});

        // Filter and map orders for the given username, now including the address and parsing product quantities
        const orders = ordersData.trim().split('\n\n').map(block => {
            const lines = block.split('\n');
            const orderDetails = lines[0].split('\t');
            const orderID = orderDetails[0];
            const orderUsername = orderDetails[1];
            const orderDate = orderDetails[2];
            const price = orderDetails[3];
            const orderStatus = orderDetails[4];
            const address = orderDetails.slice(5).join(' '); // Join the rest as the address

            if (orderUsername !== username) return null; // Filter out orders not belonging to the user

            const productIDs = lines[1].split('\t');
            const products = productIDs.map(id => {
                const [productId, quantity] = id.includes('(') ? id.split('(') : [id, '1'];
                const cleanQuantity = quantity ? parseInt(quantity.replace(')', ''), 10) : 1;
                return { id: productId, name: productMap[productId] || 'Unknown Product', quantity: cleanQuantity };
            });

            return { orderID, username: orderUsername, orderDate, price, orderStatus, address, products };
        }).filter(order => order !== null); // Remove nulls from filtered out orders

        res.json({ success: true, orders });
    } catch (error) {
        console.error("Error reading the order or product files:", error);
        res.status(500).json({ success: false, message: "Error processing the order history." });
    }
});

// ADMIN ORDER PAGE
app.get('/orders', async (req, res) => {
    try {
        // Step 1: Read and parse product details
        const productsData = await fs.promises.readFile(path.join(__dirname, 'data', 'products.txt'), 'utf8');
        const productMap = productsData.trim().split(/\r?\n\r?\n/).reduce((acc, productBlock) => {
            // Splitting lines in a block using both \r\n and \n for compatibility
            const lines = productBlock.split(/\r?\n/);
            const [id, name] = lines[0].split('\t'); // Assuming the first line contains ID and name
            acc[id.trim()] = name.trim(); // Trim to remove any leading/trailing spaces
            return acc;
        }, {});

        // Read orders
        const ordersData = await fs.promises.readFile(path.join(__dirname, 'data', 'orders.txt'), 'utf8');
        const orders = ordersData.trim().split('\n\n').map(orderBlock => {
            const lines = orderBlock.split('\n');
            const [orderID, username, orderDate, totalPrice, status, ...addressParts] = lines[0].split('\t');
            const address = addressParts.join(' ');
            const products = lines[1].split('\t').map(productInfo => {
                const [productId, quantity] = productInfo.includes('(') ? productInfo.split('(') : [productInfo, '1'];
                const cleanQuantity = quantity.replace(')', '');
                const productName = productMap[productId] || 'Unknown Product'; // Use the mapping
                return { id: productId, name: productName, quantity: cleanQuantity };
            });
            return { orderID, username, orderDate, totalPrice, status, address, products };
        });
        res.json({ success: true, orders });
    } catch (error) {
        console.error("Error fetching orders or products:", error);
        res.status(500).json({ success: false, message: "Error fetching orders." });
    }
});

// ADMIN UPDATE ORDER STATUS
app.post('/updateOrderStatus', async (req, res) => {
    const { orderID, newStatus } = req.body;
    try {
        let ordersData = await fs.promises.readFile(path.join(__dirname, 'data', 'orders.txt'), 'utf8');
        let orders = ordersData.trim().split('\n\n');
        let updated = false;

        const updatedOrders = orders.map(orderBlock => {
            const lines = orderBlock.split('\n');
            const orderDetails = lines[0].split('\t');
            if (orderDetails[0] === orderID) {
                orderDetails[4] = newStatus; // Update the status
                updated = true;
                return `${orderDetails.join('\t')}\n${lines[1]}`;
            }
            return orderBlock;
        });

        if (updated) {
            await fs.promises.writeFile(path.join(__dirname, 'data', 'orders.txt'), updatedOrders.join('\n\n'), 'utf8');
            res.json({ success: true, message: "Order status updated successfully." });
        } else {
            res.status(404).json({ success: false, message: "Order not found." });
        }
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ success: false, message: "Error updating order status." });
    }
});

// ADMIN DELETE PRODUCT
app.delete('/deleteProduct', async (req, res) => {
    const { productId } = req.body;
    try {
        let productsData = await fs.promises.readFile(productsFilePath, 'utf8');
        const productBlocks = productsData.trim().split(/\r?\n\r?\n/);
        const filteredProducts = productBlocks.filter(block => !block.startsWith(productId + '\t'));

        await fs.promises.writeFile(productsFilePath, filteredProducts.join('\n\n') + '\n');
        res.json({ success: true, message: "Product deleted successfully." });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ success: false, message: "Error deleting product." });
    }
});

// Endpoint to add a product and upload an image
app.post('/addProduct', upload.single('image'), async (req, res) => {
    if (!req.file || req.file.mimetype !== 'image/jpeg') {
        return res.status(400).json({ success: false, message: "Only JPEG images are accepted." });
    }

    const product = JSON.parse(req.body.product);
    const { id, name, price, quantity, description } = product;
    const image = req.file; // Access the uploaded file from req.file

    // Rename and move the file to the public/images directory
    const targetPath = path.join(__dirname, '../client/public/images', `${id}.jpg`);

    fs.rename(image.path, targetPath, async (err) => {
    if (err) {
        console.error("Error saving the image:", err);
        return res.status(500).json({ success: false, message: "Error saving the image." });
    }

    // Read existing products
    const productsFilePath = path.join(__dirname, 'data', 'products.txt');
    try {
        const data = await fs.promises.readFile(productsFilePath, 'utf8');
        const productBlocks = data.trim().split(/\r?\n\r?\n/);
        const products = productBlocks.map(block => {
            const lines = block.split(/\r?\n/);
            const [id, name, price, quantity] = lines[0].split('\t');
            const description = lines.slice(1).join(' '); // Join the rest as description
            return { id, name, price, quantity, description };
        });

        // Add new product
        products.push({ id, name, price, quantity, description });

        // Sort products by ID
        products.sort((a, b) => a.id.localeCompare(b.id));

        // Format products for file writing
        const formattedProducts = products.map(product => `${product.id}\t${product.name}\t${product.price}\t${product.quantity}\n${product.description}`).join('\n\n');

        // Write sorted products back to the file
        await fs.promises.writeFile(productsFilePath, formattedProducts + '\n');

        res.json({ success: true, message: "Product added and sorted successfully." });
    } catch (readError) {
        console.error("Error reading or writing the products file:", readError);
        res.status(500).json({ success: false, message: "Error processing products file." });
    }
    });
});

app.post('/editProduct', async (req, res) => {
    const { id, name, price, quantity, description } = req.body;
    try {
    let productsData = await fs.promises.readFile(productsFilePath, 'utf8');
    let productBlocks = productsData.trim().split(/\r?\n\r?\n/);
    const updatedProducts = productBlocks.map(block => {
        if (block.startsWith(id + '\t')) {
        return `${id}\t${name}\t${price}\t${quantity}\n${description}`;
        }
        return block;
    }).join('\n\n');

    await fs.promises.writeFile(productsFilePath, updatedProducts + '\n');
    res.json({ success: true, message: "Product updated successfully." });
    } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ success: false, message: "Error updating product." });
    }
});

app.post('/createOrder', async (req, res) => {
    const { username, address, city, country } = req.body;
    try {
        const result = await createNewOrder(username, address, city, country);
        if (result.success) {
            // Define the path to the user's cart file
            const cartFilePath = path.join(__dirname, 'data', `${username}'s Cart Details.txt`);

            try {
                await fs.promises.unlink(cartFilePath);
                console.log(`${username}'s cart file deleted successfully.`);
            } catch (err) {
                console.error(`Failed to delete ${username}'s cart file:`, err);
                // Since the order was successfully created, continue to send a success response
            }

            // Respond to the client that the order was created successfully
            res.json({ success: true, message: "Order created successfully." });
        } else {
            // If the order creation was not successful, send an error response
            res.status(400).json({ success: false, message: result.message });
        }
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ success: false, message: "Server error while creating order." });
    }
});

// Function to update item quantity in the cart
async function updateCartItemQuantity(username, itemId, change) {
    const filePath = getUserCartFilePath(username);
    try {
        let fileContent = await fs.promises.readFile(filePath, 'utf8');
        let lines = fileContent.trim().split('\n');
        let updated = false;

        const updatedLines = lines.map(line => {
            if (line.startsWith(itemId)) {
                let parts = line.split('\t');
                let quantity = parseInt(parts[3], 10) + change;
                if (quantity < 1) quantity = 1; // Ensure quantity doesn't go below 1
                parts[3] = String(quantity);
                updated = true;
                return parts.join('\t');
            }
            return line;
        });

        if (updated) {
            await fs.promises.writeFile(filePath, updatedLines.join('\n'), 'utf8');
            return { success: true, message: "Cart updated successfully." };
        } else {
            return { success: false, message: "Item not found in cart." };
        }
    } catch (error) {
        console.error("Error updating the cart:", error);
        return { success: false, message: "Error updating the cart." };
    }
}

// Define the port number
const PORT = 3000;
// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
