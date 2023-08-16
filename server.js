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
const nodemailer = require('nodemailer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, dbPath);
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
const userRequestHistory = {};
const requestHistory = {};
app.use('/signIn', async (req, res, next) => {
  const { login } = req.body;
  if (!userRequestHistory[login]) userRequestHistory[login] = [];
  const currentTime = new Date().getTime();
  const fiveMinutesAgo = currentTime - 5 * 60 * 1000;
  userRequestHistory[login] = userRequestHistory[login].filter((timestamp) => timestamp > fiveMinutesAgo);
  if (userRequestHistory[login].length >= 5) return res.status(429).json({ message: 'Rate limit exceeded' });
  userRequestHistory[login].push(currentTime);
  next();
});
app.use('/sendVerifyEmailMsg', async (req, res, next) => {
  const { login, email } = req.body;
  const data = login ? login : email;
  if (!userRequestHistory[data]) userRequestHistory[data] = [];
  const currentTime = new Date().getTime();
  const fiveMinutesAgo = currentTime - 5 * 60 * 1000;
  userRequestHistory[data] = userRequestHistory[data].filter((timestamp) => timestamp > fiveMinutesAgo);
  if (userRequestHistory[data].length >= 5) return res.status(429).json({ message: 'Rate limit exceeded' });
  userRequestHistory[data].push(currentTime);
  next();
});
app.use((req, res, next) => {
  const userIP = req.ip;
  if (!requestHistory[userIP]) requestHistory[userIP] = [];
  const currentTime = new Date().getTime();
  const fiveMinutesAgo = currentTime - 1 * 60 * 1000;
  requestHistory[userIP] = requestHistory[userIP].filter((timestamp) => timestamp > fiveMinutesAgo);
  if (requestHistory[userIP].length >= 100) return res.status(429).json({ message: 'Rate limit exceeded' });
  requestHistory[userIP].push(currentTime);
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
    allUsers = await readFile('users.json')
    if (allUsers.find(element => element.login == login)) return res.json({ message: 'User with this login is already registered' });
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
    await createFolder('users')
    await createFolder('users/' + id)
    await writeFile(`users/${id}/user.json`, newUser)
    await writeFile(`users/${id}/chats.json`, [])
    await writeFile(`users/${id}/groups.json`, [])
    await writeFile(`users/${id}/contacts.json`, [])
    await pushValueIntoField('users.json', false, newUserPublic)
    if (newUser.id) return res.json(newUser);
    return res.json({ message: 'Failed to create new User' });
});
app.post('/signIn', async (req, res) => {
    const { login, password } = req.body
    allUsers = await readFile('users.json')
    let currentUser = allUsers.find(element => element.login == login)
    if (currentUser) {
      let userData = await readFile(`users/${currentUser.id}/user.json`)
      const response = await makeCompare(password, userData.password)
      if (response.message) return res.json(response);
      return res.json(userData)
    } else return res.json({ message: 'Wrong login' });
});
app.post('/sendVerifyEmailMsg', async (req, res) => {
  const { login, email } = req.body
  let currentUser
  if (login) {
    allUsers = await readFile('users.json')
    currentUser = allUsers.find(element => element.login == login)
  }
  if (currentUser || email) {
    let userData
    if (login) userData = await readFile(`users/${currentUser.id}/user.json`)
    const userEmail = login ? userData.email : email;
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: 'yellowdarkwent@gmail.com',
          pass: 'sbyruhhvunzezchi',
      },
    });
    const code = Number(String(Math.pow(10, 4) * Math.random()).replace('.', 0).slice(0, 4))
    const mailOptions = {
      from: 'Your Favourite Messanger',
      to: userEmail,
      subject: 'Your Favourite Messanger',
      text: 'This is the body of the email.',
      html: `<p>This is your code <strong>${code}</strong></p>`
    };
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) return res.json({ message: err })
      return res.json({ code: code })
    });
  } else return res.json({ message: 'Wrong login' });
});
app.post('/resetPassword', async (req, res) => {
  const { login, password } = req.body
  allUsers = await readFile('users.json')
  let currentUser = allUsers.find(element => element.login == login)
  if (currentUser) {
    let userData = await readFile(`users/${currentUser.id}/user.json`)
    const hashedPassword = await makeHash(password)
    userData.password = hashedPassword
    const response = await writeFile(`users/${currentUser.id}/user.json`, userData)
    return res.json(response);
  } else return res.json({ message: 'Wrong login' });
});
app.post('/emailVerified', async (req, res) => {
  const { login } = req.body
  allUsers = await readFile('users.json')
  let currentUser = allUsers.find(element => element.login == login)
  if (currentUser) {
    let userData = await readFile(`users/${currentUser.id}/user.json`)
    userData.emailVerified = true
    const response = await writeFile(`users/${currentUser.id}/user.json`, userData)
    return res.json(response);
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

    await createFolder('groups')
    await writeFile(`groups/${chatID}.json`, jsonData)
    for (const participant of jsonData.participants) {
      await pushValueIntoField(`users/${participant}/groups.json`, false, chatID)
    }
    return res.json(jsonData);
});
app.post('/joinGroupChat', async (req, res) => {
  let { data } = req.body;
  const jsonData = JSON.parse(data)
  const participant = {
    id: jsonData.userID,
    followedUserID: jsonData.followedUserID
  }
  await pushValueIntoField(`groups/${jsonData.chatID}.json`, 'participants', participant)
  await pushValueIntoField(`users/${participant.id}/groups.json`, false, jsonData.chatID)
  const thisChat = await readFile(`groups/${jsonData.chatID}.json`)
  return res.json(thisChat)
});
app.post('/sendMessageChat', async (req, res) => {
  let { data } = req.body;
  const jsonData = JSON.parse(data);
  const messageID = String(uuidv4());
  const creationTime = new Date().getTime();
  
  let { aesKey } = await readFile(jsonData.chatPath)
  aesKey = Buffer.from(aesKey, 'hex')
  const encryptedMsg = await encrypt(jsonData.message, aesKey)

  const message = {
    id: messageID,
    creationTime: creationTime,
    userID: jsonData.userID,
    replied: jsonData.replied,
    content: encryptedMsg,
    mediafiles: jsonData.mediafiles
  }
  await pushValueIntoField(jsonData.chatPath, 'messages', message)
  return res.json(message)
});
app.post('/getChatInfo', async (req, res) => {
  const { path } = req.body;
  let chatInfo = await readFile(path);
  if (chatInfo) {
    for (let index = 0; index < chatInfo.messages.length; index++) {
      const message = chatInfo.messages[index]
      chatInfo.messages[index].content = await decrypt(message.content.encryptedData, Buffer.from(chatInfo.aesKey, 'hex') , message.content.iv);
    }
  }
  return res.send(chatInfo)
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
function pushValueIntoField(path, fieldName, value) {
  return new Promise(async (resolve) => {
    let data = await readFile(path)
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
    let data = await readFile(path)
    if (elementFieldID && elementValueID) {
      const elementIndex = data.findIndex(user => user[elementFieldID] === elementValueID);
      if (elementIndex === -1) return resolve({ message: `Field with ${elementValueID} not found` });
      data[elementIndex][fieldName] = newValue
    } else data[fieldName] = newValue
    const response = await writeFile(path, data)
    resolve(response)
  })
}
function deleteValue(path, fieldName, elementFieldID, elementValueID) {
  return new Promise(async (resolve) => {
    let data = await readFile(path)
    if (elementFieldID && elementValueID) {
      let thisData = Array.isArray(data) ? data : data[fieldName]
      const elementIndex = thisData.findIndex(user => user[elementFieldID] == elementValueID);
      if (elementIndex === -1) return resolve({ message: `Field with ${elementValueID} not found` });
      fieldName && Array.isArray(data)  ? delete thisData[elementIndex][fieldName] : thisData.splice(elementIndex, 1)
      Array.isArray(data) ? data = thisData : data[fieldName] = thisData
    } else {
      if (Array.isArray(data)) data = data.filter(element => element !== fieldName)
      else delete data[fieldName]
    }
    const response = await writeFile(path, data)
    resolve(response)
  })
}
function createFolder(path) {
  return new Promise((resolve) => {
    if (!fs.existsSync(dbPath + path)) {
      resolve(false)
      fs.mkdir(dbPath + path, (err) => {
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
    fs.writeFile(dbPath + path, JSON.stringify(value, null, 2), (err) => {
      if (err) console.error('Error writing to file:', err);
        console.log('Data has been written to file');
      resolve(value)
    });
  })
}
function readFile(path) {
  return new Promise((resolve) => {
    fs.readFile(dbPath + path, 'utf8', (err, data) => {
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
          resolve({message: 'Wrong password'})
        }
      }
    });
  })
}
function getMedia(filePath) {
  return new Promise((resolve) => {
    if (fs.existsSync(dbPath + filePath)) {
      resolve(dbPath + filePath)
    } else {
      resolve(false)
    }
  })
}
function sendMedia(filePath, newPath) {
  return new Promise((resolve) => {
    fs.renameSync(dbPath + filePath, newPath);
    if (req.file) {
      resolve('File uploaded successfully');
    } else {
      console.error('No file uploaded');
    }
  })
}

