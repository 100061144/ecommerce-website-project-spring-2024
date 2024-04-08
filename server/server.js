const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const filePath = path.join(__dirname, 'username.txt');
    const data = fs.readFileSync(filePath, 'utf8');
    const lines = data.trim().split('\n');
   
    for (let line of lines) {
      const userDetails = line.split('\t');
      if (userDetails[0] === username && userDetails[1] === password) {
        // Constructing user object from userDetails array
        const user = {
          username: userDetails[0],
          password: userDetails[1], // Including password as per your requirement
          email: userDetails[2],
          phone_number: userDetails[3],
          first_name: userDetails[4],
          last_name: userDetails[5]
        };
        return res.json({ user });
      }
    }
   
    return res.status(401).json({ message: "Invalid credentials" });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
