const express = require('express')
const app = express()
const server = require('http').createServer(app)
const port = process.env.PORT || 3000
const io = require('socket.io')(server)
const path = require('path')
const db = require('./queries')
const Pool = require('pg').Pool
const pool = new Pool({
    user: 'me',
    host: 'localhost',
    database: 'chat',
    password: 'password',
    port: 5432,
})


var roomNameVar = 'general'
var previousRoom = ''
const users = {
    lobby: [],
    general: [],
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
            console.log(users + "91")
            roomNameArray.forEach(element => {
                if (users[element].includes(client)) {
                    previousRoom = element
                    let index = users[element].indexOf(client)
                    users[element].splice(index, 1)
                    io.emit('updateUsersToScript', users, false)
                        //socket.emit('disconnectMessage', client, element)
                    console.log(JSON.stringify(users) + "103")
                }
            })
            users[roomNameVar].push(client)
            let array = users[roomNameVar]
            let index = array.length - 1
            io.emit('clientScript', users[roomNameVar][index], roomName)

            pool.query('UPDATE socketchat SET users = $1 WHERE roomname = $2', [users[roomNameVar], roomNameVar],
                (error, results) => {
                    if (error) {
                        throw error
                    }
                    //response.status(200).send(`User modified with ID: ${id}`)

                }
            )
            pool.query('UPDATE socketchat SET users = $1 WHERE roomname = $2', [users[previousRoom], previousRoom],
                (error, results) => {
                    if (error) {
                        throw error
                    }
                    //response.status(200).send(`User modified with ID: ${id}`)

                }
            )
            pool.query('SELECT users FROM socketchat', (error, results) => {
                if (error) {
                    throw error
                }
                console.log(JSON.stringify(results.rows) + "109")
            })


        } else
            io.emit('allowLogin')
    })

    socket.on('clientIndex', (client, roomName) => {
        if (!users[roomNameVar].includes(client)) {
            console.log("user", client, "connected to room", roomName + "119")
            users[roomName].push(client)
            io.emit('clientScript', client, roomName)
        } else
            io.emit('allowLogin')
    })

    socket.on('chat', (message, user, roomName) => {
        roomNameVar = roomName
        io.emit('chat', message, user, roomNameVar)
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
            console.log(JSON.stringify(messages))
            pool.query(
                'UPDATE socketchat SET messages = $1 WHERE roomname = $2', [messages, roomname],
                (error, results) => {
                    if (error) {
                        throw error
                    } else
                        console.log("messages sent")
                        //response.status(200).send(`User modified with ID: ${id}`)
                        // response.status(200).send(request.body)
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
            //response.status(200).json(results.rows)
            socket.emit('renderMessagesFromDB', results.rows[0], roomname)
            console.log(JSON.stringify(results.rows) + "321321")
        })
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
            pool.query('UPDATE socketchat SET users = $1 WHERE roomname = $2', [users[roomNameVar], roomNameVar],
                (error, results) => {
                    if (error) {
                        throw error
                    }
                })
        }
    });

    socket.on('changeRoom', (roomName, user, previousRoom) => {
        console.log(user + " 192")
        let index = users[previousRoom].indexOf(user)
        console.log(roomName + previousRoom)
        users[roomName].push(user)
        users[previousRoom].splice(index, 1)
        console.log(users[previousRoom] + "195")
        console.log(JSON.stringify(users) + "195")
            //io.emit('disconnectMessage', user, previousRoom)

        console.log(JSON.stringify(messages) + " SSSS195")
        pool.query('UPDATE socketchat SET users = $1 WHERE roomname = $2', [users[roomName], roomName],
            (error, results) => {
                if (error) {
                    throw error
                }
                //response.status(200).send(`User modified with ID: ${id}`)
            }
        )
        pool.query('UPDATE socketchat SET users = $1 WHERE roomname = $2', [users[previousRoom], previousRoom],
            (error, results) => {
                if (error) {
                    throw error
                }
                //response.status(200).send(`User modified with ID: ${id}`)
            }
        )
        pool.query('SELECT messages FROM socketchat WHERE roomname = $1', [previousRoom], (error, results) => {
            if (error) {
                throw error
            }
            //messages[roomNameVar] = results.rows
            console.log(JSON.stringify(results.rows) + "211")
        })
        console.log(JSON.stringify(messages[previousRoom]) + "hihihi")
        roomNameVar = roomName
            //socket.emit('renderMessagesFromDatabase', )
    })

    socket.on('roomChanged', (user, roomName) => {
        socket.emit('userListUpdate', users)
    })

    socket.on('updateUsersToIndex', (fromFunction) => {
        console.log(JSON.stringify(users) + "234")
        socket.emit('updateUsersToScript', users, fromFunction)
    })

    socket.on('getUsers', function() {
        socket.emit('runFunctionToGetUsers', users)
    })

})

server.listen(port, () => {
    console.log(`Server running on port: ${port}`)
})