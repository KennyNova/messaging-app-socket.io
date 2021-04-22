//const { json } = require("express")
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

var time = new Date();
let timeString = ''

function renderRoomButtons() {
    const div = document.createElement('div')
    div.classList.add("channels")
        //const button = document.createElement('button')
    chatRoomList.forEach(element => {
        var button = document.createElement('button')
        button.innerHTML = element
        button.classList.add("chat-room")
        button.setAttribute('value', element)
        button.setAttribute('name', element)
        div.appendChild(button)
    })
    buttons.appendChild(div)
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

        console.log("thisrannnn")
        console.log(localUser)
        socket.emit('messageToDatabase', message, user, roomName, timeString, localUser)
    }
}

function renderMessageFromDatabase(messages, roomname) {
    if (roomNameClass.innerHTML == roomname && messages) {
        console.log(JSON.stringify(messages))
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
        console.log(JSON.stringify(users))
        let array = users[chatRoom]
        let index = array.length - 1
        console.log(array)
        console.log(user)
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
        if (allowLogin != 1) {
            if (InputUser.value) {
                localUser = InputUser.value
                    //InputUser.value = ''
                allowLogin++
                renderRoomButtons()
                canChat = true
            }
        }
    })
}

if (client) {
    client.addEventListener('submit', event => {
        event.preventDefault();
        if (allowLogin != 1) {
            if (InputUser.value) {
                localUser = InputUser.value
                    //socket.emit('updateUsersToIndex')
                socket.emit('clientIndex', InputUser.value, chatRoom)
                InputUser.value = ''
                allowLogin++
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
        socket.emit('changeRoom', chatRoom, localUser, previousRoom)

        console.log("yoyo")
    })
}

window.addEventListener('load', (event) => {
    console.log("window event listener")
    console.log(localUser)
    if (chat) {
        chatRoom = roomNameClass.innerHTML.toLowerCase();
        socket.emit('getMessagesFromDB', chatRoom)
        socket.emit('updateUsersToIndex', true)
        socket.emit('roomChanged', localUser, chatRoom)
        console.log(localUser)
        console.log(users)
    }
});

socket.on('clientScript', (client, roomName) => {
    console.log(client)
    console.log(users)
    users[roomName].push(client)
    console.log(users)
    renderConnected(client, roomName, true)
})

socket.on('allowLogin', function() {
    allowLogin--
})

socket.on('userListUpdate', users => {
    socket.emit('updateUsersToIndex', false)
    let listOfUsers = users
        //renderConnected(listOfUsers[chatRoom], chatRoom)
})


socket.on('chat', (message, user, roomName) => {
    renderMessage(message, user, roomName)
    console.log("chatmessage ran")
})

socket.on('renderMessagesFromDB', (messageArray, roomname) => {
    console.log(JSON.stringify(messageArray.messages[roomname]))
    renderMessageFromDatabase(messageArray.messages[roomname], roomname)
})

socket.on('clear', user => {
    //while (userList.firstChild) {
    userList.removeChild(userList.firstChild);
    socket.emit('updateUsersToIndex', false)
    socket.emit('roomChanged')
    canChat = false

    // }
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
        console.log("disconnect ran")
    }
    console.log("dis ran out of if")
    renderConnected("user", roomNameClass.innerHTML, false)
})

socket.on('updateUsersToScript', (userList, fromFunction) => {
    users = userList
    console.log(JSON.stringify(userList))
    if (fromFunction) {
        renderConnected(users[chatRoom], chatRoom, true)
    } else {
        renderConnected(users[chatRoom], chatRoom, false)
    }
})

socket.on('runFunctionToGetUsers', (users) => {
    if (runOnce) {
        let array = users[chatRoom]
        let index = array.length - 1
        localUser = users[chatRoom][index]
        runOnce--
    }
    updateUsers(users)
})