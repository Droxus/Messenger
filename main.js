import { db } from './database.js'
import { createDomVariables } from './dom.js'

createDomVariables()

db.readFile('api')

const userData = {
  id: Math.floor(Math.random() * Math.pow(10, 8)),
  name: 'John Doe',
  age: Math.floor(Math.random() * 100),
  email: 'johndoe@example.com'
};

sendDataBtn.onclick = () => {
  db.write('api', userData)
}
updateDataBtn.onclick = () => {
  db.update('api/1', {nickname: 'superDroxus'})
}
pushDataBtn.onclick = () => {
  db.push('api', userData)
}
deleteDataBtn.onclick = () => {
  db.delete('api/1')
}