const socket = io()
const chat = document.querySelector('.chat-form')
const client = document.querySelector('.user-form')
const userDisconnect = document.querySelector('.user-disconnect')
const InputUser = document.querySelector('.user-input')
const Input = document.querySelector('.chat-input')
const chatWindow = document.querySelector('.chat-window')
const userList = document.querySelector('.user-list')
const channel = document.querySelector('.channels')
const chatRoom = 'General'

var localUser = ''
var allowLogin = 0

var time = new Date();
var timeString = ''

function currentTime() {
    var hour = Math.abs(time.getHours() - 12)
    var minute = time.getMinutes()
    if (hour == 0)
        hour = 12
    if (minute < 10)
        timeString = hour + ":0" + minute
    else
        timeString = hour + ":" + minute
}

const renderMessage = (message, user) => {
    const div = document.createElement('div')
    div.classList.add('render-message')
    div.innerText = user + " : " + message
    chatWindow.appendChild(div)

    const timeDiv = document.createElement('div')
    timeDiv.classList.add('time')
    timeDiv.innerText = timeString
    chatWindow.appendChild(timeDiv)
}

const renderConnected = (user) => {
    const div = document.createElement('div')
    div.classList.add('render-message')
    div.innerText = "System: " + user + " has connected to chat"
    chatWindow.appendChild(div)

    const timeDiv = document.createElement('div')
    timeDiv.classList.add('time')
    timeDiv.innerText = timeString
    chatWindow.appendChild(timeDiv)

    const userListDiv = document.createElement('div')
    userListDiv.classList.add('users')
    userListDiv.innerText = user
    userList.appendChild(userListDiv)
}

client.addEventListener('submit', event => {
    event.preventDefault();
    if (allowLogin != 1) {
        if (InputUser.value) {
            localUser = InputUser.value
            socket.emit('client', InputUser.value)
            InputUser.value = ''
            allowLogin++
        }
    }
})

userDisconnect.addEventListener('click', event => {
    event.preventDefault();
    console.log("disconnected")
    allowLogin--
    socket.emit('end', localUser);
})

chat.addEventListener('submit', event => {
    event.preventDefault();
    if (Input.value && localUser) {
        socket.emit('chat', Input.value, localUser)
        Input.value = ''
    }
})

channel.addEventListener('click', event => {
    console.log(event.target.value)
    chatRoom = event.target.value
    socket.emit('changeRoom', event.target.value)
})

socket.on('client', client => {
    console.log('From client: ', client)
    currentTime()
    renderConnected(client)
})

socket.on('allowLogin', function() {
    allowLogin--
})

socket.on('userListUpdate', client => {
    const userListDiv = document.createElement('div')
    userListDiv.classList.add('users')
    userListDiv.innerText = client
    userList.appendChild(userListDiv)
})

socket.on('chat', (message, user) => {
    console.log('From server: ', message)
    renderMessage(message, user)
})

socket.on('clear', function() {
    while (userList.firstChild) {
        userList.removeChild(userList.firstChild);
    }
    console.log("removed")
})

socket.on('disconnectMessage', (user) => {
    const disconnectedDiv = document.createElement('div')
    disconnectedDiv.classList.add('render-message')
    disconnectedDiv.innerText = "System: " + user + " has disconnected"
    chatWindow.appendChild(disconnectedDiv)
    const timeDiv = document.createElement('div')
    timeDiv.classList.add('time')
    timeDiv.innerText = timeString
    chatWindow.appendChild(timeDiv)
})