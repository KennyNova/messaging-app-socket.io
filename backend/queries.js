const Pool = require('pg').Pool
    // const pool = new Pool({
    //     user: process.env.DB_USER,
    //     host: process.env.DB_HOST,
    //     database: process.env.DB_NAME,
    //     password: process.env.DB_PASSWORD,
    //     port: process.env.DB_PORT,
    // })
    // const pool = new Pool({
    //     host: 'app-053d667a-6d8d-4052-831e-2ac1ffac3396-do-user-9167963-0.b.db.ondigitalocean.com',
    //     port: 25060,
    //     username: "db",
    //     password: "th5hc45c5zkltcy6",
    //     database: "db",
    //     sslmode: require,
    // })
const pgURL = `postgres://db:th5hc45c5zkltcy6@app-053d667a-6d8d-4052-831e-2ac1ffac3396-do-user-9167963-0.b.db.ondigitalocean.com:25060/db`;
const pool = new Pool({
    connectionString: pgURL
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

const clearDatabase = (request, response) => {
    const users = {}
    const messages = {}
    const roomname = ["general", "math", "history", "science", "literature"]

    for (let i = 0; i != 5; i++) {
        pool.query(
            'UPDATE socketchat SET users = $1, messages = $2 WHERE roomname = $3', [users, messages, roomname[i]],
            (error, results) => {
                if (error) {
                    throw error
                }
                //response.status(200).send(`User modified with ID: ${id}`)
                //response.status(200).send(request.body)
            }
        )
    }
    response.status(200).send(request.body)
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
    clearDatabase,
}