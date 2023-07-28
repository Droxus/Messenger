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

app.get('/', (req, res) => {
  const path = req.query.path;
  fs.readFile(path, 'utf8', (err, data) => {
    res.json(JSON.parse(data));
  })
});

app.post('/', (req, res) => {
  try {
    const { data, path } = req.body
    // const userData = req.body.data;
    const jsonData = data;

    fs.writeFile(path, jsonData, (err) => {
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

app.put('/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const { data, path } = req.body
  fs.readFile(path, 'utf8', (err, dataFile) => {
    let users = JSON.parse(dataFile)
    const userIndex = users.findIndex(user => user.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ message: `User with ID ${userId} not found` });
    }
    Object.entries(data).forEach(([key, value]) => {
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

app.delete('/', (req, res) => {
  const pathQuery = req.query.path;
  const userId = pathQuery.slice(pathQuery.lastIndexOf('/')+1, pathQuery.length)
  const path = pathQuery.slice(0, pathQuery.lastIndexOf('/'))

  fs.readFile(path, 'utf8', (err, data) => {
    let users = JSON.parse(data)
    users = users.filter(user => user.id !== Number(userId));
    let jsonData = JSON.stringify(users, null, 2);
    
    fs.writeFile(path, jsonData, (err) => {
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