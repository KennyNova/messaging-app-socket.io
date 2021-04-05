const socket = io()
const chat = document.querySelector('.chat-form')
const client = document.querySelector('.user-form')
const InputUser = document.querySelector('.user-input')
const Input = document.querySelector('.chat-input')
const chatWindow = document.querySelector('.chat-window')

var localUser = ''

var time = new Date();
var timeString = ''

function currentTime() {
    var hour = Math.abs(time.getHours() - 12)
    var minute = time.getMinutes()
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
    var div = document.createElement('div')
    div.classList.add('render-message')
    div.innerText = "User: " + user + " has connected to chat"
    chatWindow.appendChild(div)

    const timeDiv = document.createElement('div')
    timeDiv.classList.add('time')
    timeDiv.innerText = timeString
    chatWindow.appendChild(timeDiv)
}

client.addEventListener('submit', event => {
    event.preventDefault();
    if (InputUser.value) {
        localUser = InputUser.value
        socket.emit('client', InputUser.value)
        InputUser.value = ''
    }
})

chat.addEventListener('submit', event => {
    event.preventDefault();
    if (Input.value && localUser) {
        socket.emit('chat', Input.value, localUser)
        Input.value = ''
    }
})

socket.on('client', client => {
    console.log('From client: ', client)
    currentTime()
    renderConnected(client)
})

socket.on('chat', (message, user) => {
    console.log('From server: ', message)
    renderMessage(message, user)
})