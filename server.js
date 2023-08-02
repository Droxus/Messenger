const dbPath = '../MessengerDB/'
const express = require('express');
const fs = require('fs');
const multer = require('multer');
const app = express();
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors'); // Import the cors package
const bcrypt = require('bcrypt');
const saltRounds = 10;
const crypto = require('crypto');

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
    const { data, path } = req.body;
    const jsonData = data;

    if (path.charAt(path.length-1) == '/') {
      const id = String(uuidv4());
      path = path + id  + '.json';
      data.id = id;
    }

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
function updateField(path, fieldName, value) {

}

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
  createFolder(path)
});

app.post('/signUp', async (req, res) => {
    const { login, password, email } = req.body
    const id = String(uuidv4())
    console.log(login, password, email, id)

    allUsers = await readFile(dbPath + 'users.json')
    if (allUsers.find(element => element.login == login)) return res.json({ error: 'User with this login is already registered' });

    hashedPassword = await makeHash(password)
    const newUserPublic = {
      id: id,
      login: login,
      nickname: login,
      description: 'Here no description'
    } 
    const newUser = { ...newUserPublic}
    newUser.email = email
    newUser.password = hashedPassword
    console.log(newUser)
    
    await createFolder(dbPath + 'users')
    await createFolder(dbPath + 'users/' + id)
    await writeFile(dbPath + `users/${id}/user.json`, newUser)
    await writeFile(`${dbPath}users/${id}/chats.json`, [])
    await pushValueIntoField(dbPath + 'users.json', false, newUserPublic)
    return res.json(newUser);
});

app.post('/signIn', async (req, res) => {
    const { login, password } = req.body
    console.log(login, password)

    allUsers = await readFile(dbPath + 'users.json')
    let currentUser = allUsers.find(element => element.login == login)

    if (currentUser) {
      let userData = await readFile(dbPath + `users/${currentUser.id}/user.json`)
      makeCompare(password, userData.password)
      return res.json(userData);
    } else {
      return res.json({ message: 'Wrong login' });
    }
});

app.post('/createGroupChat', async (req, res) => {
    let { data } = req.body;
    const chatID = String(uuidv4());
    const creationTime = new Date().getTime();
    const jsonData = JSON.parse(data)

    jsonData.id = chatID;
    jsonData.creationTime = creationTime;
    jsonData.messages = []
    jsonData.aesKey = crypto.randomBytes(32).toString('hex');

    await createFolder(dbPath + 'chats')
    await writeFile(`${dbPath}chats/${chatID}.json`, jsonData)

    jsonData.participants.forEach(async (participant) => {
      await pushValueIntoField(`${dbPath}users/${participant.id}/chats.json`, false, chatID)
    })
    return res.json(jsonData);
});

app.post('/joinGroupChat', async (req, res) => {
  let { data } = req.body;
  const jsonData = JSON.parse(data)
  const participant = {
    id: jsonData.userID,
    followedUserID: jsonData.followedUserID
  }
  await pushValueIntoField(`${dbPath}chats/${jsonData.chatID}.json`, 'participants', participant)
  await pushValueIntoField(`${dbPath}users/${participant.id}/chats.json`, false, jsonData.chatID)
  const thisChat = await readFile(`${dbPath}chats/${jsonData.chatID}.json`)
  return res.json(thisChat)
});

app.post('/sendMessageChat', async (req, res) => {
  let { data } = req.body;
  const jsonData = JSON.parse(data);
  const messageID = String(uuidv4());
  const creationTime = new Date().getTime();

  let { aesKey } = await readFile(`${dbPath}chats/${jsonData.chatID}.json`)
  aesKey = Buffer.from(aesKey, 'hex')
  console.log(aesKey)
  const encryptedMsg = await encrypt(jsonData.message, aesKey)

  const message = {
    id: messageID,
    creationTime: creationTime,
    userID: jsonData.userID,
    replied: jsonData.replied,
    content: encryptedMsg,
    mediafiles: jsonData.mediafiles
  }

  await pushValueIntoField(`${dbPath}chats/${jsonData.chatID}.json`, 'messages', message)
  return res.json(message)
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

function encrypt(data, key) {
  return new Promise((resolve) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encryptedData = cipher.update(data, 'utf8', 'hex');
    encryptedData += cipher.final('hex');
    resolve({
      iv: iv.toString('hex'),
      encryptedData,
    })
  })
}

function decrypt(encryptedData, key, iv) {
  return new Promise((resolve) => {
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'));
    let decryptedData = decipher.update(encryptedData, 'hex', 'utf8');
    decryptedData += decipher.final('utf8');
    resolve(decryptedData)
  })
}

// const aesKey = crypto.randomBytes(32);
// const originalData = 'Hello, World! Hello, World!';

// const encrypted = encrypt(originalData, aesKey);
// console.log('Encrypted Data:', encrypted);

// const decrypted = decrypt(encrypted.encryptedData, aesKey, encrypted.iv);
// console.log('Decrypted Data:', decrypted);

function pushValueIntoField(path, fieldName, value) {
  return new Promise((resolve) => {
    readFile(path).then((data) => {
        console.log(data)
        if (fieldName) {
          if (!Array.isArray(data[fieldName])) {
            data[fieldName] = [data[fieldName]]
          }
          if (value.id) {
            if (!data[fieldName].some(element => element.id === value.id) && value.id) {
              data[fieldName] = Array.from(new Set(data[fieldName]).add(value))
            }
          } else {
            data[fieldName] = Array.from(new Set(data[fieldName]).add(value))
          }
        } else {
          if (!Array.isArray(data)) {
            data = [data]
          }
          if (value.id) {
            if (!data.some(element => element.id === value.id) && value.id) {
              data = Array.from(new Set(data).add(value))
            }
          } else {
            data = Array.from(new Set(data).add(value))
          }
        }
        writeFile(path, data).then(() => {
          resolve(true)
        })
    })
  })
}
function createFolder(path) {
  return new Promise((resolve) => {
    if (fs.existsSync(path)) {
      resolve(false)
    } else {
      fs.mkdir(path, (err) => {
        if (err) {
          resolve(err)
        } else {
          resolve(true)
        }
      });
    }
  })
}
function writeFile(path, value) {
  return new Promise((resolve) => {
    fs.writeFile(path, JSON.stringify(value, null, 2), (err) => {
      if (err) {
        console.error('Error writing to file:', err);
      } else {
        resolve(value)
        console.log('Data has been written to file');
      }
    });
  })
}
function readFile(path) {
  return new Promise((resolve) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (data) {
        resolve(JSON.parse(data))
      }
      resolve(undefined)
    })
  })
}
function makeHash(password) {
  return new Promise((resolve) => {
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) {
        resolve(err)
        console.error('Error hashing password:', err);
      } else {
        resolve(hash)
        console.log('Hashed password:', hash);
      }
    })
  })
}
function makeCompare(password, hashedPassword) {
  return new Promise((resolve) => {
    bcrypt.compare(password, hashedPassword, (err, result) => {
      if (err) {
        console.error('Error comparing passwords:', err);
        resolve(false)
      } else {
        if (result) {
          console.log('Login successful');
          resolve(true)
        } else {
          console.log('Invalid credentials');
          resolve(false)
        }
      }
    });
  })
}