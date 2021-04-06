const express = require('express')
const app = express()
const server = require('http').createServer(app)
const port = process.env.PORT || 3000
const io = require('socket.io')(server)
const path = require('path')

const users = []

//app.use(express.static(path.join(__dirname, '../public')))
app.use(express.static(path.join(__dirname, '../frontend/public')));

io.on('connection', socket => {

    socket.join('General')

    socket.on('client', client => {
        if (!users.includes(client)) {
            console.log("user", client, "connected")
            users.push(client)
            console.log(users)
            io.emit('client', client)
        } else
            io.emit('allowLogin')
    })

    socket.on('chat', (message, user) => {
        if (users.includes(user)) {
            console.log("message sent: ", message, "from", user)
            io.emit('chat', message, user)
        }
    })

    socket.on('chatDisconnect', (message, user) => {
        console.log("disconnected:::", user)
        io.emit('chat', message, user)
    })

    socket.on('end', (user) => {
        if (users.includes(user)) {
            users.splice(users.indexOf(user), 1);
            console.log(user)
            io.emit('disconnectMessage', user)
            io.emit('clear', user)
            for (let i = 0; i < users.length; i++) {
                io.emit('userListUpdate', users[i])
            }
        }
    });

    socket.on('changeRoom', (roomName) => {
        socket.join(roomName)
    })

    //socket.on('change')
})

server.listen(port, () => {
    console.log(`Server running on port: ${port}`)
})