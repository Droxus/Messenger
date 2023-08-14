import App from '../App.js'
import Home from './Home.js'

const Chat = {
    groupChat: async (group) => {
        App.clear(appDiv)
        insertElement(appDiv, templates.groupChat, styles)
        chatName.innerText = group.name
        backPageBtn.onclick = Home.homePage
        infoPageBtn.onclick = () => Chat.infoBlock(group)
        getGroupChatMsg(group)
        sendMsg.onclick = async () => {
            if (msgInp.value == '') return undefined
            const userID = App.thisUser.id
            const response = await App.db.sendMessageChat(userID, `groups/${group.id}.json`, msgInp.value)
            console.log(response)
            msgInp.value = ''
            getGroupChatMsg(group)
        }
    },
    infoBlock: (group) => {
        App.clear(appDiv)
        insertElement(appDiv, templates.infoBlock, styles)
        backPageBtn.onclick = Home.homePage
        backPageInfoBtn.onclick = () => Chat.groupChat(group)
    }
}
export default Chat

async function getGroupChatMsg(thisGroup) {
    App.clear(contentArticle)
    const allUsers = await App.db.readFile('users.json')
    const group = await App.db.getChatInfo(`groups/${thisGroup.id}.json`)
    for (const msg of group.messages) {
        insertElement(contentArticle, templates.messagesGroup, styles)
        const creator = allUsers.find(user => user.id == msg.userID)
        const hours = String(new Date(msg.creationTime).getHours()).padStart(2, '0')
        const minutes = String(new Date(msg.creationTime).getMinutes()).padStart(2, '0')
        messagesGroupAva.lastElement().id = msg.id
        messagesGroupAuthor.lastElement().innerText = creator.nickname
        messagesGroupContent.lastElement().innerText = msg.content
        messagesGroupTime.lastElement().innerText = `${hours}:${minutes}`
        messagesGroupAva.lastElement().style.justifySelf = creator.id !== App.thisUser.id ? 'start' : 'end';
        messagesGroupAva.lastElement().style.gridTemplateColumns = creator.id !== App.thisUser.id ? '32px calc(100% - 32px)' : 'calc(100% - 32px) 32px ';
        messagesGroup.lastElement().style.borderRadius = creator.id !== App.thisUser.id ? '10px 10px 10px 0px' : '10px 10px 0px 10px';
        messagesGroup.lastElement().style.order = creator.id !== App.thisUser.id ? '1' : '0';
        userMsgIcons.lastElement().style.placeSelf = creator.id !== App.thisUser.id ? 'end left' : 'end';
    }
    if (group.messages.length < 1) return undefined
    messagesGroup.lastElement().scrollIntoView()
}

