// server.js

const express = require('express');
const cors = require('cors'); // Import the cors package
const bodyParser = require('body-parser');
const { authenticateUser } = require('./routes/auth');
const { getUserData } = require('./routes/auth');
const fs = require('fs');
const path = require('path');
const util = require('util');
const ordersFilePath = path.join(__dirname, 'data', 'orders.txt');
const ratingsFilePath = path.join(__dirname, "data", "ratings.txt");
const nodemailer = require('nodemailer');

// Convert fs.readFile into Promise version of same    
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const appendFile = util.promisify(fs.appendFile);
const productsFilePath = path.join(__dirname, 'data', 'products.txt');
const multer = require('multer'); // Import multer
const upload = multer({ dest: 'uploads/' }); // Temporary upload directory

// Function to round a number to n decimal places
function roundTo(n, digits) {
    if (digits === undefined) {
        digits = 0;
    }

    const multiplicator = Math.pow(10, digits);
    n = parseFloat((n * multiplicator).toFixed(11));
    return Math.round(n) / multiplicator;
}

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
        const products = await Promise.all(productBlocks.map(async (block) => {
            const lines = block.split(/\r?\n/);
            const [id, name, price, quantity] = lines[0].split('\t');
            const description = lines.slice(1).join(' ');

            // Calculate the average rating for the product
            const ratingsData = await readFile(ratingsFilePath, 'utf8');
            const ratings = ratingsData.trim().split('\n');
            const productRatings = ratings.filter(rating => rating.split('\t')[1] === id);
            const totalRating = productRatings.reduce((sum, rating) => sum + parseInt(rating.split('\t')[3], 10), 0);
            const averageRating = productRatings.length > 0 ? totalRating / productRatings.length : 0;

            return { id, name, price, quantity, description, averageRating };
        }));
        return products;
    } catch (error) {
        console.error("Error reading the products file:", error);
        throw error;
    }
}

function getUserCartFilePath(username) {
    return path.join(__dirname, 'data', `${username}'s Cart Details.txt`);
}

async function addItemToCart(username, item) {
    const filePath = getUserCartFilePath(username);

    // Initialize cartItems array
    let cartItems = [];

    // Check if the cart file exists
    if (fs.existsSync(filePath)) {
        // If the file exists, read its content
        const fileContent = await fs.promises.readFile(filePath, 'utf8');
        const lines = fileContent.trim().split('\n').slice(1); // Skip the first line containing the username
        cartItems = lines.map(line => {
            const [id, title, price, quantity] = line.split('\t');
            return { id, title, price, quantity: parseInt(quantity, 10) };
        });
    }

    // Proceed with adding or updating the item in the cartItems array
    const existingItemIndex = cartItems.findIndex(cartItem => cartItem.id === item.id);
    if (existingItemIndex !== -1) {
        // If the item exists, update its quantity
        cartItems[existingItemIndex].quantity += item.quantity;
    } else {
        // If the item doesn't exist, add it to the cart
        cartItems.push(item);
    }

    // Reconstruct the file content with the updated cartItems array
    const updatedContent = cartItems.map(cartItem => `${cartItem.id}\t${cartItem.title}\t${cartItem.price}\t${cartItem.quantity}`).join('\n');
    // Write the updated content to the file, creating it if it doesn't exist
    await fs.promises.writeFile(filePath, `${username}\n${updatedContent}`, 'utf8');

    return { success: true, message: "Item added to cart successfully." };
}

