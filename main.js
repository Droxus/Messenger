import { db } from './database.js'
import { createDomVariables } from './dom.js'

createDomVariables()

let apiData
db.readFile('users.json').then((data) => {
  apiData = data
  console.log(apiData)
})
db.getMedia('loaded/a4d42258-96af-4c03-af50-2f44b719621c.jpg').then(blob => {
  avatarImg.src = URL.createObjectURL(blob);
})
const userData = {
  id: Math.floor(Math.random() * Math.pow(10, 8)),
  name: 'John Doe',
  age: Math.floor(Math.random() * 100),
  email: 'johndoe@example.com'
};

sendDataBtn.onclick = () => {
  db.write('users.json', userData)
  db.readFile('users.json').then((data) => {
    apiData = data
    console.log(apiData)
  })
}
updateDataBtn.onclick = () => {
  db.update(`users.json/${apiData[0].id}`, {nickname: 'Droxus'})
}
pushDataBtn.onclick = () => {
  db.push('users.json', userData)
}
deleteDataBtn.onclick = () => {
  db.delete(`users.json/${apiData[0].id}`)
}
sendFileBtn.onclick = () => {
  db.sendMedia('loaded', fileInp.files[0])
}