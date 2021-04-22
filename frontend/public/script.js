const socket = io()
const chat = document.querySelector('.chat-form')
const client = document.querySelector('.user-form')
const clientIndex = document.querySelector('.index-user-form')
const loginPage = document.querySelector('.login-page')
const buttons = document.querySelector('.buttons')
const userDisconnect = document.querySelector('.user-disconnect')
const InputUser = document.querySelector('.user-input')
const Input = document.querySelector('.chat-input')
const chatWindow = document.querySelector('.chat-window')
const userList = document.querySelector('.user-list')
const channel = document.querySelector('.channels')
const roomNameClass = document.querySelector('.room')
const loginForm = document.querySelector('#login-form')


var chatRoom = ''
var localUser = ''
var allowLogin = 0
var users = {
    lobby: [],
    general: [],
    math: [],
    science: [],
    history: [],
    literature: []
}
var previousRoom = ''
var chatRoomList = ["General", "Math", "Science", "History", "Literature"]
var runOnce = 1
var canChat = true
var usernameInUse = false

var time = new Date();
let timeString = ''

function usernameError(typeOfError) {
    const errorMessage = document.createElement('p')
    errorMessage.classList.add("error-message")
    loginPage.removeChild(loginPage.lastChild)
    if (typeOfError == "username too long") {
        errorMessage.innerHTML = "Please enter a username under 30 charaters"
    }
    if (typeOfError == "username in use") {
        errorMessage.innerHTML = "This username is in use please use a different one"
    }
    if (typeOfError == "clear errors") {
        if (loginPage.lastChild.innerHTML == "This username is in use please use a different one" || loginPage.lastChild.innerHTML == "Please enter a username under 30 charaters")
            loginPage.removeChild(loginPage.lastChild)
    }
    loginPage.appendChild(errorMessage)
}

function renderRoomButtons() {
    const div = document.createElement('div')
    div.classList.add("channels-login")
    chatRoomList.forEach(element => {
        var button = document.createElement('button')
        button.innerHTML = element
        button.classList.add("chat-room")
        button.setAttribute('value', element)
        button.setAttribute('name', element)
        div.appendChild(button)
    })
    buttons.appendChild(div)
    loginForm.style.borderBottomLeftRadius = "0px"
    loginForm.style.borderBottomRightRadius = "0px"
}

function renderJoinButton(room) {
    buttons.innerHTML = ''
    const joinButton = document.createElement('button')
    const joinAnchor = document.createElement('a')
    joinButton.innerHTML = "join"
    joinButton.classList.add("user-submit")
    joinButton.setAttribute('id', 'join')
    joinAnchor.setAttribute('href', room)
    joinAnchor.appendChild(joinButton)
    loginPage.appendChild(joinAnchor)
    loginForm.style.borderRadius = "10px"
}

function currentTime() {
    var time = new Date();
    var hour = Math.abs(time.getHours() - 12)
    var minute = time.getMinutes()
    if (hour == 0)
        hour = 12
    if (minute < 10)
        timeString = hour + ":0" + minute
    else
        timeString = hour + ":" + minute
}


function renderMessage(message, user, roomName) {
    if (roomNameClass.innerHTML == roomName) {
        const div = document.createElement('div')
        div.classList.add('render-message')
        div.innerText = user + " : " + message
        chatWindow.appendChild(div)

        currentTime()
        const timeDiv = document.createElement('div')
        timeDiv.classList.add('time')
        timeDiv.innerText = timeString
        chatWindow.appendChild(timeDiv)

        socket.emit('messageToDatabase', message, user, roomName, timeString, localUser)
    }
}

function renderMessageFromDatabase(messages, roomname) {
    if (roomNameClass.innerHTML == roomname && messages) {
        for (let i = 0; i < messages.length; i++) {
            const div = document.createElement('div')
            div.classList.add('render-message')
            div.innerText = messages[i].user + " : " + messages[i].message
            chatWindow.appendChild(div)

            timeString = messages[0].time
            const timeDiv = document.createElement('div')
            timeDiv.classList.add('time')
            timeDiv.innerText = timeString
            chatWindow.appendChild(timeDiv)
        }
    }
}

function getUsers() {
    socket.emit('getUsers')
    return users
}

function updateUsers(userList) {

    users = userList
}

function renderConnected(user, roomName, boolean) {
    if (roomNameClass.innerHTML && roomNameClass.innerHTML == roomName) {
        chatRoom = roomName
        getUsers()
        let array = users[chatRoom]
        let index = array.length - 1
        if (boolean) {
            const div = document.createElement('div')
            div.classList.add('render-message')
            div.innerText = "System: " + users[chatRoom][index] + " has connected to chat " + chatRoom
            chatWindow.appendChild(div)

            currentTime()
            const timeDiv = document.createElement('div')
            timeDiv.classList.add('time')
            timeDiv.innerText = timeString
            chatWindow.appendChild(timeDiv)
        }
        userList.innerHTML = ''
        users[chatRoom].forEach(element => {
            let userListDiv = document.createElement('div')
            userListDiv.classList.add('users')
            userListDiv.innerText = element
            userList.appendChild(userListDiv)
        })
    }
}

