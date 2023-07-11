console.log('H1')
fetch('http://localhost:3000/api/user')
.then(response => response.json())
.then(data => {
  // Handle the response from the server
  console.log(data);
})
.catch(error => {
  // Handle any errors
  console.error(error);
});
const userData = {
  name: 'John Doe',
  age: Math.floor(Math.random() * 100),
  email: 'johndoe@example.com'
};
document.querySelector('#sendDataBtn').addEventListener('click', (event) => {
  event.preventDefault()

  fetch('http://localhost:3000/api/user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log(data);
    })
    .catch(error => {
      console.error('Error:', error);
    });  
})
