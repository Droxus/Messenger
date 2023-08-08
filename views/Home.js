import App from '../App.js'

const Home = {
    start: () => {
        console.log('test')
        Home.chatsPage()
    },
    chatsPage: () => {
        App.clear()
        insertElement(appDiv, templates.chatsPage, styles)
    }
}
export default Home

const templates = {
    chatsPage: html`
        <div id="chatsPage">
            <header>
                <div id="headerBlock">
                    <button id="settingsPageBtn">Settings</button>
                    <button id="findBtn">Find</button>
                    <button id="profilePageBtn">Profile</button>
                </div>
                <nav>
                    <button class="navHomePageBtns">Contacts</button>
                    <button class="navHomePageBtns">Chats</button>
                    <button class="navHomePageBtns">Groups</button>
                    <button class="navHomePageBtns">Publics</button>
                </nav>
            </header>
            <article>
                
            </article>
            <footer>
                <button id="footerBtn">Chats</button>
            </footer>
        </div>
    `
}
const styles = {
    id: {
        chatsPage: {
            background: 'black',
            width: '100vw',
            height: '100vh',
            display: 'grid',
            'grid-template-rows': '120px 1fr 80px'
        },
        settingsPageBtn: {
            border: 'none',
            background: '#FFA8A8',
            width: '90%',
            height: '35px',
            'font-size': '14px',
            'max-width': '300px',
            'justify-self': 'left',
            'margin-left': '16%',
            'font-weight': 'bold',
        },
        findBtn: {
            border: 'none',
            background: '#FFE7A8',
            width: '90%',
            height: '35px',
            'font-size': '14px',
            'max-width': '300px',
            'font-weight': 'bold',
        },
        profilePageBtn: {
            border: 'none',
            background: '#AFFFA8',
            width: '90%',
            height: '35px',
            'font-size': '14px',
            'max-width': '300px',
            'justify-self': 'right',
            'margin-right': '16%',
            'font-weight': 'bold',
        },
        headerBlock: {
            width: '100vw',
            height: '100%',
            display: 'grid',
            'gap': '5%',
            'grid-template-columns': 'repeat(3, 1fr)',
            'align-items': 'end',
            'justify-items': 'center',
            margin: '10px 0',
        },
        footerBtn: {
            background: '#FFA8A8',
            width: '95%',
            height: '45px',
            margin: '0 2.5%',
            'font-size': '16px',
            'font-weight': 'bold',
        },
    },
    class: {
        navHomePageBtns: {
            background: 'none',
            color: '#C0C0C0'
        }
    },
    tag: {
        header: {
            width: '100vw',
            height: '100%',
            display: 'grid',
            'grid-template-rows': '70px 50px',
            'align-items': 'end',
            'justify-content': 'center'
        },
        nav: {
            height: '40px',
            margin: '0 5%',
            'border-bottom': '1px dotted white',
            'border-top': '1px dotted white',
            display: 'flex',
            padding: '0px 2%',
            gap: '5%',
        },
        article: {

        },
        footer: {
            
        }
    }
}