import App from '../App.js'
import Chat from './Chat.js'

const Home = {
    start: () => {
        console.log('test')
        Home.homePage()
    },
    homePage: () => {
        App.clear(appDiv)
        insertElement(appDiv, templates.homePage, styles)
        nav[0].onclick = (event) => {
            if (!event.target.dataset.action) return undefined
            App.clear(contentArticle)
            Home[event.target.dataset.action]()
            navHomePageBtns.forEach(btn => btn.style.color = '#C0C0C0')
            event.target.style.color = 'white'
            footerBtn.innerText = event.target.innerText
        };
        groupsArticleBtn.click()
    },
    contactsPage: () => {

    },
    chatsPage: async () => {
        insertElement(contentArticle, templates.chatsPage, styles)
        const userChats = await App.db.readFile(`users/${App.thisUser.id}/chats.json`)
        for (const chatID of userChats) {
            const chat = await App.db.getChatInfo(`chats/${chatID}.json`)
            console.log(chat)
            insertElement(chatsPage, templates.chatBlocks, styles)
            const creationTime = chat.messages[chat.messages.length-1].creationTime
            const hours = new Date(creationTime).getUTCHours();
            const minutes = new Date(creationTime).getUTCMinutes()
            chatBlocks[chatBlocks.length-1].id = chat.id
            chatNames[chatNames.length-1].innerText = chat.name
            chatLastMsg[chatLastMsg.length-1].innerText = chat.messages[chat.messages.length-1].content
            chatTimeMsg[chatLastMsg.length-1].innerText = `${hours}:${minutes}`
        }
    },
    groupsPage: async () => {
        insertElement(contentArticle, templates.groupsPage, styles)
        const userGroups = await App.db.readFile(`users/${App.thisUser.id}/groups.json`)
        for (const groupID of userGroups) {
            const group = await App.db.getChatInfo(`groups/${groupID}.json`)
            console.log(group)
            insertElement(groupsPage, templates.groupBlocks, styles)
            const creationTime = group.messages[group.messages.length-1].creationTime
            const hours = String(new Date(creationTime).getHours()).padStart(2, '0')
            const minutes = String(new Date(creationTime).getMinutes()).padStart(2, '0')
            groupBlocks[groupBlocks.length-1].id = group.id
            groupNames[groupNames.length-1].innerText = group.name
            groupLastMsg[groupLastMsg.length-1].innerText = group.messages[group.messages.length-1].content
            groupTimeMsg[groupLastMsg.length-1].innerText = `${hours}:${minutes}`
            participantsNum[participantsNum.length-1].innerText = group.participants.length
            groupBlocks[groupBlocks.length-1].onclick = () => {if (group) Chat.groupChat(group)}
        }
    },
    publicsPage: () => {

    },
}
export default Home

