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
    }
}