import { db } from './database.js'
import { createDomVariables } from './dom.js'

createDomVariables()

let apiData
db.readFile('users.json').then((data) => {
  apiData = data
  console.log(apiData)
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
  db.update(`users.json/${apiData[0].id}`, {nickname: 'superDroxus'})
}
pushDataBtn.onclick = () => {
  db.push('users.json', userData)
}
deleteDataBtn.onclick = () => {
  db.delete(`users.json/${apiData[0].id}`)
}