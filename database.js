const serverPath = 'http://localhost:3000/'
const dbPath = '../MessengerDB/'
export const db = {
    readFile: (path) => {
        return new Promise ((resolve) => {
          fetch(serverPath + '?path=' + dbPath + path).then(response => response.json()).then(data => {
            resolve(data)
          }).catch(error => {
            console.error(error);
          });
        })
    }, 
    write: (path, data) => {
      if (!Array.isArray(data)) {
        data = [data]
      }
        fetch(serverPath, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            data: JSON.stringify(data, null, 2),
            path: dbPath + path
          }) 
        }).then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          }).then(data => {
            console.log(data);
          }).catch(error => {
            console.error('Error:', error);
          });  
    },
    push: (path, data) => {
      db.readFile(path).then(gettedData => {
        if (!Array.isArray(gettedData)) {
          gettedData = [gettedData]
        }
        gettedData.push(data)
        db.write(path, gettedData)
      })
      .catch(error => {
        console.error(error);
      });
    },
    update: (path, data) => {
      let forServerPath = path.slice(path.lastIndexOf('/')+1, path.length)
      let basicPath = path.slice(0, path.lastIndexOf('/'))
      console.log(basicPath)
      fetch(serverPath + forServerPath, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: data,
        path: dbPath + basicPath
      }) 
       
    })
      .then(response => {
        if (response.ok) {
          console.log('Updated successfully');
        } else {
          console.error('Failed to update');
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
    },
    delete: (path) => {
      fetch(serverPath + '?path=' + dbPath + path, {
        method: 'DELETE'
      }).then(response => {
          if (response.ok) {
            console.log('Deleted successfully');
          } else {
            console.error('Failed to delete');
          }
        })
        .catch(error => {
          console.error('Error:', error);
        });
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

      xhr.open('POST', `http://localhost:3000/upload?path=${dbPath + path + '/'}`);
      xhr.send(formData);
    },
    getMedia: (path) => {
      return new Promise((resolve) => {
        let fileName = path.slice(path.lastIndexOf('/')+1, path.length)
        let basicPath = path.slice(0, path.lastIndexOf('/'))

        fetch(serverPath + `file/${fileName}?path=${dbPath + basicPath}`).then(response => {
          if (response.ok) {
            resolve(response.blob());
          } else {
            throw new Error('File not found.');
          }
        }).catch(error => {
          console.error('Error fetching file:', error);
        });
      })
    },
    createFolder: (path) => {
      return new Promise ((resolve) => {
        fetch(serverPath + `createFolder?path=${dbPath + path}`).then(data => {
          resolve(data)
        }).catch(error => {
          console.error(error);
        });
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
        if (!response.ok) {
          console.log('Network response was not ok');
          resolve(false)
        }
        const data = await response.json();
        console.log(data);

        if (data.id) {
          resolve(true)
        } else {
          console.log('Sign up error')
          resolve(false)
        }
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
        if (!response.ok) {
          console.log('Network response was not ok');
          resolve(false);
        }
        const data = await response.json();

        if (data.id) {
          console.log(data)
          resolve(true)
        } else {
          console.log('Sign in error')
          resolve(false)
        }
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
        if (!response.ok) {
          console.log('Network response was not ok');
          resolve(false);
        }

        const responsedData = await response.json();
        console.log(responsedData)
        resolve(true)
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
        if (!response.ok) {
          console.log('Network response was not ok');
          resolve(false);
        }

        const responsedData = await response.json();
        console.log(responsedData)
        resolve(true)
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
        if (!response.ok) {
          console.log('Network response was not ok');
          resolve(false);
        }

        const responsedData = await response.json();
        console.log(responsedData)
        resolve(true)
      })

      // just push in /Chats/chatID.json new message !! crypted message

    },
}