import App from '../App.js'
import Home from './Home.js'
import Settings from './Settings.js'

const Profile = {
    start: (userID) => {
        console.log('test')
        console.log(userID)
        if (userID == App.thisUser.id) Profile.showThisUser()
        else Profile.showOtherUser()
    },
    showThisUser: () => {
        App.clear(appDiv)
        insertElement(appDiv, templates.showThisUserBlock, styles)
        homePageBtn.onclick = Home.start
        settingsPageBtn.onclick = () => Settings.start()
        userNicknameLbl.innerText = App.thisUser.nickname
        userLoginLbl.innerText = App.thisUser.login
    },
    showOtherUser: () => {
        App.clear(appDiv)
        insertElement(appDiv, templates.showOtherUserBlock, styles)
        homePageBtn.onclick = Home.start
        settingsPageBtn.onclick = () => Settings.start()
    }
}
export default Profile

const templates = {
    showThisUserBlock: html`
        <div id="showThisUserBlock">
            <header>
                <div id="headerBlock">
                    <button id="settingsPageBtn">Settings</button>
                    <button id="findBtn">Find</button>
                    <button id="homePageBtn">Home</button>
                </div>
            </header>
            <div id="profileInfo">
                <img id="profileIcon" src="../img/avaPlaceholder.svg">
                <label id="userNicknameLbl">User Nickname</label>
                <label id="userLoginLbl">User Login</label>
            </div>
            <nav>
                <button class="navHomePageBtns" id="contactsArticleBtn" data-action="contactsPage">Contacts</button>
                <button class="navHomePageBtns" id="chatsArticleBtn" data-action="chatsPage">Poster</button>
                <button class="navHomePageBtns" id="publicsArticleBtn" data-action="publicsPage">Media</button>
                <button class="navHomePageBtns" id="groupsArticleBtn" data-action="groupsPage">Publics</button>
                <button class="navHomePageBtns" id="publicsArticleBtn" data-action="publicsPage">Music</button>
            </nav>
            <article id="contentArticle">
                
            </article>
            <footer>
                <button id="footerBtn">Profile</button>
            </footer>
        </div>
    `,
    showOtherUserBlock: html`
        <div id="showOtherUserBlock">
        
        </div>
    `,
}
const styles = {
    id: {
        showThisUserBlock: {
            background: 'black',
            width: '100vw',
            height: '100vh',
            display: 'grid',
            'grid-template-rows': '70px 240px 50px calc(100% - 440px) 80px',
            'max-width': '1200px',
            margin: 'auto',
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
        homePageBtn: {
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
            'max-width': '1200px'
        },
        footerBtn: {
            background: '#FFA8A8',
            width: '95%',
            height: '45px',
            margin: '0 2.5%',
            'font-size': '16px',
            'font-weight': 'bold',
        },
        profileInfo: {
            display: 'grid',
            'align-items': 'center',
            'justify-items': 'center',
        },
        profileIcon: {
            width: '96px',
            'margin-top': '20px',
        },
        userNicknameLbl: {
            color: '#FFA8A8',
            'font-size': '16px',
        },
        userLoginLbl: {
            color: '#C0C0C0',
            'font-size': '14px',
            'margin-bottom': '30px',
        },
    },
    class: {
        navHomePageBtns: {
            background: 'none',
            color: '#C0C0C0'
        },
    },
    tag: {
        header: {
            width: '100vw',
            height: '70px',
            display: 'grid',
            'align-items': 'end',
            'justify-content': 'center',
            'max-width': '1200px'
        },
        nav: {
            height: '40px',
            margin: '0 5%',
            'border-bottom': '1px dashed white',
            'border-top': '1px dashed white',
            display: 'flex',
            padding: '0px 2%',
            gap: '5%',
            'overflow-x': 'scroll',
        },
        article: {

        },
        footer: {
            'z-index': '10',
        },
    }
}