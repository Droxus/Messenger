import App from '../App.js'

const Auth = {
    start: () => {
        console.log('test')
        Auth.signIn()
    },
    signIn: () => {
        App.clear()
        insetElement(appDiv, templates.signIn, styles)
    },
    signUp: () => {

    },
    signOut: () => {

    },
    errorOutput: () => {

    }
}
export default Auth

const templates = {
    signIn: html`<div id="signIn"><button class="red" id="superBtn">Super</button></div>`
}
const styles = {
    id: {
        signIn: {
            background: 'black',
            width: '100vw',
            height: '100vh'
        }
    },
    class: {
        red: {
            background: 'red'
        }
    },
    tag: {
        button: {
            width: '50%'
        }
    }
}