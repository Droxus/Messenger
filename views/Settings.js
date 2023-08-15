import App from '../App.js'
import Home from './Home.js'
import Profile from './Profile.js'

const Settings = {
    start: () => {
        App.clear(appDiv)
        insertElement(appDiv, templates.showThisUserBlock, styles)
        profilePageBtn.onclick = Profile.showThisUser
        homePageBtn.onclick = Home.start
        userNicknameInp.value = App.thisUser.nickname
        userLoginInp.value = App.thisUser.login
    }
}
export default Settings

const templates = {
    showThisUserBlock: html`
        <div id="showThisUserBlock">
            <header>
                <div id="headerBlock">
                    <button id="homePageBtn">Home</button>
                    <button id="findBtn">Find</button>
                    <button id="profilePageBtn">Profile</button>
                </div>
            </header>
            <div id="profileInfo">
                <img id="profileIcon" src="../img/avaPlaceholder.svg">
                <input id="userNicknameInp" placeholder="User Nickname">
                <input id="userLoginInp" placeholder="User Login">
            </div>
            <nav>
                <button class="navHomePageBtns" id="contactsArticleBtn" data-action="contactsPage">General</button>
                <button class="navHomePageBtns" id="chatsArticleBtn" data-action="chatsPage">Notifications</button>
                <button class="navHomePageBtns" id="groupsArticleBtn" data-action="groupsPage">Allows</button>
                <button class="navHomePageBtns" id="publicsArticleBtn" data-action="publicsPage">Navigation</button>
                <button class="navHomePageBtns" id="publicsArticleBtn" data-action="publicsPage">Auth</button>
            </nav>
            <article id="contentArticle">
                
            </article>
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
            'grid-template-rows': '70px 240px 50px calc(100% - 360px)',
            'max-width': '1200px',
            margin: 'auto',
        },
        homePageBtn: {
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
            'max-width': '1200px'
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
        userNicknameInp: {
            color: '#FFA8A8',
            'font-size': '16px',
            border: 'none',
            background: 'none',
            'border-bottom': '2px solid #333333',
            width: '250px',
            height: '30px',
            'padding-top': '10px',
            'text-align': 'center',
        },
        userLoginInp: {
            color: '#C0C0C0',
            'font-size': '14px',
            border: 'none',
            background: 'none',
            'margin-bottom': '30px',
            'border-bottom': '2px solid #333333',
            width: '250px',
            height: '30px',
            'padding-top': '10px',
            'text-align': 'center',
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
    }
}