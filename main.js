import App from './App.js'

App.start()
// avatarImg.src = URL.createObjectURL(await db.getMedia('loaded/a4d42258-96af-4c03-af50-2f44b719621c.jpg'))
// const userData = {
//   id: Math.floor(Math.random() * Math.pow(10, 8)),
//   name: 'John Doe',
//   age: Math.floor(Math.random() * 100),
//   email: 'johndoe@example.com'
// };

// sendDataBtn.onclick = async () => {
//   db.write('users.json', userData)
//   apiData = await db.readFile('users.json')
//   console.log(apiData)
// }
// updateDataBtn.onclick = () => {
//   db.updateField(`users.json`, 'nickname', 'Droxus', 'id', apiData[0].id)
// }
// pushDataBtn.onclick = () => {
//   db.push('users.json', userData)
// }
// deleteDataBtn.onclick = () => {
//   db.deleteValue(`users.json`, 'login')
// }
// sendFileBtn.onclick = () => {
//   db.sendMedia('loaded', fileInp.files[0])
// }
// createFolderBtn.onclick = () => {
//   db.createFolder('ThisFolder')
// }
// signUpUserBtn.onclick = () => {
//   const login = 'Sashsa228';
//   const password = 'test3030';
//   const email = 'droxus@gmail.com'
//   db.signUpUser(login, password, email)
// }
// signInUserBtn.onclick = () => {
//   const login = 'Sashsa';
//   const password = 'test3030';
//   db.signInUser(login, password)
// }
// createGroupChatBtn.onclick = () => {
//   const name = 'Super Chat'
//   const userID = '429092d3-d94c-431f-b7d7-a19bc6ac0ba0' //should be changed by real id from authentication
//   const participants = [{ id: 'a80ace61-060a-496f-88e0-fe038c3a8869', followedUserID: userID }, { id: userID, followedUserID: false }];
//   db.createGroupChat(name, userID, participants)
// }
// joinGroupChatBtn.onclick = () => {
//   const chatID = 'f9e70af7-83f3-4f36-a28a-a5aabfec9335';
//   const userID = '594c1ff6-d523-4570-bcbb-7c0f6edd862f'
//   const followedUserID = '429092d3-d94c-431f-b7d7-a19bc6ac0ba0'
//   db.joinGroupChat(chatID, userID, followedUserID)
// }
// sendMessageChatBtn.onclick = () => {
//   const userID = '594c1ff6-d523-4570-bcbb-7c0f6edd862f'
//   const chatID = 'f9e70af7-83f3-4f36-a28a-a5aabfec9335';
//   const message = 'Hello World!';
//   db.sendMessageChat(userID, chatID, message)
// }
// getChatInfo.onclick = async () => {
//   const chatInfo = await db.getChatInfo('chats/f9e70af7-83f3-4f36-a28a-a5aabfec9335.json')
//   console.log(chatInfo)
// }
