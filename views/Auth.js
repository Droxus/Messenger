import App from '../App.js'

const Auth = {
    start: async () => {
        const localUserData = JSON.parse(localStorage.getItem('localUsers'));
        if (!Array.isArray(localUserData)) return Auth.signIn();
        if (!localUserData[0].id) return Auth.signIn();
        const currentUser = await App.db.readFile(`users/${localUserData[0].id}/user.json`)
        console.log(currentUser)
        if (!currentUser) return Auth.signIn();
        if (!currentUser.id) return Auth.signIn();
        Auth.successfulAuth(currentUser)
    },
    signIn: () => {
        App.clear()
        insertElement(appDiv, templates.signIn, styles)
        helpBtn[0].onclick = () => {
            if (loginInp.value.length > 4) return Auth.passwordResetting(loginInp.value)
            else Auth.errorOutput('Wrong Login')
        }
        signUpBtn.onclick = Auth.signUp
        signInBtn.onclick = async () => {
            const login = loginInp.value;
            const password = passwordInp.value;
            const response = await App.db.signInUser(login, password)
            if (response.message) return Auth.errorOutput(response.message)
            if (response.id) return Auth.successfulAuth(response)
        }
    },
    signUp: () => {
        App.clear()
        insertElement(appDiv, templates.signUp, styles)
        signInBtn.onclick = Auth.signIn
        signUpBtn.onclick = async () => {
            const login = String(loginInp.value);
            const password = String(passwordInp.value);
            const email = String(emailInp.value);
            const response = await App.db.signUpUser(login, password, email)
            if (response.message) return Auth.errorOutput(response.message)
            if (response.id) return Auth.emailVerifying(response)
        }
    },
    signOut: () => {

    },
    errorOutput: (msg) => {
        errorOutputLbl[0].innerText = msg
    },
    emailVerifying: async (data) => {
        App.clear()
        insertElement(appDiv, templates.emailVerifying, styles)
        getVerifyingMsgBtn.onclick = async () => generatedCode = await App.db.sendVerifyEmailMsg(data.email)
        skipBtn.onclick = Auth.successfulAuth(data)
        let generatedCode = await App.db.sendVerifyEmailMsg(data.email)
        aproveBtn.onclick = async () => {
            let code = Number(codeInp.value);
            if (code !== generatedCode) return Auth.errorOutput('This code is not working')
            const response = await App.db.emailVerified(data.login)
            if (response.message) return Auth.errorOutput(response.message)
            if (response.id) return Auth.successfulAuth(response)
        }
    },
    passwordResetting: async (login) => {
        App.clear()
        insertElement(appDiv, templates.resettingPassword, styles)
        getVerifyingMsgBtn.onclick = async () => generatedCode = await App.db.sendVerifyEmailMsg(undefined, login)
        cancelBtn.onclick = Auth.signIn
        let generatedCode = await App.db.sendVerifyEmailMsg(undefined, login)
        aproveBtn.onclick = async () => {
            let password = newPasswordInp.value;
            let code = Number(codeInp.value);
            if (code !== generatedCode) return Auth.errorOutput('This code is not working')
            const response = await App.db.resetPassword(login, password)
            if (response.message) return Auth.errorOutput(response.message)
            if (response.id) return Auth.successfulAuth(response)
        }
    },
    successfulAuth: (userData) => {
        App.clear()
        console.log('Successful Auth')
        let localUsersData = JSON.parse(localStorage.getItem('localUsers'))
        if (Array.isArray(localUsersData)) {
            const thisUserLocalIndex = localUsersData.findIndex(user => user.id == userData.id)
            if (thisUserLocalIndex !== -1) {
                localUsersData[thisUserLocalIndex] = userData
            } else localUsersData.push(userData) 
        } else localUsersData = [userData]
        localStorage.setItem('localUsers', JSON.stringify(localUsersData))
        localUsersData = JSON.parse(localStorage.getItem('localUsers'))
        console.log(localUsersData)
    }
}
export default Auth

