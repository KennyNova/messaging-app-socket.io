const Pool = require('pg').Pool
const pool = new Pool({
    user: 'me',
    host: 'localhost',
    database: 'chat',
    password: 'password',
    port: 5432,
})

const getUsers = (request, response) => {
    pool.query('SELECT users FROM socketchat', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getUsersFromRoomName = (request, response) => {
    const roomname = request.params.roomname

    pool.query('SELECT users FROM socketchat WHERE roomname = $1', [roomname], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getRoomNames = (request, response) => {
    pool.query('SELECT roomname FROM socketchat', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getMessagesFromRoomName = (request, response) => {
    const roomname = request.params.roomname

    pool.query('SELECT messages FROM socketchat WHERE roomname = $1', [roomname], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const createRoom = (request, response) => {
    const { roomname } = request.body

    pool.query('INSERT INTO socketchat (roomname) VALUES ($1)', [roomname], (error, results) => {
        if (error) {
            throw error
        }
        response.status(201).json(request.body)
    })
}

const updateUsersAtRoomName = (request, response) => {
    const roomname = request.params.roomname
    const { users } = request.body

    pool.query(
        'UPDATE socketchat SET users = $1 WHERE roomname = $2', [users, roomname],
        (error, results) => {
            if (error) {
                throw error
            }
            //response.status(200).send(`User modified with ID: ${id}`)
            response.status(200).send(request.body)
        }
    )
}

const updateMessagesAtRoomName = (request, response) => {
    const roomname = request.params.roomname
    const { messages } = request.body

    pool.query(
        'UPDATE socketchat SET messages = $1 WHERE roomname = $2', [messages, roomname],
        (error, results) => {
            if (error) {
                throw error
            }
            //response.status(200).send(`User modified with ID: ${id}`)
            response.status(200).send(request.body)
        }
    )
}

const deleteRoomName = (request, response) => {
    const roomname = request.params.roomname
    console.log(roomname)
    pool.query('DELETE FROM socketchat WHERE roomname = $1', [roomname], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(request.body)
            //response.status(200).send(`User deleted with ID: ${id}`)
    })
}

module.exports = {
    getUsers,
    getUsersFromRoomName,
    getRoomNames,
    getMessagesFromRoomName,
    createRoom,
    updateUsersAtRoomName,
    updateMessagesAtRoomName,
    deleteRoomName,
}