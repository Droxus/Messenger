import App from '../App.js'
import Chat from './Chat.js'
import Profile from './Profile.js'
import Settings from './Settings.js'

const Home = {
    start: () => {
        console.log('test')
        Home.homePage()
    },
    editMode: false,
    homePage: (page) => {
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
        footerBtn.onclick = () => asideBlock.style.display = asideBlock.style.display == 'none' ? 'block' : 'none'
        profilePageBtn.onclick = Profile.showThisUser
        settingsPageBtn.onclick = Settings.start
        findBtn.onclick = () => {
            showInsteadOf(searchBlock, headerBlock);
            searchInp.focus()
        }
        closeSearchBlockBtn.onclick = () => {
            showInsteadOf(headerBlock, searchBlock)
            searchContactsBlock.style.display = 'flex'
            searchInp.value = ''
            searchInp.dispatchEvent(new Event('input'))
        }
        searchInp.oninput = (event) => {
            const value = event.target.value.toLowerCase()
            const contentBlock = article[0].children[0]
            const globalSearchAvalibleBlocks = ['contactsPage', 'publicsPage']
            let filteredResult
            switch (contentBlock.id) {
                case 'groupsPage':
                    groupBlocks.forEach(e => e.style.display = 'grid')
                    filteredResult = groupNames.filter(group => !group.innerText.toLowerCase().includes(value))
                    filteredResult.map(lbl => lbl.parentElement.parentElement.parentElement).forEach(btn => btn.style.display = 'none')
                    if (value) groupAddBlock.style.display = 'none'
                    else groupAddBlock.style.display = 'grid'
                break;
                case 'contactsPage':
                    if (searchContactsBlock.children.length > 2) {
                        contactBlocks.forEach(e => e.style.display = 'grid')
                        filteredResult = userLoginLbl.filter(contact => !contact.innerText.toLowerCase().includes(value))
                        filteredResult.concat(userNicknameLbl.filter(contact => !contact.innerText.toLowerCase().includes(value)))
                        filteredResult.map(lbl => lbl.parentElement.parentElement).forEach(btn => btn.style.display = 'none')
                        const visibleContacts = contactBlocks.filter(contact => contact.style.display !== 'none')
                        if (visibleContacts.length < 1) sortingLblBlock[0].style.display = 'none'
                        else sortingLblBlock[0].style.display = 'flex'
                    } else {
                        sortingLblBlock[0].style.display = 'none'
                    }
                    fillGlobalSearchContactsBlock(value)
                    if (value) {
                        contactAddBlock.style.display = 'none'
                        globalSearchContactsBlock.style.display = 'block'
                    } else {
                        contactAddBlock.style.display = 'grid'
                        globalSearchContactsBlock.style.display = 'none'
                    }
                break;
            }
        }
        createBtnAside.onclick = () => {
            switch (footerBtn.innerText) {
                case 'Groups':
                    showInsteadOf(createChatBlock, asideBlock)
                    createChatNameInp.focus()
                break;
                case 'Contacts':
                    showInsteadOf(searchBlock, headerBlock);
                    searchInp.focus()
                    searchContactsBlock.style.display = 'none'
                    asideBlock.style.display = 'none'
                break;
            }
        }
        editBtnAside.onclick = () => {
            switch (footerBtn.innerText) {
                case 'Groups':

                break;
                case 'Contacts':
                    Home.editMode = !Home.editMode
                    callAndChatBlock.forEach(element => element.style.display = Home.editMode ? 'none' : 'grid')
                    editCallAndChatBlock.forEach(element => element.style.display = Home.editMode ? 'grid' : 'none')
                    asideBlock.style.display = 'none'
                break;
            }
        }
        createChatCancelBtn.onclick = () => createChatBlock.style.display = 'none'
        createChatCreateBtn.onclick = async () => {
            const response = await App.db.createGroupChat(createChatNameInp.value, App.thisUser.id, [{ id: App.thisUser.id, followedUserID: false }])
            console.log(response)
            showInsteadOf(asideBlock, createChatBlock)
            createChatBlock.style.display = 'none'
            asideBlock.style.display = 'none'
            groupsArticleBtn.click()
        }
        switch (page) {
            case 'contacts':
                contactsArticleBtn.click()
                break;
        
            default:
                groupsArticleBtn.click()
                break;
        }
    },
    contactsPage: async () => {
        App.clear(contentArticle)
        insertElement(contentArticle, templates.contactsPage, styles)
        const userContacts = await App.db.readFile(`users/${App.thisUser.id}/contacts.json`)
        console.log(userContacts)
        if (userContacts.length > 0)
        for (const userID of userContacts) {
            const user = await App.db.readFile(`users/${userID}/user.json`)
            console.log(user)
            insertElement(searchContactsBlock, templates.contactBlocks, styles)
            userNicknameLbl.lastElement().innerText = user.nickname
            userLoginLbl.lastElement().innerText = user.login
            contactBlocks.lastElement().id = user.id
            contactBlocks.lastElement().onclick = () => {
                Profile.showOtherUser(user)
            }
            removeContactBtn.lastElement().onclick = async () => {
                await App.db.deleteValue(`users/${App.thisUser.id}/contacts.json`, user.id)
                Home.homePage('contacts')
            }
        }
        contactAddBlock.onclick = () => {
            showInsteadOf(searchBlock, headerBlock);
            searchInp.focus()
            searchContactsBlock.style.display = 'none'
        }
    },
    chatsPage: async () => {
        App.clear(contentArticle)
        insertElement(contentArticle, templates.chatsPage, styles)
        const userChats = await App.db.readFile(`users/${App.thisUser.id}/chats.json`)
        for (const chatID of userChats) {
            const chat = await App.db.getChatInfo(`chats/${chatID}.json`)
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
        App.clear(contentArticle)
        insertElement(contentArticle, templates.groupsPage, styles)
        const userGroups = await App.db.readFile(`users/${App.thisUser.id}/groups.json`)
        console.log(userGroups)
        for (const groupID of userGroups) {
            const group = await App.db.getChatInfo(`groups/${groupID}.json`)
            insertElement(groupsPage, templates.groupBlocks, styles)
            if (group.messages.length > 0) {
                const currentTime = new Date()
                const creationTime = new Date(group.messages[group.messages.length-1].creationTime)
                const hours = String(creationTime.getHours()).padStart(2, '0')
                const minutes = String(creationTime.getMinutes()).padStart(2, '0')
                const day = String(creationTime.getDay() + 1).padStart(2, '0')
                const month = String(creationTime.getMonth() + 1).padStart(2, '0')
                const year = String(creationTime.getFullYear()).padStart(4, '0')
                const isToday = currentTime.getFullYear() === creationTime.getFullYear() && currentTime.getMonth() === creationTime.getMonth() && currentTime.getDate() === creationTime.getDate()
                groupLastMsg[groupLastMsg.length-1].innerText = group.messages[group.messages.length-1].content
                groupTimeMsg[groupLastMsg.length-1].innerText = isToday ? `${hours}:${minutes}` : `${day}.${month}.${year}`
            }
            groupBlocks[groupBlocks.length-1].id = group.id
            groupNames[groupNames.length-1].innerText = group.name
            participantsNum[participantsNum.length-1].innerText = group.participants.length
            groupBlocks[groupBlocks.length-1].onclick = () => {if (group) Chat.groupChat(group)}
        }
        groupAddBlock.onclick = () => {
            showInsteadOf(createChatBlock, asideBlock)
            createChatNameInp.focus()
        }
    },
    publicsPage: async () => {
        insertElement(contentArticle, templates.publicsPage, styles)
    },
}
export default Home

async function fillGlobalSearchContactsBlock(value) {
    globalSearchContactsBlock.style.display = 'block'
    const users = await App.db.readFile('users.json')
    const userContacts = await App.db.readFile(`users/${App.thisUser.id}/contacts.json`)
    userContacts.push(App.thisUser.id)
    let globalUsers = users.filter(user => !userContacts.includes(user.id))
    let filteredUsers = globalUsers.filter(user => user.login.toLowerCase().includes(value))
    let unfilteredUsers = globalUsers.filter(user => !user.login.toLowerCase().includes(value))
    filteredUsers = filteredUsers.concat(unfilteredUsers.filter(user => user.nickname.toLowerCase().includes(value)))
    App.clear(globalSearchContactsBtnsBlock)
    for (const user of filteredUsers) {
        insertElement(globalSearchContactsBtnsBlock, templates.globalContactBlocks, styles)
        globalUserNicknameLbl.lastElement().innerText = user.nickname
        globalUserLoginLbl.lastElement().innerText = user.login
        addContactBtnBlock.lastElement().id = user.id
        addContactBtnBlock.lastElement().onclick = async (event) => {
            await App.db.push(`users/${App.thisUser.id}/contacts.json`, event.currentTarget.id)
            Home.contactsPage()
        }
    }
    if (filteredUsers.length < 1) globalSearchContactsBlock.style.display = 'none'
}

const templates = {
    homePage: html`
        <div id="homePage">
            <header>
                <div id="headerBlock">
                    <button id="settingsPageBtn">Settings</button>
                    <button id="findBtn">Find</button>
                    <button id="profilePageBtn">Profile</button>
                </div>
                <div id="searchBlock">
                    <div id="searchInpBlock">
                        <input type="text" id="searchInp" placeholder="Write to find">
                        <button id="closeSearchBlockBtn"><img src="../img/cross.svg"></button>
                    </div>
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
            <aside id="asideBlock">
                <div id="asideBtnBlock">
                    <button class="asideBtns" id="editBtnAside">
                        <img src="../img/editBtnIcon.svg">
                        <label class="asideBtnsLbls">Edit</label>
                    </button>
                    <button class="asideBtns" id="createBtnAside">
                        <img src="../img/addBtnIcon.svg">
                        <label class="asideBtnsLbls">Create</label>
                    </button>
                    <button class="asideBtns" id="newFolderBtnAside">
                        <img src="../img/folderIcon.svg">
                        <label class="asideBtnsLbls">New Folder</label>
                    </button>
                </div>
            </aside>
            <aside id="createChatBlock">
                <div id="createChatForm">
                    <label id="createChatLbl">Input Chat Name</label>
                    <input type="text" id="createChatNameInp">
                    <div id="createChatBlockBtns">
                        <button class="createChatBtns" id="createChatCancelBtn">Cancel</button>
                        <button class="createChatBtns" id="createChatCreateBtn">Create</button>
                    </div>
                </div>
            </aside>
        </div>
    `,
    contactsPage: html`
        <div id="contactsPage">
            <div id="searchContactsBlock">
                <button id="contactAddBlock">
                    <label>Add New Contact</label>
                </button>
                <div class="sortingLblBlock">
                    <label class="sortingLbl">Your Contacts</label>
                    <hr class="sortingHr"/>
                </div>
            </div>
            <div id="globalSearchContactsBlock">
                <div class="sortingLblBlock">
                    <label class="sortingLbl">Global Search</label>
                    <hr class="sortingHr"/>
                </div>
                <div id="globalSearchContactsBtnsBlock">

                </div>
            </div>
        </div>
    `,
    chatsPage: html`
        <div id="chatsPage">

        </div>
    `,
    groupsPage: html`
        <div id="groupsPage">
            <button id="groupAddBlock">
                <label>Add New Group</label>
            </button>
            <div class="sortingLblBlock">
                <label class="sortingLbl">Your Groups</label>
                <hr class="sortingHr"/>
            </div>
        </div>
    `,
    publicsPage: html`
        <div id="publicsPage">

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
                <label class="isOnlineLbl">online</label>
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
    contactBlocks: html`
        <button class="contactBlocks">
            <div class="avaAndStatusBlock">
                <img src="../img/avaPlaceholder.svg" class="userIcons">
                <label class="isOnlineLbl">online</label>
            </div>
            <div class="nickAndLoginBlock">
                <label class="userNicknameLbl">User Nickname</label>
                <label class="userLoginLbl">User Login</label>
            </div>
            <div class="callAndChatBlock">
                <img src="../img/callIcon.svg">
                <img src="../img/chatOpenIcon.svg">
            </div>
            <div class="editCallAndChatBlock">
                <div></div>
                <div class="addContactBtnBlock">
                    <img src="../img/deleteUserIcon.svg" class="removeContactBtn">
                </div>
            </div>
        </button>
    `,
    globalContactBlocks: html`
        <button class="globalContactBlocks">
            <div class="avaAndStatusBlock">
                <img src="../img/avaPlaceholder.svg" class="userIcons">
                <label class="isOnlineLbl">online</label>
            </div>
            <div class="nickAndLoginBlock">
                <label class="globalUserNicknameLbl">User Nickname</label>
                <label class="globalUserLoginLbl">User Login</label>
            </div>
            <div class="callAndChatBlock">
                <div></div>
                <div class="addContactBtnBlock">
                    <img src="../img/addToContactsIcon.svg" class="addContactBtn">
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
        searchBlock: {
            width: '100vw',
            height: '100%',
            display: 'none',
            'gap': '5%',
            'align-items': 'end',
            'justify-items': 'center',
            margin: '10px 0',
            'max-width': '1200px'
        },
        searchInpBlock: {
            width: '500px',
            height: '25px',
            'border-bottom': '2px solid #FFE7A8',
            'border-radius': '10px',
            display: 'flex',
            padding: '0px 10px',
            'max-width': '80vw',
        },
        searchInp: {
            height: '100%',
            width: '100%',
            background: 'none',
            border: 'none',
            color: '#C0C0C0',
            'font-size': '16px',
        },
        closeSearchBlockBtn: {
            width: '25px',
            color: 'white',
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
            display: 'flex',
            'justify-items': 'center',
            'flex-direction': '90px',
            'align-items': 'center',
            'padding-top': '15px',
            'overflow-y': 'scroll',
            margin: '0px auto'
        },
        groupsPage: {
            width: '90%',
            height: 'calc(100% - 40px)',
            display: 'flex',
            'justify-items': 'center',
            'flex-direction': 'column',
            'align-items': 'center',
            'padding-top': '15px',
            'overflow-y': 'scroll',
            margin: '0px auto'
        },
        asideBtnBlock: {
            position: 'absolute',
            bottom: '100px',
            height: '64px',
            width: '100vw',
            'max-width': '1200px',
            display: 'flex',
            'justify-content': 'space-evenly',
        },
        createChatBlock: {
            'z-index': '10',
            'align-items': 'center',
            'justify-items': 'center',
        },
        createChatForm: {
            background: '#333333',
            display: 'grid',
            height: '100px',
            width: '200px',
            color: '#FFA8A8',
            'border-radius': '10px',
        },
        createChatLbl: {
            'text-align': 'center',
            padding: '5px 0',
        },
        createChatNameInp: {
            background: 'none',
            border: 'none',
            color: '#C0C0C0',
            'border-bottom': '2px solid #C0C0C0',
            padding: '0 10px',
        },
        createChatBlockBtns: {
            display: 'flex'
        },
        createChatCancelBtn: {
            color: '#FFE7A8'
        },
        createChatCreateBtn: {
            color: '#AFFFA8'
        },
        contactsPage: {
            width: '90%',
            height: 'calc(100% - 40px)',
            display: 'flex',
            'justify-items': 'center',
            'align-items': 'center',
            'padding-top': '15px',
            'overflow-y': 'scroll',
            margin: '0px auto',
            'flex-direction': 'column',
        },
        contactAddBlock: {
            color: '#C0C0C0',
            width: '100%',
            height: '50px',
            display: 'grid',
            border: '2px solid #333333',
            'place-items': 'center',
            'font-size': '14px',
            order: '1',
            margin: '5px 0px',
        },
        groupAddBlock: {
            color: '#C0C0C0',
            width: '100%',
            height: '75px',
            display: 'grid',
            border: '2px solid #333333',
            'place-items': 'center',
            'font-size': '14px',
            order: '1',
            margin: '5px 0px',
        },
        globalSearchContactsBlock: {
            width: '100%',
            order: '1',
            display: 'none',
        },
        searchContactsBlock: {
            width: '100%',
            order: '0',
            display: 'flex',
            'flex-direction': 'column',
        },
        globalSearchContactsBtnsBlock: {
            width: '100%'
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
            margin: '5px 0px',
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
        isOnlineLbl: {
            color: '#AFFFA8',
            'font-size': '12px'
        },
        participantsNum: {
            color: '#AFFFA8',
            margin: '0 5px 0 0',
            'font-size': '12px',
        },
        asideBtns: {
            width: '65px',
            height: '100%',
            background: 'none',
        },
        asideBtnsLbls: {
            color: '#FFE7A8',
            margin: '10px 0px',
            'font-size': '14px',
        },
        createChatBtns: {
            background: 'none',
            border: 'none',
            flex: '1',
        },
        contactBlocks: {
            background: '#333333',
            color: '#C0C0C0',
            width: '100%',
            height: '50px',
            display: 'grid',
            'grid-template-columns': '60px calc(100% - 180px) 120px',
            margin: '5px 0px',
        },
        globalContactBlocks: {
            background: '#333333',
            color: '#C0C0C0',
            width: '100%',
            height: '50px',
            display: 'grid',
            'grid-template-columns': '60px calc(100% - 180px) 120px',
            margin: '5px 0px',
        },
        addContactBtnBlock: {
            width: '100%',
            height: '100%',
            display: 'grid',
            'place-items': 'center',
        },
        userIcons: {
            width: '36px',
        },
        avaAndStatusBlock: {
            display: 'grid',
            'justify-items': 'center',
            'align-items': 'center',
            'grid-template-rows': '36px 14px',
        },
        nickAndLoginBlock: {
            display: 'grid',
            height: '100%',
            'justify-items': 'start',
            'grid-template-rows': '40% 50%',
            padding: '5px 15px',
            'align-items': 'start',
        },
        callAndChatBlock: {
            display: 'grid',
            height: '100%',
            'grid-template-columns': '50% 50%',
            'align-items': 'center',
            'justify-items': 'center',
        },
        editCallAndChatBlock: {
            display: 'none',
            height: '100%',
            'grid-template-columns': '50% 50%',
            'align-items': 'center',
            'justify-items': 'center',
        },
        userNicknameLbl: {
            'font-size': '16px',
            'text-align': 'left',
            color: '#FFA8A8',
            width: '100%',
        },
        userLoginLbl: {
            'font-size': '12px',
            'text-align': 'left',
            color: '#C0C0C0',
            width: '100%',
        },
        globalUserNicknameLbl: {
            'font-size': '16px',
            'text-align': 'left',
            color: '#FFA8A8',
            width: '100%',
        },
        globalUserLoginLbl: {
            'font-size': '12px',
            'text-align': 'left',
            color: '#C0C0C0',
            width: '100%',
        },
        sortingLblBlock: {
            width: '100%',
            display: 'flex',
            'align-items': 'center',
            'padding-top': '5px'
        },
        sortingLbl: {
            'font-size': '14px',
            color: '#FFA8A8',
            background: 'black',
            'z-index': '2',
            display: 'flex',
            'padding-right': '40px',
        },
        sortingHr: {
            border: '1px solid #FFA8A8',
            width: '100%'
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
            'overflow-x': 'scroll',
        },
        article: {

        },
        footer: {
            'z-index': '10',
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
        }
    }
}