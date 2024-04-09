const fs = require('fs');
const path = require('path');

// Function to authenticate a user
const authenticateUser = (username, password) => {
    try {
        // Construct the file path for the users.txt file
        const filePath = path.join(__dirname, '..', 'data', 'users.txt');
        // Read the file contents
        const data = fs.readFileSync(filePath, 'utf8');
        // Split the file content into lines
        const lines = data.trim().split('\n');

        // Iterate over each line (user) in the file
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // Split each line into fields based on tabs
            const [fileUsername, filePassword] = line.split('\t');

            // Check if the provided credentials match this line's credentials
            if (fileUsername === username && filePassword === password) {
                // If it's the first line, treat the user as an admin
                const isAdmin = (i === 0);
                return { success: true, isAdmin };
            }
        }

        // If no matching credentials were found, return a failure response
        // Inside the for loop in authenticateUser
        console.log(`Parsed username: "${username}", password: "${password}"`);
        return { success: false, message: "Invalid credentials" };
    } catch (error) {
        // Log any errors that occur during file reading or processing
        console.error("Error authenticating user:", error);
        // Return an error response
        return { success: false, message: "An error occurred during authentication." };
    }
};

module.exports = { authenticateUser };