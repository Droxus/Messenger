const serverPath = 'http://localhost:3000/'
const dbPath = '../MessengerDB/'
const db = {
    readFile: async (path) => {
        const response = await fetch(serverPath + 'readFile?path=' + dbPath + path)
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
            path: dbPath + path
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
            path: dbPath + path,
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
    sendMedia: (path, file) => {
      const formData = new FormData();
      formData.append('file', file);
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', event => {
        if (event.lengthComputable) {
          const percentage = Math.round((event.loaded / event.total) * 100);
          console.log(`Uploading: ${percentage}%`);
        }
      });
      xhr.addEventListener('load', () => {
        console.log('Upload complete!');
      });
      xhr.addEventListener('error', () => {
        console.error('Upload failed!');
      });

      xhr.open('POST', `${serverPath}sendMedia?path=${dbPath + path + '/'}`);
      xhr.send(formData);
    },
    getMedia: async (path) => {
        const fileName = path.slice(path.lastIndexOf('/')+1, path.length)
        const basicPath = path.slice(0, path.lastIndexOf('/'))
        const response = await fetch(serverPath + `getMedia/${fileName}?path=${dbPath + basicPath}`)
        if (!response.ok) return console.error('Failed to get media');
        return response.blob()
    },
    createFolder: async (path) => {
        const response = await fetch(serverPath + `createFolder?path=${dbPath + path}`)
        if (!response.ok) return console.error('Failed to create folder');
        return response
    },
    signUpUser: async (login, password, email) => {
        const response = await fetch(serverPath + 'signUp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            login: login,
            password: password,
            email: email,
            path: dbPath
          }) 
        })
        if (!response.ok) console.error('Network response was not ok');
        const data = await response.json();
        if (!data.id) console.error('Sign up error')
        return response
    },
    signInUser: async (login, password) => {
        const response = await fetch(serverPath + 'signIn', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            login: login,
            password: password,
            path: dbPath
          }) 
        })
        if (!response.ok) console.error('Network response was not ok');
        const data = await response.json();
        if (!data.id) console.error('Sign in error')
        return response
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
    sendMessageChat: async (userID, chatID, message) => {
        const data = {
          chatID: chatID,
          userID: userID,
          replied: false,
          mediafiles: [],
          message: message
        }
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