const templates = {
    signIn: html`
        <div id="signIn">
            <div class="authBlock">
                <label class="authHeadLbl">Sign In</label>
                <label class="errorOutputLbl"></label>
                <input id="loginInp" placeholder="Login">
                <input id="passwordInp" placeholder="Password" type="password">
                <button class="helpBtn" id="passwordResettingBtn">I forgot my password</button>
                <div class="btnsDiv">
                    <button class="leftBtn" id="signUpBtn">Sign Up</button>
                    <button class="rightBtn" id="signInBtn">Sign In</button>
                </div>
            </div>
        </div>
    `,
    signUp: html`
        <div id="signUp">
            <div class="authBlock">
                <label class="authHeadLbl">Sign Up</label>
                <label class="errorOutputLbl"></label>
                <input id="loginInp" placeholder="Login">
                <input id="emailInp" placeholder="Email">
                <input id="passwordInp" placeholder="Password" type="password">
                <div class="btnsDiv">
                    <button class="leftBtn" id="signInBtn">Sign In</button>
                    <button class="rightBtn" id="signUpBtn">Sign Up</button>
                </div>
            </div>
        </div>
    `,
    emailVerifying: html`
        <div id="emailVerifying">
            <div class="authBlock">
                <label class="authHeadLbl">Verify Email</label>
                <label class="errorOutputLbl"></label>
                <input id="codeInp" placeholder="Code">
                <button class="helpBtn" id="getVerifyingMsgBtn">I can't get message</button>
                <div class="btnsDiv">
                    <button class="leftBtn" id="skipBtn">Skip</button>
                    <button class="rightBtn" id="aproveBtn">Aprove</button>
                </div>
            </div>
        </div>
    `,
    resettingPassword: html`
        <div id="resettingPassword">
            <div class="authBlock">
                <label class="authHeadLbl">Password Reset</label>
                <label class="errorOutputLbl"></label>
                <input id="newPasswordInp" placeholder="New Password" type="password">
                <input id="codeInp" placeholder="Code">
                <button class="helpBtn" id="getVerifyingMsgBtn">I can't get message</button>
                <div class="btnsDiv">
                    <button class="leftBtn" id="cancelBtn">Cancel</button>
                    <button class="rightBtn" id="aproveBtn">Aprove</button>
                </div>
            </div>
        </div>
    `
}
const styles = {
    id: {
        signIn: {
            background: 'black',
            width: '100vw',
            height: '100vh',
            display: 'grid',
            'place-items': 'center'
        },
        signUp: {
            background: 'black',
            width: '100vw',
            height: '100vh',
            display: 'grid',
            'place-items': 'center'
        },
        resettingPassword: {
            background: 'black',
            width: '100vw',
            height: '100vh',
            display: 'grid',
            'place-items': 'center'
        },
        emailVerifying: {
            background: 'black',
            width: '100vw',
            height: '100vh',
            display: 'grid',
            'place-items': 'center'
        }
    },
    class: {
        authBlock: {
            width: '350px',
            height: '450px',
            border: '2px solid #FFA8A8',
            display: 'grid',
            'place-items': 'center',
            'border-radius': '10px'
        },
        authHeadLbl: {
            color: '#FFA8A8',
            'margin-top': '20px',
            'font-size': '32px'
        },
        errorOutputLbl: {
            color: '#FF6969',
            width: '95%',
            height: '20px', 
            'text-align': 'center'
        },
        helpBtn: {
            background: '#333333',
            color: 'black',
            width: '250px',
            height: '30px',
            'margin-top': '10px'
        },
        btnsDiv: {
            display: 'flex',
            width: '90%',
            'justify-content': 'space-around',
            'margin-bottom': '20px'
        },
        leftBtn: {
            background: 'none',
            border: '2px solid #FFA8A8',
            color: '#FFA8A8',
            width: '100px',
            height: '30px',
            'font-size': '16px'
        },
        rightBtn: {
            background: '#FFA8A8',
            color: 'black',
            width: '100px',
            height: '30px',
            'font-size': '16px'
        }
    },
    tag: {
        input: {
            background: 'none',
            border: 'none',
            'border-bottom': '2px solid #333333',
            width: '250px',
            height: '30px',
            color: '#FFA8A8',
            'padding-top': '10px',
            'font-size': '20px',
            'border-radius': '10px'
        },
        button: {
            'border-radius': '10px'
        }
    }
}