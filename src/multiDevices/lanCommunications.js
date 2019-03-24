import config from 'config'
import scanner from 'lanscanner'
import http from 'http'
import WebSocket from 'ws'
import logger from '../logger'
import {getMyDevices} from './devicesHelper'
import {executeCommand} from '../broadlinkController'

const PORT = config.REMOTE_COMMANDS_PORT || 13975
if (!config.NAME) {
  logger.warn('device name not configured!')
}
const devices = {}

function getSocket(ip) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://${ip}:${PORT}`)
    ws.on('open', async() => {
      ws.send(JSON.stringify(await getManifest()))
    })
    ws.on('close', reject)
    ws.on('error', reject)
    ws.on('message', (data) => {
      let message = {}
      try {
        message = JSON.parse(data)
      }catch (e) {
        logger.error('Unknown message received:')
        logger.error(data)
        logger.error(e)
      }
      // console.log(data)
      if (message.manifest) {
        resolve({...message.manifest, ws})
      // TODO: handle errors and acks
      } else {
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
    }catch(e){
      //
    }
  }
  logger.info(Object.keys(devices).join(', '))
  return devices
}

export function createServer() {
  // TODO: allow only internal connections

  const server = http.createServer()
  const wss = new WebSocket.Server({server})
  wss.on('connection', async (ws)=>{
    ws.on('message',(data)=>{
      // console.log(data)
      const message = JSON.parse(data)
      if (message.manifest) {
        devices[message.manifest.name] = {...message.manifest, ws}
      // TODO: handle errors and acks
      }else {
        triggerCommand(ws, message)
      }
    })
    logger.info('A new connection appeared')
    ws.send(JSON.stringify(await getManifest()))
  })
  server.listen(PORT, scanner.getInternalIP(), () => {
    // TODO: get local IP and present a url
    console.log(`Remote command server started on\nws://${scanner.getInternalIP()}:${PORT}/`)
  })
  return {server, wss}
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
  // console.log(message)
  const {name, room, cmd, msg, args} = message
  // check that the name is farmiliar
  // if (devices[name]) {
  await executeCommand(room, cmd, msg, args)
  // return ws.send(ack)
  // }
  // return ws.send(failed)
}

export async function excecuteRemoteCommand(room, cmd, msg, args) {
  devices[room].ws.send(JSON.stringify({room, cmd, msg, args}))
  // TODO: handle ack? not sure if possible here
}
