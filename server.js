const dbPath = '../MessengerDB/'
const express = require('express');
const fs = require('fs');
const multer = require('multer');
const app = express();
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const crypto = require('crypto');
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

const port = process.env.port ?? 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5500'); // Update with the correct origin where main.js is hosted
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.get('/readFile', async (req, res) => {
  const path = req.query.path;
  const response = await readFile(path)
  return res.json(response);
});
app.post('/write', async (req, res) => {
  const { data, path } = req.body;
  const jsonData = JSON.parse(data);
  const response = await writeFile(path, jsonData)
  return res.json(response);
});
app.post('/push', async (req, res) => {
  const { path, data, fieldName } = req.body
  const jsonData = JSON.parse(data);
  const response = await pushValueIntoField(path, fieldName, jsonData)
  return res.send(response)
});
app.put('/updateField', async (req, res) => {
  const { path, fieldName, newValue, elementFieldID, elementValueID } = req.body
  const response = await updateField(path, fieldName, newValue, elementFieldID, elementValueID)
  return res.json(response);
});
app.put('/deleteValue', async (req, res) => {
  const { path, fieldName, elementFieldID, elementValueID } = req.body
  const response = await deleteValue(path, fieldName, elementFieldID, elementValueID)
  return res.json(response)
});
app.post('/sendMedia', upload.single('file'), (req, res) => {
  const file = req.file;
  const pathParam =  req.query.path;
  const uniqueFilename = uuidv4() + path.extname(file.originalname);
  const newPath = pathParam + uniqueFilename
  return sendMedia(file.path, newPath)
});
app.get('/getMedia/:filename', async (req, res) => {
  const filename = req.params.filename;
  const reqPath = req.query.path
  const filePath = path.join(__dirname, reqPath, filename);

  const mediafile = await getMedia(filePath)
  return res.sendFile(mediafile);
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
    } else return res.json({ message: 'Wrong login' });
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
    jsonData.participants.forEach(async (participant) => await pushValueIntoField(`${dbPath}users/${participant.id}/chats.json`, false, chatID))
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
  return new Promise(async (resolve) => {
    let data = await readFile(path)
    console.log(data)
    let thisData = fieldName ? data[fieldName] : data
    if (!Array.isArray(thisData)) thisData = [thisData]
    if (value.id) {
      if (!thisData.some(element => element.id === value.id) && value.id) thisData = Array.from(new Set(thisData).add(value))
    } else thisData = Array.from(new Set(thisData).add(value))
    fieldName ? data[fieldName] = thisData : data = thisData
    const response = await writeFile(path, data)
    resolve(response)
  })
}
function updateField(path, fieldName, newValue, elementFieldID, elementValueID) {
  return new Promise(async (resolve) => {
    let data = await readFile(dbPath + path)
    if (elementFieldID && elementValueID) {
      const elementIndex = data.findIndex(user => user[elementFieldID] === elementValueID);
      if (elementIndex === -1) return resolve({ message: `Field with ${elementValueID} not found` });
      data[elementIndex][fieldName] = newValue
    } else data[fieldName] = newValue
    const response = await writeFile(dbPath + path, data)
    resolve(response)
  })
}
function deleteValue(path, fieldName, elementFieldID, elementValueID) {
  return new Promise(async (resolve) => {
    let data = await readFile(dbPath + path)
    if (elementFieldID && elementValueID) {
      const elementIndex = data.findIndex(user => user[elementFieldID] === elementValueID);
      if (elementIndex === -1) return resolve({ message: `Field with ${elementValueID} not found` });
      fieldName ? delete data[elementIndex][fieldName] : data.splice(elementIndex, 1)
    } else delete data[fieldName]
    const response = await writeFile(dbPath + path, data)
    resolve(response)
  })
}
function createFolder(path) {
  return new Promise((resolve) => {
    if (!fs.existsSync(path)) {
      resolve(false)
      fs.mkdir(path, (err) => {
        if (err) return resolve(err)
      });
    }
    resolve(true)
  })
}
function writeFile(path, value) {
  return new Promise((resolve) => {
    if (path.charAt(path.length-1) == '/') {
      const id = String(uuidv4());
      path = path + id  + '.json';
      value.id = id;
    }
    fs.writeFile(path, JSON.stringify(value, null, 2), (err) => {
      if (err) console.error('Error writing to file:', err);
        console.log('Data has been written to file');
      resolve(value)
    });
  })
}
function readFile(path) {
  return new Promise((resolve) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (data) resolve(JSON.parse(data))
      resolve(undefined)
    })
  })
}
function makeHash(password) {
  return new Promise((resolve) => {
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) return console.error('Error hashing password:', err);
        console.log('Hashed password:', hash);
      resolve(hash)
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
function getMedia(filePath) {
  return new Promise((resolve) => {
    if (fs.existsSync(filePath)) {
      resolve(filePath)
    } else {
      resolve(false)
    }
  })
}
function sendMedia(filePath, newPath) {
  return new Promise((resolve) => {
    fs.renameSync(filePath, newPath);
    if (req.file) {
      resolve('File uploaded successfully');
    } else {
      console.error('No file uploaded');
    }
  })
}

