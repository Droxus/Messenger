const serverPath = 'http://localhost:3000/'
const db = {
    readFile: async (path) => {
        const response = await fetch(serverPath + 'readFile?path=' + path)
        if (!response.ok) return console.error('Failed to read');
        return response.json()
    }, 
    write: async (path, data) => {
        if (!Array.isArray(data)) data = [data];
        const response = await fetch(serverPath + 'write', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            data: JSON.stringify(data, null, 2),
            path: path
          }) 
        })
        if (!response.ok) return console.error('Failed to write');
        return response.json()
    },
    push: async (path, data, fieldName) => {
        const response = await fetch(serverPath + 'push', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            data: JSON.stringify(data, null, 2),
            path: path,
            fieldName: fieldName
          }) 
        })
        if (!response.ok) return console.error('Failed to push');
        return response
    },
    updateField: async (path, fieldName, newValue, elementFieldID, elementValueID) => {
        const response = await fetch(serverPath + 'updateField', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            path: path,
            fieldName: fieldName,
            newValue: newValue,
            elementFieldID: elementFieldID,
            elementValueID: elementValueID
          }) 
        })
        if (!response.ok) return console.error('Failed to update');
        return response
    },
    deleteValue: async (path, fieldName, elementFieldID, elementValueID) => {
        const response = await fetch(serverPath + 'deleteValue', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            path: path,
            fieldName: fieldName,
            elementFieldID: elementFieldID,
            elementValueID: elementValueID
          }) 
        })
        if (!response.ok) return console.error('Failed to delete');
        return response
    },
    sendMedia: async (path, file) => {
      return new Promise((resolve) => {
        const formData = new FormData();
        formData.append('file', file);
        const xhr = new XMLHttpRequest();
  
        xhr.upload.addEventListener('progress', event => {
          if (event.lengthComputable) {
            const percentage = Math.round((event.loaded / event.total) * 100);
            console.log(`Uploading: ${percentage}%`);
          }
        });
        xhr.addEventListener('load', (file) => {
          console.log('Upload complete!');
          resolve(file)
        });
        xhr.addEventListener('error', () => {
          console.error('Upload failed!');
          resolve('Error')
        });
  
        xhr.open('POST', `${serverPath}sendMedia?path=${path + '/'}`);
        xhr.send(formData);
      })

    },
    getMedia: async (path) => {
        const fileName = path.slice(path.lastIndexOf('/')+1, path.length)
        const basicPath = path.slice(0, path.lastIndexOf('/'))
        console.log(fileName, basicPath)
        const response = await fetch(serverPath + `getMedia/${fileName}?path=${basicPath}`)
        if (!response.ok) return console.error('Failed to get media');
        return response.blob()
    },
    createFolder: async (path) => {
        const response = await fetch(serverPath + `createFolder?path=${path}`)
        if (!response.ok) return console.error('Failed to create folder');
        return response
    },
    signUpUser: async (login, password, email) => {
      const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!regex.test(email)) return { message: 'Please enter a valid email address' }
      if (login.length < 4) return { message: 'Login length must be more than 4 symbols' }
      if (login.length > 16) return { message: 'Login length should not exceed 16 symbols' }
      if (password.length < 8) return { message: 'Password length must be more than 8 symbols' }
      if (password.length > 20) return { message: 'Password length should not exceed 20 symbols' }
        const response = await fetch(serverPath + 'signUp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            login: login,
            password: password,
            email: email
          }) 
        })
        if (!response.ok) console.error('Network response was not ok');
        const data = await response.json();
        if (!data.id) console.error('Sign up error')
        return data
    },
    signInUser: async (login, password) => {
        const response = await fetch(serverPath + 'signIn', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            login: login,
            password: password
          }) 
        })
        if (!response.ok) console.error('Network response was not ok');
        const data = await response.json();
        if (!data.id) console.error('Sign in error')
        return data
    },
    sendVerifyEmailMsg: async (email, login) => {
      const response = await fetch(serverPath + 'sendVerifyEmailMsg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          login: login,
          email, email
        }) 
      })
      if (!response.ok) console.error('Network response was not ok');
      const data = await response.json();
      if (!data.code) return { message: 'Wrong Login' }
      return data.code
    },
    resetPassword: async (login, password) => {
      if (password.length < 8) return { message: 'Password length must be more than 8 symbols' }
      if (password.length > 20) return { message: 'Password length should not exceed 20 symbols' }
      const response = await fetch(serverPath + 'resetPassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          login: login,
          password: password,
        }) 
      })
      if (!response.ok) console.error('Network response was not ok');
      const data = await response.json();
      return data
    },
    emailVerified: async (login) => {
      const response = await fetch(serverPath + 'emailVerified', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          login: login
        }) 
      })
      if (!response.ok) console.error('Network response was not ok');
      const data = await response.json();
      return data
    },
    createGroupChat: async (name, creator, participants) => {
        const data = {
          name: name,
          creator: creator,
          participants: participants
        }
        const response = await fetch(serverPath + 'createGroupChat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            data: JSON.stringify(data, null, 2)
          }) 
        })
        if (!response.ok) console.error('Network response was not ok');
        const responsedData = await response.json();
        return responsedData
    },
    joinGroupChat: async (chatID, userID, followedUserID) => {
        const data = {
          chatID: chatID,
          userID: userID,
          followedUserID: followedUserID
        }
        const response = await fetch(serverPath + 'joinGroupChat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            data: JSON.stringify(data, null, 2)
          }) 
        })
        if (!response.ok) console.error('Network response was not ok');
        const responsedData = await response.json();
        return responsedData
    },
    sendMessageChat: async (userID, chatPath, message, mediafiles) => {
        let sendMediaResponse = []
        for (const mediaFile of mediafiles) {
          console.log(mediaFile)
          const pushedFile = await db.sendMedia('media', mediaFile)
          sendMediaResponse.push(JSON.parse(pushedFile.currentTarget.response))
        }
        const data = {
          chatPath: chatPath,
          userID: userID,
          replied: false,
          mediafiles: sendMediaResponse,
          message: message
        }
        console.log(sendMediaResponse)
        const response = await fetch(serverPath + 'sendMessageChat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            data: JSON.stringify(data, null, 2)
          }) 
        })
        if (!response.ok) console.error('Network response was not ok');
        const responsedData = await response.json();
        return responsedData
    },
    getChatInfo: async (path) => {
      const response = await fetch(serverPath + 'getChatInfo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          path: path
        }) 
      })
      if (!response.ok) return console.error('Network response was not ok');
      const responsedData = await response.json();
      return responsedData
    }
}
export default db