import db from './database.js'
import { createDomVariables } from './dom.js'
import Auth from './views/Auth.js'

const App = {
    start: async () => {
        createDomVariables()
        let apiData = await db.readFile('users.json')
        console.log(apiData)
        Auth.start()
    },
    clear: () => {
        const children = appDiv.children;
        for (const child of children) {
            appDiv.removeChild(child);
        }
    }
}
export default App
