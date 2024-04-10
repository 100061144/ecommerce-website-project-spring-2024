// auth.js
const fs = require('fs');
const path = require('path');

const authenticateUser = (username, password) => {
    const filePath = path.join(__dirname, '..', 'data', 'users.txt');
    const users = fs.readFileSync(filePath, 'utf8').trim().split('\n');
    
    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const [fileUsername, filePassword, email, phoneNumber, firstName, lastName] = user.split('\t');
        
        if (fileUsername === username && filePassword === password) {
            const isAdmin = (i === 0); // Assuming the first line is the admin
            return { success: true, username: fileUsername, email, phoneNumber, firstName, lastName, isAdmin };
        }
    }
    
    return { success: false, message: "Invalid credentials" };
};

module.exports = { authenticateUser };