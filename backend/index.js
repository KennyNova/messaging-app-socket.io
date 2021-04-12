const express = require('express')
const app = express()
const server = require('http').createServer(app)
const port = process.env.PORT || 3000
const io = require('socket.io')(server)
const path = require('path')
const db = require('./queries')


var roomNameVar = 'general'
const users = {
    lobby: [],
    general: [],
    math: [],
    science: [],
    history: [],
    literature: []
}

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.use(express.static(path.join(__dirname, '../frontend/public')));

app.get('/general', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public/general.html'));
})

app.get('/math', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public/math.html'));
})

app.get('/science', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public/science.html'));
})

app.get('/history', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public/history.html'));
})

app.get('/literature', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public/literature.html'));
})

app.get('/', (request, response) => {
    response.json({ info: 'Node.js, Express, and Postgress API' })
})

app.get('/users', db.getUsers)

app.get('/users/:roomname', db.getUsersFromRoomName)

app.get('/roomname', db.getRoomNames)

app.get('/messages/:roomname', db.getMessagesFromRoomName)

app.post('/roomname', db.createRoom)

app.put('/users/:roomname', db.updateUsersAtRoomName)


io.on('connection', socket => {

    socket.on('clientIndexFirstLogin', (client, roomName) => {
        var roomNameVar = roomName.toLowerCase();
        if (!users[roomNameVar].includes(client)) {
            users[roomNameVar].push(client)
            let array = users[roomNameVar]
            let index = array.length - 1
            console.log(users[roomNameVar][index])
            io.emit('clientScript', users[roomNameVar][index], roomName)
        } else
            io.emit('allowLogin')
    })

    socket.on('clientIndex', (client, roomName) => {

        if (!users[roomNameVar].includes(client)) {
            console.log("user", client, "connected to room", roomName)
            users.lobby.push(client)
            io.emit('clientScript', client, roomName)
        } else
            io.emit('allowLogin')
    })

    socket.on('chat', (message, user, roomName) => {
        roomNameVar = roomName
        io.emit('chat', message, user, roomNameVar)
    })

    socket.on('chatDisconnect', (message, user) => {
        console.log("disconnected:::", user)
        io.emit('chat', message, user)
    })

    socket.on('end', (user, roomName) => {
        roomNameVar = roomName
        if (users[roomNameVar].includes(user)) {
            users[roomNameVar].splice(users[roomNameVar].indexOf(user), 1);
            io.emit('disconnectMessage', user, roomNameVar)
            io.emit('clear', user)

            // for (let i = 0; i < users[roomNameVar].length; i++) {
            //     io.emit('userListUpdate', users[i])
            // }
        }
    });

    socket.on('changeRoom', (roomName, user) => {
        let index = users[roomNameVar].indexOf(user)
        users[roomName].push(user)
        users[roomNameVar].splice(index, 1)
        roomNameVar = roomName
        socket.emit('clientScript', user)

    })

    socket.on('roomChanged', function() {
        socket.emit('userListUpdate', users)
    })

    socket.on('updateUsersToIndex', (fromFunction) => {
        socket.emit('updateUsersToScript', users, fromFunction)
    })

    socket.on('getUsers', function() {
        socket.emit('runFunctionToGetUsers', users)
    })

})

server.listen(port, () => {
    console.log(`Server running on port: ${port}`)
})