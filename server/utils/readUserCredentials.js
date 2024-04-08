// utils/readUserCredentials.js
const fs = require('fs');
const path = require('path');

const readUserCredentials = (username, password) => {
    const filePath = path.join(__dirname, '../username.txt');
    const data = fs.readFileSync(filePath, 'utf8');
    const lines = data.trim().split('\n');
   
    for (let line of lines) {
      const [fileUsername, filePassword, email] = line.split('\t');
      if (fileUsername === username && filePassword === password) {
        return { username: fileUsername, email }; // Return user object
      }
    }
   
    return null; // Return null if no match
};

module.exports = readUserCredentials;
