// require('dotenv').config()
const express = require('express')
const app = express()
const server = require('http').createServer(app)
const port = process.env.BACKEND_PORT || 3000
const io = require('socket.io')(server)
const path = require('path')
const db = require('./queries')
const Pool = require('pg').Pool
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
})

console.log(process.env.BACKEND_PORT + "18")

var roomNameVar = 'general'
var previousRoom = ''
const users = {
    general: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'q', 'w', 'e', 'r', 't', 'y', '21'],
    math: [],
    science: [],
    history: [],
    literature: []
}
const messages = {
    general: [],
    math: [],
    science: [],
    history: [],
    literature: []
}
const roomNameArray = [
    "general",
    "math",
    "science",
    "history",
    "literature"
]

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

app.put('/cleardatabase', db.clearDatabase)

app.put('/messages/:roomname', db.updateMessagesAtRoomName)

app.delete('/:roomname', db.deleteRoomName)


io.on('connection', socket => {

    socket.on('clientIndexFirstLogin', (client, roomName) => {
        var roomNameVar = roomName.toLowerCase();
        if (!users[roomNameVar].includes(client)) {
            roomNameArray.forEach(element => {
                if (users[element].includes(client)) {
                    previousRoom = element
                    let index = users[element].indexOf(client)
                    users[element].splice(index, 1)
                    io.emit('updateUsersToScript', users, false)
                }
            })
            users[roomNameVar].push(client)
            let array = users[roomNameVar]
            let index = array.length - 1
            io.emit('clientScript', users[roomNameVar][index], roomName)

            pool.query('UPDATE socketchat SET users = $1 WHERE roomname = $2', [JSON.stringify(users[roomNameVar]), roomNameVar],
                (error, results) => {
                    if (error) {
                        throw error
                    }
                }
            )
            pool.query('UPDATE socketchat SET users = $1 WHERE roomname = $2', [JSON.stringify(users[previousRoom]), previousRoom],
                (error, results) => {
                    if (error) {
                        throw error
                    }
                }
            )
            pool.query('SELECT users FROM socketchat', (error, results) => {
                if (error) {
                    throw error
                }
            })


        } else
            io.emit('allowLogin')
    })

    socket.on('clientIndex', (client, roomName) => {
        if (!users[roomNameVar].includes(client)) {
            users[roomName].push(client)
            io.emit('clientScript', client, roomName)
        } else
            io.emit('allowLogin')
    })

    socket.on('chat', (message, user, roomName) => {
        roomNameVar = roomName
        io.emit('chat', message, user, roomNameVar)
        io.emit('updateScroll')
    })

    socket.on('messageToDatabase', (message, user, roomName, time, localUser) => {
        if (localUser == user) {
            roomname = roomName
            messageData = {
                "message": message,
                "user": user,
                "time": time
            }
            if (messageData) {
                messages[roomname].push(messageData)
            }
            pool.query(
                'UPDATE socketchat SET messages = $1 WHERE roomname = $2', [messages, roomname],
                (error, results) => {
                    if (error) {
                        throw error
                    }
                }
            )
        }
    })

    socket.on('getMessagesFromDB', (roomName) => {
        roomname = roomName

        pool.query('SELECT messages FROM socketchat WHERE roomname = $1', [roomname], (error, results) => {
            if (error) {
                throw error
            }
            socket.emit('renderMessagesFromDB', results.rows[0], roomname)
        })
    })

    socket.on('chatDisconnect', (message, user) => {
        io.emit('chat', message, user)
        io.emit('updateScroll')
    })

    socket.on('end', (user, roomName) => {
        roomNameVar = roomName
        if (users[roomNameVar].includes(user)) {
            users[roomNameVar].splice(users[roomNameVar].indexOf(user), 1);
            io.emit('disconnectMessage', user, roomNameVar)
            io.emit('clear')
            pool.query('UPDATE socketchat SET users = $1 WHERE roomname = $2', [JSON.stringify(users[roomNameVar]), roomNameVar],
                (error, results) => {
                    if (error) {
                        throw error
                    }
                })
        }
        io.emit('updateScroll')
    });

    socket.on('roomChanged', (user, roomName) => {
        socket.emit('userListUpdate', users)
    })

    socket.on('updateUsersToIndex', (fromFunction) => {
        socket.emit('updateUsersToScript', users, fromFunction)
    })

    socket.on('getUsers', function() {
        socket.emit('runFunctionToGetUsers', users)
    })

    socket.on('checkIfUsernameIsTaken', (user) => {
        let usernameIsTaken = false
        roomNameArray.forEach(element => {
            if (users[element].includes(user)) {
                usernameIsTaken = true
            }
        })
        if (usernameIsTaken) {
            io.emit('usernameIsTaken')
        } else {
            io.emit('usernameIsNotTaken')
        }
    })

})

server.listen(port, () => {
    console.log(`Server running on port: ${port}`)
})