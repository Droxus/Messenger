const express = require('express');
const fs = require('fs');
const multer = require('multer');
const app = express();
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors'); // Import the cors package
const bcrypt = require('bcrypt');
const saltRounds = 10;

app.use(cors()); // Enable CORS for all routes

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
    fs.writeFile(path, jsonData, (err) => {
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

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../MessengerDB/');
  },
  filename: function (req, file, cb) {
    console.log(file)
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  const pathParam =  req.query.path;
  const uniqueFilename = uuidv4() + path.extname(file.originalname);
  const newPath = pathParam + uniqueFilename

  fs.renameSync(file.path, newPath);
  if (req.file) {
    res.send('File uploaded successfully');
  } else {
    res.status(400).send('No file uploaded');
  }
});

app.get('/file/:filename', (req, res) => {
  const filename = req.params.filename;
  const reqPath = req.query.path
  const filePath = path.join(__dirname, reqPath, filename);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.sendStatus(404);
  }
});

app.get('/createFolder', (req, res) => {
  const path = req.query.path;

  fs.mkdir(path, (err) => {
    if (err) {
      console.error('Error creating folder:', err);
    } else {
      res.send('Folder created successfully!');
    }
  });
});

app.post('/signUp', (req, res) => {
  try {
    const { login, password, email, path } = req.body
    const id = String(uuidv4())
    console.log(login, password, email, id)

    new Promise((resolve) => {
      fs.readFile(path + 'users.json', 'utf8', (err, data) => {
        resolve(JSON.parse(data))
      })
    }).then((allUsers) => {
      if (allUsers.find(element => element.login == login)) return res.json({ error: 'User with this login is already registered' });

      new Promise((resolve) => {
        bcrypt.hash(password, saltRounds, (err, hash) => {
          if (err) {
            console.error('Error hashing password:', err);
          } else {
            resolve(hash)
            console.log('Hashed password:', hash);
          }
        })
      }).then((hashedPassword) => {
        const newUser = {
          id: id,
          login: login,
          password: hashedPassword,
          email: email,
          nickname: login,
          description: 'Here no description'
        }
  
        if (!fs.existsSync(path + 'users')) {
          fs.mkdir(path + 'users', (err) => {
            if (err) {
              console.error('Error creating folder:', err);
            }
          });
        }
        
        fs.mkdir(path + 'users/' + id, (err) => {
          if (err) {
            console.error('Error creating folder:', err);
          }
        });
  
        fs.writeFile(path + `users/${id}/user.json`, JSON.stringify(newUser, null, 2), (err) => {
          if (err) {
            console.error('Error writing to file:', err);
          } else {
            res.json(newUser)
            console.log('Data has been written to file');
          }
        });
      })

  })
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/signIn', (req, res) => {
  try {
    const { login, password, path } = req.body
    console.log(login, password)

    new Promise((resolve) => {
      fs.readFile(path + 'users.json', 'utf8', (err, data) => {
        resolve(JSON.parse(data))
      })
    }).then((allUsers) => {
      let currentUser = allUsers.find(element => element.login == login)

      if (currentUser) {
        return new Promise((resolve) => {
          fs.readFile(path + `users/${currentUser.id}/user.json`, 'utf8', (err, data) => {
            let userData = JSON.parse(data)

            bcrypt.compare(password, userData.password, (err, result) => {
              if (err) {
                console.error('Error comparing passwords:', err);
                resolve(false)
                return res.json({ message: 'Wrong password' });
              } else {
                if (result) {
                  console.log('Login successful');
                  resolve(true)
                  return res.send(userData)
                } else {
                  console.log('Invalid credentials');
                  resolve(false)
                  return res.json({ message: 'Wrong password' });
                }
              }
            });
          })
        })
      } else {
        return res.json({ message: 'Wrong login' });
      }
    })

  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});