const templates = {
    homePage: html`
        <div id="homePage">
            <header>
                <div id="headerBlock">
                    <button id="settingsPageBtn">Settings</button>
                    <button id="findBtn">Find</button>
                    <button id="profilePageBtn">Profile</button>
                </div>
                <nav>
                    <button class="navHomePageBtns" id="contactsArticleBtn" data-action="contactsPage">Contacts</button>
                    <button class="navHomePageBtns" id="chatsArticleBtn" data-action="chatsPage">Chats</button>
                    <button class="navHomePageBtns" id="groupsArticleBtn" data-action="groupsPage">Groups</button>
                    <button class="navHomePageBtns" id="publicsArticleBtn" data-action="publicsPage">Publics</button>
                </nav>
            </header>
            <article id="contentArticle">
                
            </article>
            <footer>
                <button id="footerBtn">Chats</button>
            </footer>
        </div>
    `,
    chatsPage: html`
        <div id="chatsPage">

        </div>
    `,
    groupsPage: html`
        <div id="groupsPage">

        </div>
    `,
    chatBlocks: html`
        <button class="chatBlocks">
            <div class="chatBlocksHead">
                <div class="chatLblsBlocks">
                    <label class="chatNames">Chat Name</label>
                    <label class="chatLastMsg">Text Message</label>
                </div>
                <img class="chatIcons" src="../img/avaPlaceholder.svg">
            </div>
            <div class="chatBlocksFooter">
                <div class="chatBlocksFooterInfo">
                    <div>
                        <label class="chatTimeMsg">Time</label>
                        <img src="../img/clockIcon.svg">
                    </div>
                    <div>
                        <label class="chatNumberOfUnreadMsg">0</label>
                        <img src="../img/msgIcon.svg">
                    </div>
                </div>
                <label class="isOnline">online</label>
            </div>
        </button>
    `,
    groupBlocks: html`
        <button class="groupBlocks">
            <div class="groupBlocksHead">
                <div class="groupLblsBlocks">
                    <label class="groupNames">group Name</label>
                    <label class="groupLastMsg">Text Message</label>
                </div>
                <img class="groupIcons" src="../img/avaPlaceholder.svg">
            </div>
            <div class="groupBlocksFooter">
                <div class="groupBlocksFooterInfo">
                    <div>
                        <label class="groupTimeMsg">Time</label>
                        <img src="../img/clockIcon.svg">
                    </div>
                    <div>
                        <label class="groupNumberOfUnreadMsg">0</label>
                        <img src="../img/msgIcon.svg">
                    </div>

                </div>
                <div>
                    <label class="participantsNum">0</label>
                    <img src="../img/participantsIcon.svg">
                </div>
            </div>
        </button>
    `,
}
const styles = {
    id: {
        homePage: {
            background: 'black',
            width: '100vw',
            height: '100vh',
            display: 'grid',
            'grid-template-rows': '120px calc(100% - 200px) 80px',
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
        footerBtn: {
            background: '#FFA8A8',
            width: '95%',
            height: '45px',
            margin: '0 2.5%',
            'font-size': '16px',
            'font-weight': 'bold',
        },
        chatsPage: {
            width: '90%',
            height: 'calc(100% - 40px)',
            display: 'grid',
            'justify-items': 'center',
            'grid-auto-rows': '90px',
            'align-items': 'center',
            'padding-top': '15px',
            'overflow-y': 'scroll',
            margin: '10px auto'
        },
        groupsPage: {
            width: '90%',
            height: 'calc(100% - 40px)',
            display: 'grid',
            'justify-items': 'center',
            'grid-auto-rows': '90px',
            'align-items': 'center',
            'padding-top': '15px',
            'overflow-y': 'scroll',
            margin: '10px auto'
        },
    },
    class: {
        navHomePageBtns: {
            background: 'none',
            color: '#C0C0C0'
        },
        chatBlocks: {
            background: '#333333',
            color: '#C0C0C0',
            width: '100%',
            height: '75px',
            display: 'grid',
            'grid-template-rows': 'calc(100% - 20px) 20px',
        },
        chatBlocksHead: {
            width: '100%',
            height: '100%',
            display: 'grid',
            'grid-template-columns': 'calc(100% - 70px) 70px',
        },
        chatLblsBlocks: {
            display: 'grid',
            'grid-template-rows': '1fr 1fr',
        },
        chatNames: {
            'align-self': 'end',
            'justify-self': 'left',
            'margin-left': '15px',
            'font-size': '16px',
            'text-align': 'left',
            color: '#FFA8A8',
            width: '100%',
        },
        chatLastMsg: {
            'align-self': 'center',
            'justify-self': 'left',
            'margin-left': '15px',
            'font-size': '12px',
            'text-align': 'left',
            color: '#C0C0C0',
            width: '100%',
        },
        chatIcons: {
            'border-radius':' 50%',
            width: '42px',
            'place-self': 'center',
        },
        chatTimeMsg: {
            color: '#FFE7A8',
            margin: '0% 5px 0 15px',
            'font-size': '12px',
        },
        chatNumberOfUnreadMsg: {
            color: '#FFE7A8',
            margin: '0% 5px 0 30px',
            'font-size': '12px',
        },
        chatBlocksFooter: {
            display: 'grid',
            'grid-template-columns': 'calc(100% - 70px) 70px',
        },
        chatBlocksFooterInfo: {
            display: 'flex',
        },
        groupBlocks: {
            background: '#333333',
            color: '#C0C0C0',
            width: '100%',
            height: '75px',
            display: 'grid',
            'grid-template-rows': 'calc(100% - 20px) 20px',
        },
        groupBlocksHead: {
            width: '100%',
            height: '100%',
            display: 'grid',
            'grid-template-columns': 'calc(100% - 70px) 70px',
        },
        groupLblsBlocks: {
            display: 'grid',
            'grid-template-rows': '1fr 1fr',
        },
        groupNames: {
            'align-self': 'end',
            'justify-self': 'left',
            'margin-left': '15px',
            'font-size': '16px',
            'text-align': 'left',
            color: '#FFA8A8',
            width: '100%',
        },
        groupLastMsg: {
            'align-self': 'center',
            'justify-self': 'left',
            'margin-left': '15px',
            'font-size': '12px',
            'text-align': 'left',
            color: '#C0C0C0',
            width: '100%',
        },
        groupIcons: {
            'border-radius':' 50%',
            width: '42px',
            'place-self': 'center',
        },
        groupTimeMsg: {
            color: '#FFE7A8',
            margin: '0% 5px 0 15px',
            'font-size': '12px',
        },
        groupNumberOfUnreadMsg: {
            color: '#FFE7A8',
            margin: '0% 5px 0 30px',
            'font-size': '12px',
        },
        groupBlocksFooter: {
            display: 'grid',
            'grid-template-columns': 'calc(100% - 70px) 70px',
        },
        groupBlocksFooterInfo: {
            display: 'flex',
        },
        isOnline: {
            color: '#AFFFA8',
        },
        participantsNum: {
            color: '#FFE7A8',
            margin: '0 5px 0 0',
            'font-size': '12px',
        },
    },
    tag: {
        header: {
            width: '100vw',
            height: '100%',
            display: 'grid',
            'grid-template-rows': '70px 50px',
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
        },
        article: {

        },
        footer: {
            
        }
    }
}