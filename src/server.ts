import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import path from 'path'
import { getMessages, saveBase64File, saveMessages } from './storage'

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static(path.join(__dirname, 'web')))

interface User {
  id: string
  name: string
}

enum MESSAGE_TYPE {
  TEXT = 'TEXT',
  FILE = 'FILE',
}

interface BaseMessage {
  type: MESSAGE_TYPE
  data: string
}

interface ServerMessage extends BaseMessage {
  sender: {
    id: string
    name: string
  }
  date: Date
}

const messagesDir = path.join(__dirname, 'data')

const chat: Array<ServerMessage> = []
const messages = getMessages(messagesDir) as Array<ServerMessage>

messages.forEach((message) => {
  chat.push(message)
})

const sendMessage = (message: ServerMessage) => {
  io.emit('action:server:new:message', message)
  chat.push(message)
  saveMessages(chat, messagesDir)
}

const sendMessageTo = (id: string, message: ServerMessage) => {
  io.to(id).emit('action:server:new:message', message)
}

io.on('connection', (socket) => {
  console.log(`Usuário conectado: ${socket.id}`)

  const user: User = {
    id: socket.id,
    name: socket.id,
  }

  chat.forEach((message) => {
    sendMessageTo(user.id, message)
  })

  socket.on('action:client:set:name', (name: string) => {
    user.name = name
  })

  socket.on('action:client:send:message', (baseMessage: BaseMessage) => {
    const { data, type } = baseMessage

    let message: ServerMessage

    if (type === MESSAGE_TYPE.FILE) {
      console.log(`Mensagem recebida de ${user.name} do tipo ${type}`)
      const baseUploadFilePath = path.join(__dirname, 'web', 'uploads')
      const uploadedFilePath = saveBase64File(data, baseUploadFilePath)
      message = {
        type,
        data: path.join(
          '/uploads',
          path.relative(baseUploadFilePath, uploadedFilePath),
        ),
        sender: user,
        date: new Date(),
      }
    } else {
      console.log(`Mensagem recebida de ${user.name} do tipo ${type}: ${data}`)
      message = {
        type,
        data,
        sender: user,
        date: new Date(),
      }
    }

    sendMessage(message)
  })

  socket.on('disconnect', () => {
    console.log(`Usuário desconectado: ${socket.id}`)
  })
})

server.listen(3000, () => {
  console.log('Servidor rodando na porta 3000')
})