async function createNewOrder(username, fullAddress) {
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

        const newOrder = `${newOrderId}\t${username}\t${formattedDate}\t${totalPrice}\tPending\t${fullAddress}\n${productsWithQuantities.join('\t')}\n`;

        const productsData = await readFile(productsFilePath, 'utf8');
        const productBlocks = productsData.split(/\r?\n\r?\n/);
        const updatedProductBlocks = productBlocks.map(block => {
            const lines = block.split(/\r?\n/);
            const [id, name, price, quantity] = lines[0].split('\t');
            const description = lines.slice(1).join(' ');

            // Check if the product is in the order
            const orderedProduct = productsWithQuantities.find(product => product.startsWith(id));
            if (orderedProduct) {
                const [, orderedQuantity] = orderedProduct.split('(');
                const newQuantity = parseInt(quantity, 10) - parseInt(orderedQuantity, 10);
                return `${id}\t${name}\t${price}\t${newQuantity}\n${description}`;
            }

            return block;
        });

        // Determine if the original data ended with a newline
        const shouldEndWithNewline = productsData.endsWith('\n');

        let finalData = updatedProductBlocks.join('\n\n');
        if (shouldEndWithNewline && !finalData.endsWith('\n')) {
            finalData += '\n'; // Ensure the final data ends with a newline if the original did
        }

        await writeFile(productsFilePath, finalData, 'utf8');

        // Append the new order to orders.txt
        await appendFile(ordersFilePath, `\n${newOrder}`);

        // Clear the user's cart
        await writeFile(cartFilePath, `${username}\n`);

        return { success: true, message: "Order created successfully.", orderID: newOrderId, orderDate: formattedDate, totalPrice };

    } catch (error) {
        console.error("Error creating new order:", error);
        return { success: false, message: "Error creating new order." };
    }
}

async function sendOrderStatusEmail(username, orderID, orderDate, totalPrice, address, status) {
    try {
        const usersData = await readFile(path.join(__dirname, 'data', 'users.txt'), 'utf8');
        const users = usersData.trim().split('\n');
        const user = users.find(user => user.split('\t')[0] === username);
        if (!user) {
            console.error(`User ${username} not found.`);
            return;
        }
        const [, , email] = user.split('\t');

        let subject = '';
        let emailBody = '';

        switch (status) {
            case 'Pending':
                subject = 'Order Confirmation';
                emailBody = `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2 style="color: #007bff;">UAE Traditional Mart</h2>
                    <p>Dear ${username},</p>
        
                    <p>Thank you for your order!</p>
        
                    <p><strong>Order ID:</strong> ${orderID}<br>
                    <strong>Order Date:</strong> ${orderDate}<br>
                    <strong>Total Price:</strong> ${totalPrice} AED<br>
                    <strong>Shipping Address:</strong> ${address}</p>
        
                    <p>We will process your order and ship it as soon as possible.<br>
                    Happy shopping!</p>
        
                    <hr>
                    <p>Best regards,<br>UAE Traditional Mart</p>
                </div>
                `;
                break;
            case 'Shipped':
                subject = 'Order Shipped';
                emailBody = `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2 style="color: #007bff;">UAE Traditional Mart</h2>
                    <p>Dear ${username},</p>
        
                    <p>Your order has been shipped!</p>
        
                    <p><strong>Order ID:</strong> ${orderID}<br>
                    <strong>Order Date:</strong> ${orderDate}<br>
                    <strong>Total Price:</strong> ${totalPrice} AED<br>
                    <strong>Shipping Address:</strong> ${address}</p>
        
                    <p>You can expect delivery soon. Thank you for shopping with us.</p>
        
                    <hr>
                    <p>Best regards,<br>UAE Traditional Mart</p>
                </div>
                `;
                break;
            case 'Delivered':
                subject = 'Order Delivered';
                emailBody = `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2 style="color: #007bff;">UAE Traditional Mart</h2>
                    <p>Dear ${username},</p>
        
                    <p>Your order has been delivered!</p>
        
                    <p><strong>Order ID:</strong> ${orderID}<br>
                    <strong>Order Date:</strong> ${orderDate}<br>
                    <strong>Total Price:</strong> ${totalPrice} AED<br>
                    <strong>Shipping Address:</strong> ${address}</p>
        
                    <p>We hope you enjoy your purchase. Thank you for shopping with us.</p>
        
                    <hr>
                    <p>Best regards,<br>UAE Traditional Mart</p>
                </div>
                `;
                break;
            default:
                // Handle other statuses or default case
                return; // Exit if the status is not recognized
        }

        // Setup mailOptions within the switch/case structure
        const mailOptions = {
            from: 'uaetraditionalmart@gmail.com',
            to: email,
            subject: subject,
            html: emailBody,
        };

        // Send the email outside the switch/case structure
        await transporter.sendMail(mailOptions);
        console.log(`Order status (${status}) email sent to ${email}`);
    } catch (error) {
        console.error('Error sending order status email:', error);
    }
}

const app = express();

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'uaetraditionalmart@gmail.com',
        pass: 'zrso hmuf dkcq tcab',
    },
});

