import express from 'express'
import http from 'http'
import socketio from 'socket.io'
import createGame from './public/game.js'
import cors from 'cors'

const app = express()
const server = http.createServer(app)
const sockets = socketio(server)


app.use(cors())
app.use(express.static('public'))

const game = createGame()
game.start()

game.subscribe((command)=>{
    console.log(`> Emitting ${command.type}`)
    sockets.emit(command.type, command)
})

sockets.on('connection', (socket) => {
    const playerId = socket.id
    console.log(`> Player connected: ${playerId}`)

    game.addPlayer({ playerId: playerId})
    // console.log(game.state)

    socket.emit('setup', game.state)

    socket.on('disconnect', () => {
        game.removePlayer({ playerId: playerId})
        console.log(`> Player disconnected: ${ playerId }`)
    })

    socket.on('move-player', (command)=>{
        command.playerId = playerId
        command.type = 'move-player'
        game.movePlayer(command)

    })

    socket.on('valueSecond', (val) => {
        console.log(val)
    })
})

server.listen(process.env.PORT || 5000, () => {
    console.log(`Server listening on port 3000`)
})
