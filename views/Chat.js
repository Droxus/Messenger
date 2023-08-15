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
    infoBlock: async (thisGroup) => {
        App.clear(appDiv)
        insertElement(appDiv, templates.infoBlock, styles)
        const group = await App.db.readFile(`groups/${thisGroup.id}.json`)
        backPageBtn.onclick = Home.homePage
        backPageInfoBtn.onclick = () => Chat.groupChat(group)
        chatNameInfoLbl.innerText = group.name
        numMembersInfoLbl.innerText =  `${group.participants.length} members`
        navInfoBlock.onclick = (event) => {
            if (!event.target.dataset.action) return undefined
            App.clear(contentArticle)
            Chat[event.target.dataset.action](group)
            navChatInfoPageBtns.forEach(btn => btn.style.color = '#C0C0C0')
            event.target.style.color = 'white'
        };
        membersArticleBtn.click()
    },
    membersPage: async (group) => {
        App.clear(contentArticle)
        insertElement(contentArticle, templates.membersPageInfo, styles)
        console.log(group)
        let creator
        for (const participant of group.participants) {
            insertElement(membersPageInfo, templates.memberAdminPageInfo, styles)
            const user = await App.db.readFile(`users/${participant.id}/user.json`)
            console.log(user)
            participantsName.lastElement().innerText = user.nickname
            participantsLogin.lastElement().innerText = user.login
            if (group.creator == user.id) creator = participantsRole.lastElement()
            deleteUserBtn.lastElement().onclick = () => {
                if (App.thisUser.id !== group.creator) return undefined
                deleteUserInfoLbl.innerText = `Are you sure you want to remove ${user.login} from this group`
                deleteUserInfo.style.display = 'grid'
                deleteUserInfoAgreeBtn.setAttribute('deleteUserId', user.id)
            }
        }
        deleteUserInfoCancelBtn.onclick = () => deleteUserInfo.style.display = 'none'
        deleteUserInfoAgreeBtn.onclick = async (event) => {
            const id = event.target.getAttribute('deleteUserId')
            await App.db.deleteValue(`users/${id}/groups.json`, group.id)
            await App.db.deleteValue(`groups/${group.id}.json`, 'participants', 'id', id)
            deleteUserInfo.style.display = 'none'
            Chat.infoBlock(group)
        }
        creator.innerText = 'Creator'
        creator.style.color = '#FFE7A8'
    },
    mediaPage: () => {

    },
    filesPage: () => {

    },
    voicePage: () => {

    },
    settingsPage: () => {

    },
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
                <label id="chatNameInfoLbl">Chat Name</label>
                <label id="numMembersInfoLbl">N members</label>
            </div>
            <nav id="navInfoBlock">
                <button class="navChatInfoPageBtns" id="membersArticleBtn" data-action="membersPage">Members</button>
                <button class="navChatInfoPageBtns" id="mediaArticleBtn" data-action="mediaPage">Media</button>
                <button class="navChatInfoPageBtns" id="filesArticleBtn" data-action="filesPage">Files</button>
                <button class="navChatInfoPageBtns" id="voiceArticleBtn" data-action="voicePage">Voice</button>
                <button class="navChatInfoPageBtns" id="settingsArticleBtn" data-action="settingsPage">Settings</button>
            </nav>
            <article id="contentArticle">
                
            </article>
            <aside id="deleteUserInfo">
                <div id="deleteUserInfoForm">
                    <label id="deleteUserInfoLbl">Are you sure?</label>
                    <div id="deleteUserInfoBtns">
                        <button class="deleteUserInfoBtns" id="deleteUserInfoCancelBtn">Cancel</button>
                        <button class="deleteUserInfoBtns" id="deleteUserInfoAgreeBtn">Yes</button>
                    </div>
                </div>
            </aside>
        </div>
    `,
    membersPageInfo: html`
        <div id="membersPageInfo"></div>
    `,
    memberAdminPageInfo: html`
        <div class="memberAdminPageInfo">
            <img class="participantIcon" src="../img/avaPlaceholder.svg">
            <div class="participantsInfoBlock">
                <label class="participantsName">Participant Name</label>
                <label class="participantsLogin">Participant Login</label>
            </div>
            <div class="participantsInfoBlock">
                <label class="participantsRole">New User</label> 
                <label class="participantsIsOnline">Online</label>
            </div>
            <img class="deleteUserBtn" src="../img/cross.svg">
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
        chatNameInfoLbl: {
            color: '#FFA8A8',
            'font-size': '16px',
        },
        numMembersInfoLbl: {
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
        membersPageInfo:{
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            'overflow-y': 'scroll',
            display: 'grid',
            'grid-auto-rows': '50px',
            gap: '10px',
        },
        deleteUserInfo: {
            'z-index': '10',
            'align-items': 'center',
            'justify-items': 'center',
        },
        deleteUserInfoForm: {
            background: '#333333',
            display: 'grid',
            height: '100px',
            width: '250px',
            color: '#FFA8A8',
            'border-radius': '10px',
        },
        deleteUserInfoLbl: {
            'text-align': 'center',
            padding: '5px 0',
            'white-space': 'normal',
        },
        deleteUserInfoBtns: {
            display: 'flex'
        },
        deleteUserInfoCancelBtn: {
            color: '#FFE7A8'
        },
        deleteUserInfoAgreeBtn: {
            color: '#AFFFA8'
        }
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
        navChatInfoPageBtns: {
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
        memberAdminPageInfo: {
            height: '50px',
            width: '100%',
            display: 'grid',
            'grid-template-columns':' 60px calc(100% - 200px) 100px 40px',
            'justify-items': 'center',
            'align-items': 'center',
            'background': '#333333',
            'border-radius': '10px',
        },
        participantsName: {
            color: '#FFA8A8',
            'font-size': '16px',
            margin: '5px 20px',
        },
        participantsLogin: {
            color: '#C0C0C0',
            'font-size': '12px',
            margin: '0 20px',
        },
        participantIcon: {
            width: '36px',
        },
        participantsInfoBlock: {
            width: '100%',
            height: '100%',
            display: 'grid',
            'grid-template-rows': '55% 45%',
        },
        participantsRole: {
            color: '#C0C0C0',
            'font-size': '12px',
            margin: '5px 0px',
        },
        participantsIsOnline: {
            color: '#AFFFA8',
            'font-size': '12px',
        },
        deleteUserInfoBtns: {
            background: 'none',
            border: 'none',
            flex: '1',
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
        aside: {
            width: '100vw',
            height: '100vh',
            display: 'none',
            position: 'absolute',
            background: 'rgba(0, 0, 0, 0.5)',
            'backdrop-filter': 'blur(4px)',
            'z-index': '5',
            'max-width': '1200px',
        },
    }
}