const templates = {
    groupChat: html`
        <div id="groupChat">
            <header>
                <nav id="headerBlock">
                    <button id="backPageBtn">Back</button>
                    <button id="findBtn">Find</button>
                    <button id="infoPageBtn">Info</button>
                </nav>
                <div id="groupHeader">
                    <img class="chatIcons" src="../img/avaPlaceholder.svg">
                    <label id="chatName">Chat Name</label>
                </div>
            </header>
            <article id="contentArticle">

            </article>
            <footer>
                <div id="footerBlock">
                    <input id="msgInp" type="text" placeholder="Type Message">
                    <button id="sendMsg"><img id="sendMsgIcon" src="../img/sendMsgIcon.svg"></button>
                </div>
            </footer>
        </div>
    `,
    messagesGroup: html`
        <div class="messagesGroupAva">
            <div class="messagesGroup">
                <label class="messagesGroupAuthor">Name</label>
                <label class="messagesGroupContent">Text Message</label>
                <label class="messagesGroupTime">Time</label>
            </div>
            <img class="userMsgIcons" src="../img/avaPlaceholder.svg">
        </div>
    `,
    infoBlock: html`
        <div id="infoBlock">
            <header>
                <div id="headerBlock">
                    <button id="backPageInfoBtn">Back</button>
                    <button id="findBtn">Find</button>
                    <button id="homePageBtn">Home</button>
                </div>
            </header>
            <div id="profileInfo">
                <img id="profileIcon" src="../img/avaPlaceholder.svg">
                <label id="userNicknameLbl">Chat Name</label>
                <label id="userLoginLbl">N members</label>
            </div>
            <nav id="navInfoBlock">
                <button class="navHomePageBtns" id="contactsArticleBtn" data-action="contactsPage">Contacts</button>
                <button class="navHomePageBtns" id="chatsArticleBtn" data-action="chatsPage">Poster</button>
                <button class="navHomePageBtns" id="groupsArticleBtn" data-action="groupsPage">Publics</button>
                <button class="navHomePageBtns" id="publicsArticleBtn" data-action="publicsPage">Media</button>
                <button class="navHomePageBtns" id="publicsArticleBtn" data-action="publicsPage">Music</button>
            </nav>
            <article id="contentArticle">
                
            </article>
        </div>
    `,
}
const styles = {
    id: {
        groupChat: {
            background: 'black',
            width: '100vw',
            height: '100vh',
            display: 'grid',
            'grid-template-rows': '130px calc(100% - 210px) 80px',
            'max-width': '1200px',
            margin: 'auto',
        },
        backPageBtn: {
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
        infoPageBtn: {
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
        footerBlock: {
            border: '2px solid #FFA8A8',
            width: '95%',
            height: '45px',
            margin: '0 2.5%',
            'font-size': '16px',
            'font-weight': 'bold',
            'border-radius': '10px',
            'display': 'grid',
            'grid-template-columns': 'calc(100% - 50px) 50px',
        },
        contentArticle: {
            width: '90%',
            height: 'calc(100% - 40px)',
            display: 'grid',
            'justify-items': 'end',
            'grid-auto-rows': 'max-content',
            'align-items': 'center',
            'padding-top': '15px',
            'overflow-y': 'scroll',
            margin: '10px auto',
            'overflow-x': 'hidden',
            'overflow-y': 'scroll',
            gap: '20px',
        },
        groupHeader: {
            height: '50px',
            margin: '0 5%',
            'border-bottom': '1px dashed white',
            'border-top': '1px dashed white',
            'border-radius': '10px',
            display: 'flex',
            padding: '0px 2%',
            gap: '5%',
        },
        chatName: {
            'margin-left': '10px',
            'font-size': '20px',
            'text-align': 'left',
            color: '#FFA8A8',
            'place-self': 'center',
        },
        msgInp: {
            height: '100%',
            width: '100%',
            border: 'none',
            background: 'none',
            color: '#C0C0C0',
            padding: '0 20px',
            'font-size': '16px',
        },
        sendMsg: {
            height: '100%',
            width: '100%',
            border: 'none',
            background: 'none',
        },
        sendMsgIcon: {
            height: '24px',
        },
        infoBlock: {
            background: 'black',
            width: '100vw',
            height: '100vh',
            display: 'grid',
            'grid-template-rows': '70px 240px 50px calc(100% - 360px)',
            'max-width': '1200px',
            margin: 'auto',
        },
        backPageInfoBtn: {
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
        navInfoBlock: {
            height: '40px',
            margin: '0 5%',
            'border-bottom': '1px dashed white',
            'border-top': '1px dashed white',
            display: 'flex',
            padding: '0px 2%',
            gap: '5%',
            'overflow-x': 'scroll',
        },
    },
    class: {
        chatIcons: {
            'border-radius':' 50%',
            width: '36px',
            'place-self': 'center',
            'padding': '0 10px',
        },
        messagesGroupAva: {
            'max-width': '75%',
            display: 'grid',
        },
        messagesGroup: {
            background: '#333333',
            display: 'grid',
            'grid-template-rows': '25px calc(100% - 40px) 15px',
            padding: '10px',
            height: 'max-content',
            'border-bottom-right-radius': '0px',
            
        },
        messagesGroupAuthor: {
            color: '#FFA8A8',
            'font-size': '14px',
        },
        messagesGroupContent: {
            color: '#C0C0C0',
            'font-size': '14px',
            'white-space': 'break-spaces',
            margin: '0px 15px 5px 5px',
        },
        messagesGroupTime: {
            color: '#FFE7A8',
            'justify-self': 'end',
            'font-size': '10px',
            'align-self': 'end',
        },
        userMsgIcons: {
            height: '28px',
        },
        navHomePageBtns: {
            background: 'none',
            color: '#C0C0C0'
        },
        navInfoBlock: {
            height: '40px',
            margin: '0 5%',
            'border-bottom': '1px dashed white',
            'border-top': '1px dashed white',
            display: 'flex',
            padding: '0px 2%',
            gap: '5%',
            'overflow-x': 'scroll',
        },
    },
    tag: {
        header: {
            width: '100vw',
            height: '100%',
            display: 'grid',
            'grid-template-rows': '70px 60px',
            'align-items': 'end',
            'justify-content': 'center',
            'max-width': '1200px'
        },
        article: {

        },
        footer: {
            
        },
    }
}