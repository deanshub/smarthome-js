import fs from 'fs-extra'
import path from 'path'
import Broadlink from './Broadlink'
import logger from './logger'
import { getMyDevices } from './multiDevices/devicesHelper'
import config from 'config'
let b = new Broadlink(false, () => {})

const discoverDevices = async () => {
  const savedDevices = await getMyDevices()
  return new Promise(resolve => {
    let unkownIndex = 0
    b.on('deviceReady', dev => {
      dev.checkData()
      // fs.writeFile(path.join(__dirname, '../devices', `${dev.model}${index}`), dev.key)
      const deviceConfiguration = Object.values(savedDevices).find(
        savedDevice =>
          (savedDevice.key && savedDevice.key.toString()) === dev.key.toString()
      )

      if (deviceConfiguration) {
        if (!deviceConfiguration.displayName) {
          deviceConfiguration.displayName = deviceConfiguration.propName
        }
        logger.info(`broadlink device "${deviceConfiguration.propName}" found`)
        deviceConfiguration.device = dev
      } else {
        const unknownDeviceProp = `Unkown${unkownIndex++}`
        logger.info(
          `Unknown device ${unkownIndex} found, saving key to "devices/${unknownDeviceProp}.key"`
        )
        fs.writeFile(
          path.join(
            process.cwd(),
            config.DEVICES_DIRECTORY,
            `${unknownDeviceProp}.key`
          ),
          dev.key
        )
        savedDevices[unknownDeviceProp].device = dev
        savedDevices[unknownDeviceProp].propName = unknownDeviceProp
        savedDevices[unknownDeviceProp].displayName = unknownDeviceProp
      }
    })
    logger.info('Discovering devices...')
    b.discover()
    setTimeout(() => {
      resolve(savedDevices)
    }, 300)
  })
}

let devicesReady = discoverDevices()

export const rediscoverDevices = () => {
  b = new Broadlink()
  return (devicesReady = discoverDevices())
}

export async function getRoomConfiguration(room) {
  const devices = await devicesReady
  return devices[room]
}

export async function addSignalCommandToMemory({
  room,
  signalName,
  displayName,
}) {
  const devices = await devicesReady
  devices[room].commands[signalName] = {
    displayName,
    function: 'sendSignal',
    signal: `${signalName}.deg`,
  }
  return devices
}

export async function getCommandConfiguration(room, cmd) {
  const roomConfig = await getRoomConfiguration(room)
  return roomConfig.commands[cmd]
}

export async function executeCommand(room, cmd, msg, args) {
  const roomConfig = await getRoomConfiguration(room)
  const commandConfig = await getCommandConfiguration(room, cmd)
  let executionModule
  if (commandConfig.module) {
    executionModule = require(`./commands/${commandConfig.module}`)
  } else {
    executionModule = require('./broadlinkController')
  }
  return executionModule[commandConfig.function || 'default'].call(
    executionModule,
    { ...commandConfig, device: roomConfig.device, room, msg },
    args
  )
}

export const sendSignal = async ({ signal, device }) => {
  const signalData = await fs.readFile(
    path.join(process.cwd(), 'signals', signal)
  )
  if (!device) {
    throw new Error('Device not found for sending signal')
  }
  return device.sendData(signalData)
}

export const learnSignal = async ({ device, signalName }) => {
  return new Promise((resolve, reject) => {
    const cancelTimeout = setTimeout(() => {
      device.cancelLearn()
      reject(new Error('no signal found to learn'))
    }, 10000)

    device.on('rawData', signalData => {
      fs.writeFile(
        path.join(process.cwd(), 'signals', `${signalName}.deg`),
        signalData
      )
        .then(res => {
          clearTimeout(cancelTimeout)
          resolve(res)
        })
        .catch(err => {
          clearTimeout(cancelTimeout)
          reject(err)
        })
    })
    device.enterLearning()
    setTimeout(() => {
      device.checkData()
    }, 3000)
    setTimeout(() => {
      device.checkData()
    }, 6000)
    setTimeout(() => {
      device.checkData()
    }, 9000)
  })
}

export const checkSingleTemperature = ({ device }) => {
  return new Promise((resolve, reject) => {
    // const temperatureFn = (temp)=>{
    //   // dev.off('temperature', temperatureFn)
    //   resolve(temp)
    // }
    const timeoutId = setTimeout(reject, 3000)
    device.on('temperature', t => {
      clearTimeout(timeoutId)
      resolve(t)
    })
    device.checkTemperature()
  })
}

export const getDevices = () => devicesReady