if (clientIndex) {
    clientIndex.addEventListener('submit', event => {
        event.preventDefault();
        socket.emit('checkIfUsernameIsTaken', InputUser.value)
        socket.on('usernameIsTaken', function() {
            usernameError("username in use")
        })
        socket.on('usernameIsNotTaken', function() {
            usernameInUse = false

            if (allowLogin != 1) {
                if (InputUser.value) {
                    if (InputUser.value.length < 30 && !usernameInUse) {
                        localUser = InputUser.value
                        allowLogin++
                        renderRoomButtons()
                        usernameError("clear errors")
                        canChat = true
                    }
                    if (usernameInUse) {
                        usernameError("username in use")
                    }
                    if (InputUser.value.length > 30) {
                        InputUser.value = ''
                        usernameError("username too long")
                    }
                }
            }
        })
    })
}

if (client) {
    client.addEventListener('submit', event => {
        event.preventDefault();
        if (allowLogin != 1) {
            if (InputUser.value) {
                if (InputUser.value.length < 30) {
                    localUser = InputUser.value
                    socket.emit('clientIndex', InputUser.value, chatRoom)
                    InputUser.value = ''
                    allowLogin++
                }
            }
        }
    })
}

if (userDisconnect) {
    userDisconnect.addEventListener('click', event => {
        event.preventDefault();
        allowLogin--
        socket.emit('end', localUser, roomNameClass.innerHTML);
    })
}

if (chat) {
    chat.addEventListener('submit', event => {
        event.preventDefault();
        let msg = Input.value

        if (msg && users[roomNameClass.innerHTML].includes(localUser)) {
            socket.emit('chat', Input.value, localUser, roomNameClass.innerHTML)
            Input.value = ''
        }
    })
}

if (buttons) {
    buttons.addEventListener('click', event => {
        chatRoom = event.target.value
        chatRoom = chatRoom.toLocaleLowerCase();
        renderJoinButton(chatRoom)
        socket.emit('clientIndexFirstLogin', localUser, chatRoom)
    })
}

if (channel) {
    channel.addEventListener('click', event => {
        previousRoom = chatRoom
        chatRoom = event.target.value
        socket.emit('clientIndexFirstLogin', localUser, chatRoom)
    })
}

window.addEventListener('load', (event) => {
    if (chat) {
        chatRoom = roomNameClass.innerHTML.toLowerCase();
        socket.emit('getMessagesFromDB', chatRoom)
        socket.emit('updateUsersToIndex', true)
        socket.emit('roomChanged', localUser, chatRoom)
    }
});

socket.on('clientScript', (client, roomName) => {
    users[roomName].push(client)
    renderConnected(client, roomName, true)
})

socket.on('allowLogin', function() {
    allowLogin--
})

socket.on('userListUpdate', users => {
    socket.emit('updateUsersToIndex', false)
})


socket.on('chat', (message, user, roomName) => {
    renderMessage(message, user, roomName)
})

socket.on('renderMessagesFromDB', (messageArray, roomname) => {
    renderMessageFromDatabase(messageArray.messages[roomname], roomname)
})

socket.on('clear', function() {
    userList.removeChild(userList.firstChild);
    socket.emit('updateUsersToIndex', false)
    socket.emit('roomChanged')
    canChat = false
})

socket.on('disconnectMessage', (user, roomName) => {
    if (roomNameClass.innerHTML == roomName) {
        const disconnectedDiv = document.createElement('div')
        disconnectedDiv.classList.add('render-message')
        disconnectedDiv.innerText = "System: " + user + " has disconnected from " + roomNameClass.innerHTML
        chatWindow.appendChild(disconnectedDiv)
        currentTime()
        const timeDiv = document.createElement('div')
        timeDiv.classList.add('time')
        timeDiv.innerText = timeString
        chatWindow.appendChild(timeDiv)
    }
    renderConnected("user", roomNameClass.innerHTML, false)
})

socket.on('updateUsersToScript', (userList, fromFunction) => {
    users = userList
    if (fromFunction) {
        renderConnected(users[chatRoom], chatRoom, true)
    } else {
        renderConnected(users[chatRoom], chatRoom, false)
    }
})

socket.on('runFunctionToGetUsers', (users) => {
    if (runOnce && chat) {
        let array = users[chatRoom]
        let index = array.length - 1
        localUser = users[chatRoom][index]
        runOnce--
    }
    updateUsers(users)
})