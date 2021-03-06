import { writable, get } from 'svelte/store'
import jwt from 'jsonwebtoken'
import ReconnectingWebSocket from 'reconnecting-websocket'

export const selectedRoom = writable()
export const allManifests = writable()

export const wsStore = writable()
export function createConnection(connectionUrl) {
  // TODO: reconnection
  wsStore.set(new ReconnectingWebSocket(connectionUrl))
}

export function onMessage(cb) {
  wsStore.subscribe(ws => {
    if (ws) {
      ws.onopen = async () => {
        sendMessage(requestManifests())
      }
      ws.onclose = () => console.error('connection closed')
      ws.onerror = console.error

      ws.onmessage = ({ data }) => {
        // console.log('client received', authenticate(data))
        cb(ws, authenticate(data))
      }
    }
  })
}
export function sendMessage(data) {
  // console.log('client sending', data)
  const ws = get(wsStore)
  ws.send(sign(data))
}

function sign(message) {
  if (SECRET) {
    return jwt.sign(message, SECRET)
  }
  console.warn(
    'No secret key provided, all communtication will be un-encrypted!'
  )
  return JSON.stringify(message)
}
function authenticate(message) {
  if (SECRET) {
    try {
      return jwt.verify(message, SECRET)
    } catch (e) {
      console.error(
        `received message:
${message}
But coudn't decrypt it with my secret key`
      )
      return null
    }
  }
  console.warn(
    'No secret key provided, all communtication will be un-encrypted!'
  )
  return JSON.parse(message)
}

function requestManifests() {
  return {
    requestManifests: true,
  }
}