const getBasicAnalytics = () => {
    return { data: "Basic analytics data" };
};

const getCategoryAnalytics = () => {
    return { data: "Category analytics data" };
};

const getRatingsAnalytics = () => {
    return { data: "Ratings analytics data" };
};

// Use cors middleware to enable CORS
app.use(cors());

// Use bodyParser middleware to parse JSON bodies
app.use(bodyParser.json());

// USER/ADMIN LOGIN
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const result = authenticateUser(username, password);
    if (result.success) {
        res.json(result); // Returns username, email, phoneNumber, firstName, lastName
    } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
    }
});

// USER FORGOT PASSWORD
app.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const usersData = await readFile(path.join(__dirname, 'data', 'users.txt'), 'utf8');
        const users = usersData.trim().split('\n');
        const user = users.find(user => user.split('\t')[2] === email);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        const mailOptions = {
            from: 'uaetraditionalmart@gmail.com',
            to: email,
            subject: 'Password Reset Request',
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2 style="color: #007bff;">UAE Traditional Mart</h2>
                    <p>You requested a password reset for your account.</p>
                    <p>Please click the button below to set a new password:</p>
                    <a href="http://localhost:3001/reset-password/${encodeURIComponent(email)}" style="background-color: #007bff; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
                    <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
                    <hr>
                    <p>Thank you,<br>UAE Traditional Mart IT Team <br>050 123 4567</p>
                </div>
            `,
        };
        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: "Password reset link sent." });
    } catch (error) {
        console.error("Error sending password reset email:", error);
        res.status(500).json({ success: false, message: "Error sending password reset email." });
    }
});

// USER RESET PASSWORD
app.post('/reset-password/:email', async (req, res) => {
    const { email } = req.params;
    const { newPassword } = req.body;
    try {
        let usersData = await readFile(path.join(__dirname, 'data', 'users.txt'), 'utf8');
        let users = usersData.trim().split('\n');
        let found = false;
        let updatedUsers = users.map(user => {
            const parts = user.split('\t');
            if (parts[2] === decodeURIComponent(email)) {
                parts[1] = newPassword; // Update the password
                found = true;
            }
            return parts.join('\t');
        });
        if (!found) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        await writeFile(path.join(__dirname, 'data', 'users.txt'), updatedUsers.join('\n') + '\n', 'utf8'); // Add newline at the end
        res.json({ success: true, message: "Password reset successful." });
    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ success: false, message: "Error resetting password." });
    }
});

// USER SIGNUP
app.post('/signup', async (req, res) => {
    const { username, password, email, phoneNumber, firstName, lastName } = req.body;

    const filePath = path.join(__dirname, 'data', 'users.txt');

    try {
        const data = await fs.promises.readFile(filePath, 'utf8');
        const users = data.trim().split('\n');

        // Check if the username or email already exists
        const userExists = users.some(user => {
            const [fileUsername, , fileEmail] = user.split('\t');
            return fileUsername === username || fileEmail === email;
        });

        console.log('User exists:', userExists);
        if (userExists) {
            console.log('Returning username/email exists message');
            return res.status(400).json({ success: false, message: 'Username or email already exists.' });
        }

        // If the username or email doesn't exist, proceed to append the new user
        const newUserLine = `${username}\t${password}\t${email}\t${phoneNumber}\t${firstName}\t${lastName}\n`;
        await fs.promises.appendFile(filePath, newUserLine);
        console.log('User signed up successfully');
        res.status(200).json({ success: true, message: 'User signed up successfully.' });
    } catch (err) {
        console.error('Failed to read or append new user to file:', err);
        res.status(500).json({ success: false, message: 'Error signing up the user.' });
    }
});

// USER AUTHENTICATION
app.get('/isAuthenticated', (req, res) => {
    // This is a simplified example. You should secure this endpoint.
    const isAuthenticated = checkAuthentication(); // Implement this function based on your .txt file logic
    res.json({ isAuthenticated });
});

// USER GET PROFILE USERNAME
app.get('/profile/:username', (req, res) => {
    const { username } = req.params;
    const userData = getUserData(username);

    if (userData) {
        res.json({ success: true, userData });
    } else {
        res.status(404).json({ success: false, message: 'User not found' });
    }
});

// USER UPDATE PROFILE
app.post('/updateProfile', async (req, res) => {
    const { originalUsername, ...updates } = req.body;
    const result = await updateUserProfile(originalUsername, updates);
    res.json(result);
});

// USER CHECK USERNAME
app.post('/checkUsername', async (req, res) => {
    const { username, originalUsername } = req.body;
    const filePath = path.join(__dirname, 'data', 'users.txt');
    try {
        const data = await readFile(filePath, 'utf8');
        const usernames = data.split('\n').map(line => line.split('\t')[0]);
        if (username !== originalUsername && usernames.includes(username)) {
            res.json({ success: false, message: "Username already exists." });
        } else {
            res.json({ success: true });
        }
    } catch (error) {
        console.error("Error checking username:", error);
        res.status(500).json({ success: false, message: "Server error while checking username." });
    }
});

// USER DELETE ACCOUNT
app.delete('/deleteAccount', async (req, res) => {
    const { username } = req.body; // Username is sent in the request body

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

// ADMIN GET USERS
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

// ADMIN DELETE USER
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

// USER/ADMIN GET PRODUCTS
app.get('/products', async (req, res) => {
    try {
        const products = await getProducts();
        res.json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch products" });
    }
});

// USER/ADMIN GET PRODUCTS DETAILS
app.get('/product/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const data = await readFile(productsFilePath, 'utf8');
        const products = data.trim().split(/\r?\n\r?\n/); // Split by double newline to get each product block
        const product = products.find(p => p.startsWith(id + '\t')); // Find the product by ID
        if (product) {
            const lines = product.split(/\r?\n/);
            const [productId, name, price, quantity] = lines[0].split('\t');
            const description = lines.slice(1).join(' '); // Join the rest as description
            res.json({ id: productId, name, price, quantity: parseInt(quantity, 10), description });
        } else {
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        console.error("Error reading the products file:", error);
        res.status(500).json({ message: "Error fetching product details" });
    }
});

// USER ADD PRODUCT (to cart)
app.post('/addToCart', async (req, res) => {
    const { username, item } = req.body;
    const result = await addItemToCart(username, item);
    res.json(result);
});

// USER GET CART
app.get('/cart/:username', async (req, res) => {
    const { username } = req.params;
    const filePath = getUserCartFilePath(username);

    if (!fs.existsSync(filePath)) {
        return res.json([]);
    }
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

// USER INCREMENT ITEM
app.post('/cart/increment', async (req, res) => {
    const { username, itemId } = req.body;
    const result = await updateCartItemQuantity(username, itemId, 1); // Increment by 1
    res.json(result);
});

// USER DECREMENT ITEM
app.post('/cart/decrement', async (req, res) => {
    const { username, itemId } = req.body;
    const result = await updateCartItemQuantity(username, itemId, -1); // Decrement by 1
    res.json(result);
});

// USER CART DELETE (after order is successful)
app.post('/cart/delete', async (req, res) => {
    const { username, itemId } = req.body;
    const filePath = getUserCartFilePath(username); // Returns the path to the user's cart file

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

// USER GET ORDERS
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
        const orders = ordersData.trim().split(/\r?\n\r?\n/).map(block => {
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

// ADMIN ANALYTICS PAGE
app.get('/analytics', async (req, res) => {
    try {
        const ordersData = await readFile(ordersFilePath, 'utf8');
        const productsData = await readFile(productsFilePath, 'utf8');
        const ratingsData = await readFile(ratingsFilePath, 'utf8');

        // Splitting the data into lines and then processing
        const ordersLines = ordersData.trim().split(/\r?\n\r?\n/);
        const productLines = productsData.trim().split('\n\n');

        // Creating a map of product IDs to product names and quantities
        const productMap = productLines.reduce((acc, block) => {
            const lines = block.split('\n');
            const [id, name, price, quantity] = lines[0].split('\t');
            acc[id] = { name, price: parseFloat(price), quantity: parseInt(quantity, 10) };
            return acc;
        }, {});

        // Counting orders and quantities for each product
        const productCounts = {};
        ordersLines.forEach(order => {
            const productIDs = order.split('\n')[1].split('\t');
            productIDs.forEach(id => {
                const [productId, quantity] = id.split('(');
                const parsedQuantity = parseInt(quantity, 10);
                if (productMap[productId]) {
                    if (!productCounts[productId]) {
                        productCounts[productId] = {
                        orderCount: 0,
                        totalOrdered: 0,
                        };
                    }
                    productCounts[productId].orderCount += 1;
                    productCounts[productId].totalOrdered += parsedQuantity;
                }
            });
        });

        // Preparing analytics data
    const analytics = {
        mostOrderedProduct: null,
        leastOrderedProduct: null,
        mostQuantityOrderedProduct: null,
        leastQuantityOrderedProduct: null,
    };

    Object.entries(productCounts).forEach(([productId, counts]) => {
        const product = productMap[productId];
        if (product) {
        if (!analytics.mostOrderedProduct || counts.orderCount > analytics.mostOrderedProduct.orderCount) {
            analytics.mostOrderedProduct = { ...product, ...counts };
        }
        if (!analytics.leastOrderedProduct || counts.orderCount < analytics.leastOrderedProduct.orderCount) {
            analytics.leastOrderedProduct = { ...product, ...counts };
        }
        if (!analytics.mostQuantityOrderedProduct || counts.totalOrdered > analytics.mostQuantityOrderedProduct.totalOrdered) {
            analytics.mostQuantityOrderedProduct = { ...product, ...counts };
        }
        if (!analytics.leastQuantityOrderedProduct || counts.totalOrdered < analytics.leastQuantityOrderedProduct.totalOrdered) {
            analytics.leastQuantityOrderedProduct = { ...product, ...counts };
        }
        }
    });

        // Initialize variables for additional analytics
        let highestTotalPriceOrder = { orderID: null, totalPrice: 0 };
        let lowestTotalPriceOrder = { orderID: null, totalPrice: Infinity };

        ordersLines.forEach(order => {
            const lines = order.split('\n');
            const [orderID, , , totalPrice] = lines[0].split('\t');
            const price = parseFloat(totalPrice);

            // Check for highest total price order
            if (price > highestTotalPriceOrder.totalPrice) {
                highestTotalPriceOrder = { orderID, totalPrice: price };
            }

            // Check for lowest total price order
            if (price < lowestTotalPriceOrder.totalPrice) {
                lowestTotalPriceOrder = { orderID, totalPrice: price };
            }
        });

        // Find the product with the least quantity ordered
        let leastQuantityOrderedProduct = null;
            Object.entries(productCounts).forEach(([productId, counts]) => {
            const product = productMap[productId];
            if (product) {
                if (!leastQuantityOrderedProduct || counts.totalOrdered < leastQuantityOrderedProduct.totalOrdered) {
                    leastQuantityOrderedProduct = { ...product, ...counts };
                }
            }
        });

        // Adding new metrics to the analytics object
        analytics.leastQuantityOrderedProduct = leastQuantityOrderedProduct;
        analytics.highestTotalPriceOrder = highestTotalPriceOrder;
        analytics.lowestTotalPriceOrder = lowestTotalPriceOrder;
        

        // Calculate AOV (Average Order Value)
        const totalRevenue = ordersLines.reduce((acc, order) => {
            const lines = order.split('\n');
            const totalPrice = parseFloat(lines[0].split('\t')[3]);
            return acc + totalPrice;
        }, 0);
        const aov = roundTo(totalRevenue / ordersLines.length, 2); // Round to 2 decimal places

        // Calculate Sales by Product Category
        const salesByCategory = ordersLines.reduce((acc, order) => {
            const lines = order.split('\n');
            const productsLine = lines[1];
            const productIDs = productsLine.split('\t');
        
            productIDs.forEach(idWithQuantity => {
                const [productId, quantityPart] = idWithQuantity.split('(');
                const quantity = parseInt(quantityPart, 10); // Correctly parse the quantity
                const product = productMap[productId];
        
                if (product) {
                    const category = productId.split('-')[0];
                    if (!acc[category]) {
                        acc[category] = { totalQuantity: 0, totalSales: 0.0 };
                    }
                    acc[category].totalQuantity += quantity;
                    acc[category].totalSales += roundTo(product.price * quantity, 2);
                }
            });
        
            return acc;
        }, {});

        // Adding new metrics to the analytics object
        analytics.aov = roundTo(aov, 2);
        analytics.salesByCategory = salesByCategory;

        // Calculate average ratings
        const ratingsLines = ratingsData.trim().split('\n');
        const ratings = ratingsLines.reduce((acc, line) => {
            const [username, productId, productName, rating] = line.split('\t');
            if (!acc[productId]) {
                acc[productId] = { productName, totalRating: 0, count: 0 };
            }
            acc[productId].totalRating += parseInt(rating, 10);
            acc[productId].count += 1;
            return acc;
        }, {});

        const averageRatings = Object.entries(ratings).map(([productId, { productName, totalRating, count }]) => ({
            productId,
            productName,
            averageRating: roundTo(totalRating / count, 2),
        }));

        let bestRatedProduct = averageRatings.reduce((best, product) => product.averageRating > best.averageRating ? product : best, { productId: null, productName: null, averageRating: 0 });
        let worstRatedProduct = averageRatings.reduce((worst, product) => product.averageRating < worst.averageRating ? product : worst, { productId: null, productName: null, averageRating: Infinity });

        analytics.bestRatedProduct = bestRatedProduct;
        analytics.worstRatedProduct = worstRatedProduct;

        res.json({ success: true, analytics });
    } catch (error) {
        console.error("Error generating analytics:", error);
        res.status(500).json({ success: false, message: "Error processing analytics data." });
    }
});

app.get('/api/analytics/basic', (req, res) => {
    res.json(getBasicAnalytics());
});

app.get('/api/analytics/category', (req, res) => {
    res.json(getCategoryAnalytics());
});

app.get('/api/analytics/ratings', (req, res) => {
    res.json(getRatingsAnalytics());
});

// ADMIN ORDER PAGE
app.get('/orders', async (req, res) => {
    try {
        // Step 1: Read and parse product details
        const productsData = await fs.promises.readFile(path.join(__dirname, 'data', 'products.txt'), 'utf8');
        const productMap = productsData.trim().split(/\r?\n\r?\n/).reduce((acc, productBlock) => {
            // Splitting lines in a block using both \r\n and \n for compatibility
            const lines = productBlock.split(/\r?\n/);
            const [id, name] = lines[0].split('\t'); // 1st line contains ID and name
            acc[id.trim()] = name.trim(); // Trim to remove any leading/trailing spaces
            return acc;
        }, {});

        // Read orders
        const ordersData = await fs.promises.readFile(path.join(__dirname, 'data', 'orders.txt'), 'utf8');
        const orders = ordersData.trim().split(/\r?\n\r?\n/).map(orderBlock => {
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
        let orders = ordersData.split('\n\n').map(order => order.trim()); // Split and trim each order block
        let updated = false;
        let currentStatus = ""; // Variable to hold the current status before update
        let username, orderDate, totalPrice, address;

        const updatedOrders = orders.map(orderBlock => {
            const lines = orderBlock.split('\n');
            const orderDetails = lines[0].split('\t');
            if (orderDetails[0] === orderID) {
                currentStatus = orderDetails[4]; // Capture the current status
                username = orderDetails[1];
                orderDate = orderDetails[2];
                totalPrice = orderDetails[3];
                address = orderDetails.slice(5).join(' '); // Address is stored from the 6th element onwards
                orderDetails[4] = newStatus; // Update the status
                updated = true;
                return `${orderDetails.join('\t')}\n${lines[1]}`; // Construct the updated order block
            }
            return orderBlock; // Return the original order block if not updated
        });

        // Determine if the original data ended with a newline
        const shouldEndWithNewline = ordersData.endsWith('\n');

        if (updated) {
            let finalData = updatedOrders.join('\n\n');
            if (shouldEndWithNewline) {
                finalData += '\n'; // Ensure the final data ends with a newline if the original did
            }
            await fs.promises.writeFile(path.join(__dirname, 'data', 'orders.txt'), finalData, 'utf8');
            // Check if the status has been updated to "Shipped" or "Delivered" and currentStatus is not the same as newStatus
            if ((newStatus === "Shipped" || newStatus === "Delivered") && currentStatus !== newStatus) {
                await sendOrderStatusEmail(username, orderID, orderDate, totalPrice, address, newStatus);
            }
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

// ADMIN ADD PRODUCT
app.post('/addProduct', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "Image upload failed." });
    }
    if (!req.body.product) {
        return res.status(400).json({ success: false, message: "Product data is missing." });
    }

    const product = JSON.parse(req.body.product);
    const { id, name, price, quantity, description } = product;

    // Read existing products
    const productsFilePath = path.join(__dirname, 'data', 'products.txt');
    try {
        const data = await fs.promises.readFile(productsFilePath, 'utf8');
        const productBlocks = data.trim().split(/\r?\n\r?\n/);
        const products = productBlocks.map(block => {
            const lines = block.split(/\r?\n/);
            const [existingId, existingName, existingPrice, existingQuantity] = lines[0].split('\t');
            const existingDescription = lines.slice(1).join(' '); // Join the rest as description
            return { id: existingId, name: existingName, price: existingPrice, quantity: existingQuantity, description: existingDescription };
        });

        // Check for duplicate product ID
        if (products.some(product => product.id === id)) {
            return res.status(400).json({ success: false, message: "Product ID already exists." });
        }

        // Rename and move the file to the public/images directory
        const image = req.file; // Access the uploaded file from req.file
        const targetPath = path.join(__dirname, '../client/public/images', `${id}.jpg`);
        fs.rename(image.path, targetPath, async (err) => {
            if (err) {
                console.error("Error saving the image:", err);
                return res.status(500).json({ success: false, message: "Error saving the image." });
            }

            // Add new product
            products.push({ id, name, price, quantity, description });

            // Sort products by ID
            products.sort((a, b) => a.id.localeCompare(b.id));

            // Format products for file writing
            const formattedProducts = products.map(product => `${product.id}\t${product.name}\t${product.price}\t${product.quantity}\n${product.description}`).join('\n\n');

            // Write sorted products back to the file
            await fs.promises.writeFile(productsFilePath, formattedProducts + '\n');

            res.json({ success: true, message: "Product added and sorted successfully." });
        });
    } catch (readError) {
        console.error("Error reading or writing the products file:", readError);
        res.status(500).json({ success: false, message: "Error processing products file." });
    }
});

// ADMIN EDIT PRODUCT
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

// USER CREATE ORDER
app.post('/createOrder', async (req, res) => {
    const { username, address, city, country } = req.body;
    
    // Combine address, city, and country into a single string
    const fullAddress = `${address}, ${city}, ${country}`;
    
    try {
        const result = await createNewOrder(username, fullAddress);
        if (result.success) {
            // Define the path to the user's cart file
            const cartFilePath = path.join(__dirname, 'data', `${username}'s Cart Details.txt`);

            try {
                await fs.promises.unlink(cartFilePath);
                await sendOrderStatusEmail(username, result.orderID, result.orderDate, result.totalPrice, fullAddress, "Pending");
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

// USER SUBMIT RATING
app.post("/submitRating", async (req, res) => {
    const { username, productId, productName, rating } = req.body;
    try {
        // Read the existing ratings
        const existingRatings = await fs.promises.readFile(ratingsFilePath, 'utf8');
        const ratings = existingRatings.trim().split('\n');

        // Initialize a flag to check if the rating was updated
        let updated = false;

        // Map through ratings to update or keep existing
        const updatedRatings = ratings.map(ratingLine => {
            const [rateUsername, rateProductId, rateProductName, oldRating] = ratingLine.split('\t');
            if (rateUsername === username && rateProductId === productId) {
                updated = true; // Mark as updated
                return `${username}\t${productId}\t${productName}\t${rating}`; // Update the rating
            }
            return ratingLine; // Return unchanged rating
        });

        // If the rating was not updated (i.e., no existing rating was found), append the new rating
        if (!updated) {
            updatedRatings.push(`${username}\t${productId}\t${productName}\t${rating}`);
        }

        // Write the updated or new ratings back to the file
        await fs.promises.writeFile(ratingsFilePath, updatedRatings.join('\n') + '\n');

        res.json({ success: true, message: "Rating submitted successfully." });
    } catch (error) {
        console.error("Error submitting rating:", error);
        res.status(500).json({ success: false, message: "Error submitting rating." });
    }
});

// Function to update item quantity in the cart
async function updateCartItemQuantity(username, itemId, change) {
    const filePath = getUserCartFilePath(username);
    // Check if the cart file exists before attempting to update
    if (!fs.existsSync(filePath)) {
        // If the file doesn't exist, there are no items to update
        return { success: false, message: "Cart file does not exist, implying the cart is empty or the user does not exist." };
    }

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
