import db from './database.js'
import { createDomVariables } from './dom.js'
import Auth from './views/Auth.js'

export const App = {
    start: () => {
        createDomVariables()
        Auth.start()
    },
    clear: () => {
        const children = appDiv.children;
        for (const child of children) {
            appDiv.removeChild(child);
        }
    },
    db: db,
    styles: {
        darkBg: 'black'
    }
}
export default App
