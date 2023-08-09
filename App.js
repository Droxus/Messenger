import db from './database.js'
import { createDomVariables } from './dom.js'
import Auth from './views/Auth.js'

export const App = {
    start: () => {
        createDomVariables()
        Auth.start()
    },
    clear: (element) => {
        const children = element.children;
        for (const child of children) {
            element.removeChild(child);
        }
    },
    db: db,
    thisUser: undefined,
    styles: {
        darkBg: 'black'
    },
}
export default App
