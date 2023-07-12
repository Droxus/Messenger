const express = require('express');
const fs = require('fs');

const app = express();

const port = process.env.port ?? 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5500'); // Update with the correct origin where main.js is hosted
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.get('/api', (req, res) => {
  fs.readFile('../MessengerDB/users.json', 'utf8', (err, data) => {
    res.json(JSON.parse(data));
  })
});

app.post('/api', (req, res) => {
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

app.put('/api/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const updatedUser = req.body;

  fs.readFile('../MessengerDB/users.json', 'utf8', (err, data) => {
    let users = JSON.parse(data)
    const userIndex = users.findIndex(user => user.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ message: `User with ID ${userId} not found` });
    }
    Object.entries(updatedUser).forEach(([key, value]) => {
      users[userIndex][key] = value;
    });

    let jsonData = JSON.stringify(users, null, 2);
    fs.writeFile('../MessengerDB/users.json', jsonData, (err) => {
      if (err) {
        console.error('Error writing to file:', err);
        res.status(500).json({ error: 'Failed to write to users.json' });
      } else {
        console.log('User updated successfully');
        res.json({ message: 'User updated successfully' });
      }
    });
  })
});

app.delete('/api/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  fs.readFile('../MessengerDB/users.json', 'utf8', (err, data) => {
    let users = JSON.parse(data)
    users = users.filter(user => user.id !== userId);
  
    let jsonData = JSON.stringify(users, null, 2);
    fs.writeFile('../MessengerDB/users.json', jsonData, (err) => {
      if (err) {
        console.error('Error writing to file:', err);
        res.status(500).json({ error: 'Failed to write to users.json' });
      } else {
        console.log('User deleted successfully');
        res.json({ message: 'User deleted successfully' });
      }
    });
  })
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});