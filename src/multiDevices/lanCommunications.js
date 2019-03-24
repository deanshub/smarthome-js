import config from 'config'
import scanner from 'lanscanner'
import http from 'http'
import WebSocket from 'ws'
import logger from '../logger'
import {getMyDevices} from './devicesHelper'
import {executeCommand} from '../broadlinkController'

const PORT = config.REMOTE_COMMANDS_PORT || 13975

const devices = {}

function getSocket(ip) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`${ip}:${PORT}`)
    ws.on('open', async() => {
      ws.send(JSON.stringify(await getManifest()))
    })
    ws.on('close', reject)
    ws.on('error', reject)
    ws.on('message', ({data}) => {
      const message = JSON.parse(data)
      // console.log(data)
      if (message.manifest) {
        resolve({...message, device: ws})
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
        devices[message.name] = {...message, device: ws}
      // TODO: handle errors and acks
      }else {
        triggerCommand(ws, message)
      }
    })
    logger.info('A new connection appeared')
    ws.send(JSON.stringify(await getManifest()))
  })
  server.listen(PORT, '0.0.0.0',() => {
    // TODO: get local IP and present a url
    console.log(`Remote command server listening on port ${PORT}`)
  })
  return {server, wss}
}

async function getManifest() {
  const myDevices = await getMyDevices()

  return {
    name: myDevices[config.name].propName,
    ...myDevices[config.name],
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
  devices[room].send(JSON.stringify({room, cmd, msg, args}))
  // TODO: handle ack? not sure if possible here
}
