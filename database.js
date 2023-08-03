const serverPath = 'http://localhost:3000/'
const dbPath = '../MessengerDB/'
export const db = {
    readFile: (path) => {
      return new Promise (async (resolve) => {
        const response = await fetch(serverPath + 'readFile?path=' + dbPath + path)
        resolve(response.json())
        if (response.ok) return console.log('Successfully read');
          console.error('Failed to read');
      })
    }, 
    write: (path, data) => {
      return new Promise (async (resolve) => {
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
        if (response.ok) return console.log('Written successfully');
          console.error('Failed to write');
        resolve(response.json())
      })
    },
    push: (path, data, fieldName) => {
      return new Promise (async (resolve) => {
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
        if (response.ok) return console.log('Pushed successfully');
          console.error('Failed to push');
        resolve(response)
      })
    },
    updateField: (path, fieldName, newValue, elementFieldID, elementValueID) => {
      return new Promise(async (resolve) => {
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
        if (response.ok) return console.log('Updated successfully');
          console.error('Failed to update');
        resolve(response);
      })
    },
    deleteValue: (path, fieldName, elementFieldID, elementValueID) => {
      return new Promise(async (resolve) => {
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
        if (response.ok) return console.log('Deleted successfully');
          console.error('Failed to delete');
        resolve(response)
      })
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
    getMedia: (path) => {
      return new Promise(async (resolve) => {
        const fileName = path.slice(path.lastIndexOf('/')+1, path.length)
        const basicPath = path.slice(0, path.lastIndexOf('/'))
        const response = await fetch(serverPath + `getMedia/${fileName}?path=${dbPath + basicPath}`)
        if (response.ok) resolve(response.blob());
          resolve(undefined)
      })
    },
    createFolder: (path) => {
      return new Promise (async (resolve) => {
        const response = await fetch(serverPath + `createFolder?path=${dbPath + path}`)
        if (response.ok) resolve(response)
          resolve(undefined)
      })
    },
    signUpUser: (login, password, email) => {
      return new Promise(async (resolve) => {
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
        if (!response.ok) console.log('Network response was not ok');
        const data = await response.json();
        console.log(data);
        if (!data.id) console.log('Sign up error')
        resolve(response)
      })
    },
    signInUser: (login, password) => {
      return new Promise(async (resolve) => {
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
        if (!response.ok) console.log('Network response was not ok');
        const data = await response.json();
        console.log(data)
        if (!data.id) console.log('Sign in error')
        resolve(response)
      })
    },
    createGroupChat: (name, creator, participants) => {
      return new Promise(async (resolve) => {
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
        if (!response.ok) console.log('Network response was not ok');
        const responsedData = await response.json();
        console.log(responsedData)
        resolve(response)
      })
    },
    joinGroupChat: (chatID, userID, followedUserID) => {
      return new Promise(async (resolve) => {
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
        if (!response.ok) console.log('Network response was not ok');
        const responsedData = await response.json();
        console.log(responsedData)
        resolve(responsedData)
      })
    },
    sendMessageChat: (userID, chatID, message) => {
      return new Promise(async (resolve) => {
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
        if (!response.ok) console.log('Network response was not ok');
        const responsedData = await response.json();
        console.log(responsedData)
        resolve(responsedData)
      })
    },
}