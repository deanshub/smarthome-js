import config from 'config'
import scanner from 'lanscanner'
import http from 'http'
import WebSocket from 'ws'
import logger from '../logger'
import { getMyDevices, getMasterRoom } from './devicesHelper'
import { executeCommand } from '../broadlinkController'
import * as botCommander from '../botCommander'

function generateId(length = 24) {
  let result = ''
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

const PORT = config.REMOTE_COMMANDS_PORT || 13975
if (!config.NAME) {
  logger.warn('device name not configured!')
}
const devices = {}

function getSocket(ip) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://${ip}:${PORT}`)
    ws.on('open', async () => {
      ws.send(JSON.stringify(await getManifest()))
    })
    ws.on('close', reject)
    ws.on('error', reject)
    ws.on('message', data => {
      let message = {}
      try {
        message = JSON.parse(data)
      } catch (e) {
        logger.error('Unknown message received:')
        logger.error(data)
        logger.error(e)
      }
      // console.log(data)
      if (message.manifest) {
        resolve({ ...message.manifest, ws })
      } else if (message.messageIdAnswered) {
        const { messageIdAnswered, result } = message
        publishMessageResult(messageIdAnswered, result)
      } else {
        // TODO: handle errors and acks
        triggerCommand(ws, message)
        // ws.send(ack)
      }
    })
  })
}

export async function scanForDevices() {
  const ips = await scanner.scan('ip')
  for (let i = 0; i < ips.length; i++) {
    try {
      const ws = await getSocket(ips[i])
      devices[ws.name] = ws
    } catch (e) {
      //
    }
  }
  logger.info(Object.keys(devices).join(', '))
  return devices
}

export function createServer() {
  // TODO: allow only internal connections

  const server = http.createServer()
  const wss = new WebSocket.Server({ server })
  wss.on('connection', async ws => {
    ws.on('message', data => {
      // console.log(data)
      const message = JSON.parse(data)
      if (message.manifest) {
        devices[message.manifest.name] = { ...message.manifest, ws }
        // TODO: handle errors and acks
      } else if (message.messageIdAnswered) {
        const { messageIdAnswered, result } = message
        publishMessageResult(messageIdAnswered, result)
      } else {
        triggerCommand(ws, message)
      }
    })
    logger.info('A new connection appeared')
    ws.send(JSON.stringify(await getManifest()))
  })
  server.listen(PORT, scanner.getInternalIP(), () => {
    // TODO: get local IP and present a url
    console.log(
      `Remote command server started on\nws://${scanner.getInternalIP()}:${PORT}/`
    )
  })
  return { server, wss }
}

async function getManifest() {
  const myDevices = await getMyDevices()

  return {
    manifest: {
      name: myDevices[config.NAME].propName,
      ...myDevices[config.NAME],
    },
  }
}

async function triggerCommand(ws, message) {
  // check that the name is farmiliar
  const { messageId, botCommand, commandName, data } = message
  let result
  if (botCommand) {
    result = await botCommander[commandName].apply(botCommander, data)
  } else if (data && data.room && devices[data.room]) {
    const { room, cmd, msg, args } = data
    result = await executeCommand(room, cmd, msg, args)
  }

  if (result) {
    return ws.send(JSON.stringify({ messageIdAnswered: messageId, result }))
  }
  // return ws.send(failed)
}

export async function excecuteRemoteCommand(room, cmd, msg, args) {
  const messageId = generateId()
  devices[room].ws.send(
    JSON.stringify({ messageId, data: { room, cmd, msg, args } })
  )
  return getMessageResult(messageId)
  // TODO: handle ack? not sure if possible here
}

export async function executeBotRemoteCommand(commandName, msg) {
  const masterRoom = await getMasterRoom()
  const messageId = generateId()
  devices[masterRoom].ws.send(
    JSON.stringify({ messageId, botCommand: true, commandName, data: msg })
  )
  return getMessageResult(messageId)
}

const messageResults = new Map()
function getMessageResult(messageId) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      if (messageResults.has(messageId)) {
        messageResults.delete(messageId)
        reject(`timeout for message "${messageId}"`)
      }
    }, config.MESSAGE_RESULT_TIMEOUT)
    messageResults.set(messageId, result => {
      clearTimeout(timeoutId)
      resolve(result)
    })
  })
}
function publishMessageResult(messageId, result) {
  const cb = messageResults.get(messageId)
  cb(result)
  messageResults.delete(messageId)
}
