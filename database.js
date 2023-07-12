const serverPath = 'http://localhost:3000/'
export const db = {
    readFile: (path) => {
        fetch(serverPath + path).then(response => response.json()).then(data => {
          // Handle the response from the server
          console.log(data);
        }).catch(error => {
          console.error(error);
        });
    }, 
    write: (path, data) => {
        fetch(serverPath + path, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
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
      fetch(serverPath + path).then(response => response.json()).then(gettedData => {
        if (!Array.isArray(gettedData)) {
          gettedData = [gettedData]
        }
        gettedData.push(data)
        db.write(path, gettedData)
      }).catch(error => {
        console.error(error);
      });
    },
    update: (path, data) => {
      fetch(serverPath + path, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(response => {
        if (response.ok) {
          console.log('User updated successfully');
        } else {
          console.error('Failed to update user');
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
    },
    delete: (path) => {
      fetch(serverPath + path, {
        method: 'DELETE'
      }).then(response => {
          if (response.ok) {
            console.log('User deleted successfully');
          } else {
            console.error('Failed to delete user');
          }
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }
}