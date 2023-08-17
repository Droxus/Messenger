import db from './database.js'
import { createDomVariables } from './dom.js'
import Auth from './views/Auth.js'

export const App = {
    start: () => {
        createDomVariables()
        Auth.start()
    },
    clear: (element) => {
        while (element.firstElementChild) {
            element.firstElementChild.remove()
        }
    },
    db: db,
    thisUser: undefined,
    styles: {
        darkBg: 'black'
    },
}
export default App
