const socket = io()
let userName = getURLParameter('name');

const nameElement = document.getElementById('name')
nameElement.value = userName

const messages = document.getElementById('message-list')
const form = document.getElementById('message-form')
const fileInput = document.getElementById('fileInput')
const input = document.getElementById('message')

// ==================== Utilities ==================== //

function getURLParameter(name) {
  name = name.replace(/[\[\]]/g, "\\$&")
  const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)")
  const results = regex.exec(window.location.search)
  if (!results) return null
  if (!results[2]) return ''
  return decodeURIComponent(results[2].replace(/\+/g, " "))
}


// ==================== Socket Emmiters ==================== //
const sendMessage = (message) => {
  socket.emit('action:client:send:message', message)
}

const sendTextMessage = (data) => {
  const message = {
    type: "TEXT",
    data
  }
  sendMessage(message)
}

const sendFileMessage = (data) => {
  const message = {
    type: "FILE",
    data
  }
  sendMessage(message)
}

// ==================== Socket Handlers ==================== //

socket.emit('action:client:set:name', userName)

socket.on('action:server:new:message', (message) => {
  const { sender, type, data, date } = message
  const { id, name } = sender

  const containerElement = document.createElement('li')
  if(name === userName) {
    containerElement.className = "me"
  }
  
  const leftContentElement = document.createElement('div')
  
  const userNameElement = document.createElement('span')
  userNameElement.innerText = name
  
  const messageDataElement = document.createElement('p')
  
  const timeElement = document.createElement('time')
  
  const options = { hour: '2-digit', minute: '2-digit' }
  timeElement.innerText = new Date(date).toLocaleTimeString({}, options)

  containerElement.appendChild(leftContentElement)
  containerElement.appendChild(timeElement)

  leftContentElement.appendChild(userNameElement)
  leftContentElement.appendChild(messageDataElement)


  if(type === "FILE") {
    const img = document.createElement('img')
    img.src = data
    messageDataElement.appendChild(img)
  } else {
    messageDataElement.textContent = data
  }

  messages.appendChild(containerElement)
})

// ==================== UI Handlers ==================== //
form.addEventListener('submit', (e) => {
  e.preventDefault()
  const data = input.value
  sendTextMessage(data)

  input.value = ''
})

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0]
  const reader = new FileReader()
  reader.onload = (event) => {
    sendFileMessage(event.target.result)
  }
  reader.readAsDataURL(file)
})
