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
            if (msgInp.value == '' && fileAttachBlock.children.length < 1) return undefined
            const userID = App.thisUser.id
            console.log(attachFileInp.files)
            let mediaFiles = attachFileInp.files
            if (audioChunks.length > 0) mediaFiles = audioChunks
            const response = await App.db.sendMessageChat(userID, `groups/${group.id}.json`, msgInp.value, mediaFiles)
            console.log(response)
            msgInp.value = ''
            attachFileInp.value = ''
            audioChunks = []
            fileAttachBlock.style.display = 'none'
            if (document.getElementById('emojisBlock')) {
                App.clear(document.getElementById('emojisBlock'))
                document.getElementById('emojisBlock').remove()
            }
            getGroupChatMsg(group)
        }
        msgInp.oninput = (event) => {
            const value = event.target.value
            if (value.length > 0) showInsteadOf(sendMsg, sendVoice, 'block')
            else showInsteadOf(sendVoice, sendMsg, 'block')
        }
        attachFile.onclick = () => attachFileInp.click()
        attachFileInp.oninput = (event) => {
            if (event.target.files.length < 1) return showInsteadOf(sendVoice, sendMsg, 'block')
            console.log(event.target.files)
            showAttachedFiles(event.target.files)
        }
        showPhotoBlock.onclick = () => {
            showPhotoBlock.style.display = 'none'
        }
        let isVoiceRecording, mediaRecorder, audioChunks = []
        const startRecording = () => {
            navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
              mediaRecorder = new MediaRecorder(stream);
              mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    const audioBlob = new Blob([event.data], { type: 'audio/wav', filename: 'voicemessage.wav' });
                    audioChunks = [audioBlob]
                    showAttachedFiles(audioChunks)
                    console.log(audioChunks)
                }
              };
              mediaRecorder.start();
            });
          };
        sendVoice.onmousedown = () => {
            isVoiceRecording = true
            audioChunks = null;
            startRecording();
            fileAttachBlock.style.display = 'flex'
            const contentP = document.createElement('p');
            contentP.innerText = 'You are recording voice message now'
            contentP.style.color = '#C0C0C0'
            contentP.style.width = '100%'
            contentP.style.textAlign = 'center'
            fileAttachBlock.appendChild(contentP)
        }
        sendVoice.onmouseleave = () => {
            if (isVoiceRecording) {
                mediaRecorder.stop();
                fileAttachBlock.style.display = 'none'
                App.clear(fileAttachBlock)
            }
            isVoiceRecording = false
        }
        sendVoice.onmouseup = () => {
            if (isVoiceRecording) {
                mediaRecorder.stop();
                fileAttachBlock.style.display = 'none'
                App.clear(fileAttachBlock)
            }
            isVoiceRecording = false
        }
        sendEmoji.onclick = async () => {
            if (!document.getElementById('emojisBlock')) {
                const response = await fetch('./localAPI/emojis.json')
                const jsonData = await response.json()
                const emojisBlock = document.createElement("div");
                emojisBlock.style.backgroundColor = "#333333";
                emojisBlock.style.width = "300px";
                emojisBlock.style.height = "300px";
                emojisBlock.style.position = "absolute";
                emojisBlock.style.marginTop = "-315px";
                const rect = sendEmoji.getBoundingClientRect();
                const indentationSize = rect.left - 200;
                emojisBlock.style.left = `${indentationSize}px`;
                emojisBlock.id = 'emojisBlock'
                emojisBlock.style.overflowY = 'scroll'
                emojisBlock.style.padding = '5px'
                emojisBlock.style.boxSizing = 'border-box'
                emojisBlock.style.border = '2px solid #FFA8A8'
                emojisBlock.style.borderRadius = '10px'
                jsonData.forEach(emoji => {
                    const emojieLbl = document.createElement("label");
                    emojieLbl.innerText = emoji
                    emojisBlock.appendChild(emojieLbl)
                })
                emojisBlock.onclick = (event) => {
                    if (event.target.tagName == 'LABEL') {
                        msgInp.value += event.target.innerText
                        msgInp.dispatchEvent(new Event('input'))
                    }
                }
                sendEmoji.parentElement.appendChild(emojisBlock);
            } else {
                App.clear(document.getElementById('emojisBlock'))
                document.getElementById('emojisBlock').remove()
            }
        }
    },
    infoBlock: async (thisGroup) => {
        App.clear(appDiv)
        insertElement(appDiv, templates.infoBlock, styles)
        const group = await App.db.readFile(`groups/${thisGroup.id}.json`)
        backPageBtn.onclick = Home.homePage
        backPageInfoBtn.onclick = () => Chat.groupChat(group)
        homePageBtn.onclick = Home.start
        chatNameInfoLbl.innerText = group.name
        numMembersInfoLbl.innerText =  `${group.participants.length} members`
        navInfoBlock.onclick = (event) => {
            if (!event.target.dataset.action) return undefined
            App.clear(contentArticle)
            Chat[event.target.dataset.action](group)
            navChatInfoPageBtns.forEach(btn => btn.style.color = '#C0C0C0')
            event.target.style.color = 'white'
        };
        findBtn.onclick = () => {
            showInsteadOf(searchBlock, headerBlock);
            searchInp.focus()
        }
        closeSearchBlockBtn.onclick = () => {
            showInsteadOf(headerBlock, searchBlock)
            searchInp.value = ''
            searchInp.dispatchEvent(new Event('input'))
        }
        searchInp.oninput = (event) => {
            const value = event.target.value.toLowerCase()
            const contentBlock = article[0].children[0]
            let filteredResult
            switch (contentBlock.id) {
                case 'membersPageInfo':
                    memberAdminPageInfo.forEach(e => e.style.display = 'grid')
                    filteredResult = participantsLogin.filter(member => !member.innerText.toLowerCase().includes(value))
                    filteredResult.concat(participantsName.filter(member => !member.innerText.toLowerCase().includes(value)))
                    filteredResult.map(lbl => lbl.parentElement.parentElement).forEach(btn => btn.style.display = 'none')
                    if (value) addNewUserPageInfo.style.display = 'none'
                    else addNewUserPageInfo.style.display = 'grid'
                break;
                case 'voicePageInfo':

                break;
            }
        }
        footerBtn.onclick = () => addMembersToGroup.style.display = 'none'
        membersArticleBtn.click()
    },
    membersPage: async (group) => {
        App.clear(contentArticle)
        insertElement(contentArticle, templates.membersPageInfo, styles)
        let thisGroup = group
        console.log(thisGroup)
        let creator
        for (const participant of thisGroup.participants) {
            insertElement(membersPageInfo, templates.memberAdminPageInfo, styles)
            const user = await App.db.readFile(`users/${participant.id}/user.json`)
            console.log(user)
            participantsName.lastElement().innerText = user.nickname
            participantsLogin.lastElement().innerText = user.login
            if (thisGroup.creator == user.id) creator = participantsRole.lastElement()
            deleteUserBtn.lastElement().onclick = () => {
                if (App.thisUser.id !== thisGroup.creator) return undefined
                deleteUserInfoLbl.innerText = `Are you sure you want to remove ${user.login} from this group`
                deleteUserInfo.style.display = 'grid'
                deleteUserInfoAgreeBtn.setAttribute('deleteUserId', user.id)
            }
        }
        addNewUserPageInfo.onclick = async () => {
            addMembersToGroup.style.display = 'grid'
            App.clear(searchContactsBlock)
            const groupParticipantsId = thisGroup.participants.map(participant => participant.id)
            let contacts = await App.db.readFile(`users/${App.thisUser.id}/contacts.json`)
            contacts = contacts.filter(contact => !groupParticipantsId.includes(contact))
            const users = await App.db.readFile(`users.json`)
            for (const contact of contacts) {
                insertElement(searchContactsBlock, templates.memberAddAdminPageInfo, styles)
                const thisUser = users.find(user => user.id == contact)
                participantsName.lastElement().innerText = thisUser.nickname
                participantsLogin.lastElement().innerText = thisUser.login
                addUserBtn.lastElement().id = thisUser.id
                addUserBtn.lastElement().onclick = async (event) => {
                    thisGroup = await App.db.joinGroupChat(thisGroup.id, event.target.id, App.thisUser.id)
                    addMembersToGroup.style.display = 'none'
                    Chat.infoBlock(thisGroup)
                }
            }
        }
        deleteUserInfoCancelBtn.onclick = () => deleteUserInfo.style.display = 'none'
        deleteUserInfoAgreeBtn.onclick = async (event) => {
            const id = event.target.getAttribute('deleteUserId')
            await App.db.deleteValue(`users/${id}/groups.json`, thisGroup.id)
            await App.db.deleteValue(`groups/${thisGroup.id}.json`, 'participants', 'id', id)
            deleteUserInfo.style.display = 'none'
            Chat.infoBlock(thisGroup)
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
    const messages = group.messages.reverse()
    for (const msg of messages) {
        insertElement(contentArticle, templates.messagesGroup, styles)
        const creator = allUsers.find(user => user.id == msg.userID)
        const hours = String(new Date(msg.creationTime).getHours()).padStart(2, '0')
        const minutes = String(new Date(msg.creationTime).getMinutes()).padStart(2, '0')
        let date = new Date(msg.creationTime).toLocaleString('en-us', { day:'numeric', month: 'long', year:'numeric' })
        if (new Date(msg.creationTime).getFullYear() == new Date().getFullYear()) date = date.split(',')[0]
        if (Array.from(document.getElementsByClassName('dateChatLbl')).length  < 1 || Array.from(document.getElementsByClassName('dateChatLbl')).lastElement().innerText !== date) {
            insertElement(contentArticle, templates.dateChatBlock, styles)
            dateChatLbl.lastElement().innerText = date
        }
        messagesGroupAva.lastElement().id = msg.id
        messagesGroupAuthor.lastElement().innerText = creator.nickname
        messagesGroupContentText.lastElement().innerText = msg.content
        messagesGroupTime.lastElement().innerText = `${hours}:${minutes}`
        messagesGroupAva.lastElement().style.alignSelf = creator.id !== App.thisUser.id ? 'flex-start' : 'flex-end';
        messagesGroupAva.lastElement().style.gridTemplateColumns = creator.id !== App.thisUser.id ? '32px calc(100% - 32px)' : 'calc(100% - 32px) 32px ';
        messagesGroup.lastElement().style.borderRadius = creator.id !== App.thisUser.id ? '10px 10px 10px 0px' : '10px 10px 0px 10px';
        messagesGroup.lastElement().style.order = creator.id !== App.thisUser.id ? '1' : '0';
        userMsgIcons.lastElement().style.placeSelf = creator.id !== App.thisUser.id ? 'end left' : 'end';
        if (msg.mediafiles.length > 0) showMediafiles(msg.mediafiles, messagesGroupContent.lastElement())
    }
    if (group.messages.length < 1) return undefined
    messagesGroup[0].scrollIntoView()
}
async function showMediafiles(mediafiles, thisDiv) {
    for (const mediafile of mediafiles) {
        const response = await App.db.getMedia(mediafile)
        let fileElement;
        switch (response.type.split('/')[0]) {
            case 'image':
                fileElement = document.createElement('img');
                fileElement.src = URL.createObjectURL(response);
                fileElement.onclick = (event) => {
                    App.clear(showPhotoBlock)
                    showPhotoBlock.style.display = 'flex'
                    showPhotoBlock.appendChild(event.target.cloneNode(true))
                }
                break;
            case 'video':
                fileElement = document.createElement('video');
                fileElement.src = URL.createObjectURL(response);
                fileElement.controls = true;
                break;
            case 'audio':
                fileElement = document.createElement('audio');
                fileElement.src = URL.createObjectURL(response);
                fileElement.controls = true;
                break;
            default:
                const fileImgElement = document.createElement('img');
                fileImgElement.src = '../img/folderIcon.svg'
                fileImgElement.style.width = '42px'
                fileImgElement.style.order = '1'
                fileImgElement.style.margin = '15px 5px'
                thisDiv.appendChild(fileImgElement);
                fileElement = document.createElement('a');
                fileElement.href = URL.createObjectURL(response);
                const fileName = fileElement.href.slice(fileElement.href.lastIndexOf('/')+1, fileElement.href.length)
                fileElement.style.margin = '0 5px'
                fileElement.target = '_blank';
                fileElement.textContent = `Name: ${fileName + '.' + response.type.split('/')[1].split('-')[0]}, Size: ${(response.size / (1024 * 1024)).toFixed(2)} MB`;;
                fileElement.download = fileName + '.' + response.type.split('/')[1].split('-')[0];
                fileElement.style.textDecorationLine = 'none'
                break;
            }
            fileElement.style.maxWidth = '100%'
            fileElement.style.maxHeight = '100%'
            fileElement.style.marginBottom = '10px'
            fileElement.style.borderRadius = '10px'
            fileElement.style.color = '#FFE7A8'
            fileElement.loading = 'lazy'
            thisDiv.appendChild(fileElement);
    }
}
function showAttachedFiles(files) {
    fileAttachBlock.style.display = 'grid'
    showInsteadOf(sendMsg, sendVoice, 'block')
    App.clear(fileAttachBlock)
    for (const file of files) {
        const fileDiv = document.createElement('div');
        const unattachButton = document.createElement('button');
        const fileType = file.type.split('/')[0];
        let fileElement;
        switch (fileType) {
            case 'image':
                fileElement = document.createElement('img');
                fileElement.src = URL.createObjectURL(file);
                break;
            case 'video':
                fileElement = document.createElement('video');
                fileElement.src = URL.createObjectURL(file);
                fileElement.controls = true;
                break;
            case 'audio':
                fileElement = document.createElement('audio');
                fileElement.src = URL.createObjectURL(file);
                fileElement.controls = true;
                break;
        
            default:
                const fileImgElement = document.createElement('img');
                fileImgElement.src = '../img/folderIcon.svg'
                fileDiv.appendChild(fileImgElement);
                fileElement = document.createElement('p');
                fileElement.textContent = file.name;
                break;
        }
        fileElement.style.maxHeight = '100%'
        fileElement.style.maxWidth = '100%'
        fileDiv.style.maxWidth = '80%'
        fileDiv.style.maxHeight = '80%'
        fileDiv.style.padding = '50px 0px'
        fileElement.style.color = '#FFE7A8'
        fileDiv.appendChild(fileElement);

        const fileSize = (file.size / (1024 * 1024)).toFixed(2);
        const fileInfo = document.createElement('p');
        fileInfo.textContent = `Type: ${fileType.toUpperCase()}, Size: ${fileSize} MB`;
        fileInfo.style.color = '#C0C0C0'
        unattachButton.style.color = '#FFA8A8'
        unattachButton.innerText = 'Unattach'
        unattachButton.id = file.name
        fileDiv.appendChild(fileInfo);
        fileDiv.appendChild(unattachButton);
        console.log(attachFileInp.files)
        unattachButton.onclick = (event) => {
            const dt = new DataTransfer()
            const { files } = attachFileInp
            for (const thisFile of files) {
                if (event.target.id == thisFile.name)
                dt.items.add(thisFile)
            }
            attachFileInp.files = dt.files
            fileAttachBlock.removeChild(fileDiv);
            if (fileAttachBlock.children.length < 1) {
                showInsteadOf(sendVoice, sendMsg, 'block')
                fileAttachBlock.style.display = 'none'
                attachFileInp.value = ''
            }
        }
        fileAttachBlock.appendChild(fileDiv);
    }
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
                    <button id="attachFile"><img id="attachFileIcon" src="../img/paperClipIcon.svg"><input type="file" multiple id="attachFileInp"></button>
                    <textarea id="msgInp" type="text" placeholder="Type Message" rows="1" autofocus></textarea>
                    <button id="sendEmoji"><img id="sendEmojiIcon" src="../img/emojiIcon.svg"></button>
                    <button id="sendMsg"><img id="sendMsgIcon" src="../img/sendMsgIcon.svg"></button>
                    <button id="sendVoice"><img id="sendVoiceIcon" src="../img/microIcon.svg"></button>
                </div>
            </footer>
            <aside id="fileAttachBlock">

            </aside>
            <aside id="showPhotoBlock">

            </aside>
        </div>
    `,
    messagesGroup: html`
        <div class="messagesGroupAva">
            <div class="messagesGroup">
                <label class="messagesGroupAuthor">Name</label>
                <div class="messagesGroupContent">
                    <label class="messagesGroupContentText">Text Message</label>
                </div>
                <label class="messagesGroupTime">Time</label>
            </div>
            <img class="userMsgIcons" src="../img/avaPlaceholder.svg">
        </div>
    `,
    dateChatBlock: html`
        <div class="dateChatBlock">
            <label class="dateChatLbl"></label>
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
                <div id="searchBlock">
                    <div id="searchInpBlock">
                        <input type="text" id="searchInp" placeholder="Write to find">
                        <button id="closeSearchBlockBtn"><img src="../img/cross.svg"></button>
                    </div>
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
            <aside id="addMembersToGroup">
                <div id="contactsPage">
                    <div id="searchContactsBlock">

                    </div>
                </div>
                <footer>
                    <button id="footerBtn">Close</button>
                </footer>
            </aside>
        </div>
    `,
    membersPageInfo: html`
        <div id="membersPageInfo">
            <button id="addNewUserPageInfo">
                <label id="addNewUserLblPageInfo">Add New User</label>
            </button>
        </div>
    `,
    memberAdminPageInfo: html`
        <button class="memberAdminPageInfo">
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
        </button>
    `,
    memberAddAdminPageInfo: html`
        <button class="memberAddAdminPageInfo">
            <img class="participantIcon" src="../img/avaPlaceholder.svg">
            <div class="participantsInfoBlock">
                <label class="participantsName">Participant Name</label>
                <label class="participantsLogin">Participant Login</label>
            </div>
            <div class="participantsInfoBlock">
                <div></div>
                <label class="participantsIsOnline">Online</label>
            </div>
            <img class="addUserBtn" src="../img/addToContactsIcon.svg">
        </button>
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
            'grid-template-columns': '50px calc(100% - 150px) 50px 50px',
        },
        contentArticle: {
            width: '90%',
            height: 'calc(100% - 40px)',
            display: 'flex',
            'padding-top': '15px',
            margin: '10px auto',
            'overflow': 'hidden scroll',
            gap: '10px',
            'flex-direction': 'column-reverse',
            'align-items': 'flex-end',
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
            height: 'calc(100% - 30px)',
            width: 'calc(100% - 20px)',
            border: 'none',
            background: 'none',
            color: '#C0C0C0',
            padding: '15px 20px 15px 5px',
            'font-size': '16px',
            resize: 'none',
            outline: 'none',
        },
        attachFileInp: {
            display: 'none'
        },
        sendMsg: {
            height: '100%',
            width: '100%',
            border: 'none',
            background: 'none',
            display: 'none'
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
        },
        addNewUserPageInfo: {
            height: '50px',
            width: '100%',
            display: 'grid',
            'place-items': 'center',
            border: '2px solid #333333',
            'border-radius': '10px',
            'box-sizing': 'border-box',
        },
        addNewUserLblPageInfo: {
            'font-size': '14px',
            color: '#C0C0C0',
        },
        addMembersToGroup: {
            display: 'none',
            'grid-template-rows': 'calc(100% - 80px) 80px',
        },
        contactsPage: {
            width: '90%',
            height: 'calc(100% - 40px)',
            display: 'flex',
            'justify-items': 'center',
            'align-items': 'center',
            'padding-top': '15px',
            'overflow-y': 'scroll',
            margin: '5px auto',
            'flex-direction': 'column',
        },
        searchContactsBlock: {
            width: '100%',
            order: '0',
            display: 'flex',
            'flex-direction': 'column',
            gap: '10px',
        },
        fileAttachBlock: {
            height: 'calc(100vh - 80px)',
            'overflow-y': 'scroll',
            'justify-items': 'center',
            'align-items': 'center',
        },
        showPhotoBlock: {
            'overflow-y': 'scroll',
            'justify-items': 'center',
            'align-items': 'center',
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
            'grid-template-rows': '20px calc(100% - 35px) 15px',
            padding: '5px',
            height: 'max-content',
            
        },
        messagesGroupAuthor: {
            color: '#FFA8A8',
            'font-size': '14px',
            'padding': '0px 15px 0px 5px',
        },
        messagesGroupContentText: {
            color: '#C0C0C0',
            'font-size': '14px',
            'white-space': 'break-spaces',
            margin: '0px 15px 0px 5px',
        },
        messagesGroupContent: {
            display: 'flex',
            'flex-direction': 'column-reverse',
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
        memberAddAdminPageInfo: {
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
        contactBlocks: {
            background: '#333333',
            color: '#C0C0C0',
            width: '100%',
            height: '50px',
            display: 'grid',
            'grid-template-columns': '60px calc(100% - 180px) 120px',
            margin: '5px 0px',
        },
        dateChatBlock: {
            background: '#333333',
            'border-radius': '10px',
            width: '100px',
            padding: '5px',
            display: 'grid',
            'align-self': 'center',
        },
        dateChatLbl: {
            color: '#C0C0C0',
            'font-size': '14px',
            'text-align': 'center',
            width: '100%',
        }
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