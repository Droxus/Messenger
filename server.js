const express = require('express');
const fs = require('fs');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set CORS headers to allow requests from specific origins
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5500'); // Update with the correct origin where main.js is hosted
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
app.get('/api/user', (req, res) => {
  const users = [{ name: 'John' }, { name: 'Jane' }];
  fs.readFile('../MessengerDB/users.json', 'utf8', (err, data) => {
    res.json(JSON.parse(data));
  })
});
app.post('/api/user', (req, res) => {
  try {
    const userData = req.body;
    const filePath = '../MessengerDB/users.json';
    const jsonData = JSON.stringify(userData, null, 2);

    fs.writeFile(filePath, jsonData, (err) => {
      if (err) {
        console.error('Error writing to file:', err);
        res.status(500).json({ error: 'Failed to write to users.json' });
      } else {
        console.log('Data has been written to file');
        res.json({ message: 'Data has been written to users.json' });
      }
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const port = process.env.port ?? 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
