const express = require('express')
const app = express()
const server = require('http').createServer(app)
const port = process.env.PORT || 3000
const io = require('socket.io')(server)
const path = require('path')

app.use(express.static(path.join(__dirname + '/public')))

io.on('connection', socket => {

    socket.on('client', client => {
        console.log("user", client, "connected")
        io.emit('client', client)
    })

    socket.on('chat', (message, user) => {
        console.log("message sent: ", message, "from", user)
        io.emit('chat', message, user)
    })
})

server.listen(port, () => {
    console.log(`Server running on port: ${port}`)
})