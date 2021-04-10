const express = require('express')
const app = express()
const server = require('http').createServer(app)
const port = process.env.PORT || 3000
const io = require('socket.io')(server)
const path = require('path')


var roomNameVar = 'general'
const users = {
    lobby: [],
    general: [],
    math: [],
    science: [],
    history: [],
    literature: []
}
console.log(users[roomNameVar].indexOf("hi") + "thfidnsjl")
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

io.on('connection', socket => {

    socket.on('clientIndexFirstLogin', (client, roomName) => {
        var roomNameVar = roomName.toLowerCase();
        console.log(roomNameVar)
        console.log(users[roomNameVar])
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
            console.log(users)
            io.emit('clientScript', client, roomName)
        } else
            io.emit('allowLogin')
    })

    socket.on('chat', (message, user, roomName) => {
        roomNameVar = roomName
        //if (users[roomNameVar].includes(user)) {
            console.log("message sent: ", message, "from", user, "MESSAGE LOG", roomName)
            io.emit('chat', message, user, roomNameVar)
        //}
    })

    socket.on('chatDisconnect', (message, user) => {
        console.log("disconnected:::", user)
        io.emit('chat', message, user)
    })

    socket.on('end', (user, roomName) => {
        roomNameVar = roomName
        console.log(users[roomNameVar] + "HIHIHIHIHI")
        console.log(user)
        if (users[roomNameVar].includes(user)) {
            users[roomNameVar].splice(users[roomNameVar].indexOf(user), 1);
            console.log(users)
            io.emit('disconnectMessage', user, roomNameVar)
            io.emit('clear', user)
            // for (let i = 0; i < users[roomNameVar].length; i++) {
            //     io.emit('userListUpdate', users[i])
            // }
        }
    });

    socket.on('changeRoom', (roomName, user) => {
        console.log("THIS IS ROOM NAME" + roomName)

        console.log(users.general[users.general.indexOf(user)] + "consnsnsnsnsnns")
        console.log(users[roomNameVar][users[roomNameVar].indexOf(user)] + "consnsnsnsnsnns")

        let index = users[roomNameVar].indexOf(user)
        users[roomName].push(user)
        users[roomNameVar].splice(index, 1)
        roomNameVar = roomName
        console.log(users + "AFTER SWITCH")
        socket.emit('clientScript', user)

    })

    socket.on('roomChanged', function() {
        socket.emit('userListUpdate', users)
    })

    socket.on('updateUsersToIndex', (fromFunction) => {
        socket.emit('updateUsersToScript', users, fromFunction)
    })

    socket.on('getUsers', function(){
        socket.emit('runFunctionToGetUsers', users)
    })

})

server.listen(port, () => {
    console.log(`Server running on port: ${port}`)
})