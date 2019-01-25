import fs from 'fs-extra'
import path from 'path'
import Broadlink from './Broadlink'
import logger from './logger'
import {getMyDevices} from './devicesHelper'
let b = new Broadlink()

const discoverDevices = () =>  new Promise(async (resolve) => {
  const savedDevices = await getMyDevices()

  let unkownIndex = 0
  b.on('deviceReady', dev => {
    dev.checkData()
    // fs.writeFile(path.join(__dirname, '../devices', `${dev.model}${index}`), dev.key)
    const deviceConfiguration = Object.values(savedDevices).find(
      savedDevice => savedDevice.key.toString() === dev.key.toString()
    )
    if (deviceConfiguration) {
      if (!deviceConfiguration.displayName) {
        deviceConfiguration.displayName = deviceConfiguration.propName
      }
      logger.info(`device "${deviceConfiguration.displayName}" found`)
      deviceConfiguration.device = dev
    }else{
      const unknownDeviceProp = `Unkown${unkownIndex++}`
      savedDevices[unknownDeviceProp].device = dev
      savedDevices[unknownDeviceProp].propName = unknownDeviceProp
      savedDevices[unknownDeviceProp].displayName = unknownDeviceProp
    }
    setTimeout(() => {
      resolve(savedDevices)
    }, 200)
  })
  logger.info('Discovering devices...')
  b.discover()
})

let devicesReady = discoverDevices()

export const rediscoverDevices = () => {
  b = new Broadlink()
  devicesReady = discoverDevices()
  return devicesReady
}

export async function getRoomConfiguration(room) {
  const devices = await devicesReady
  return devices[room]
}

export async function getCommandConfiguration(room, cmd) {
  const roomConfig = await getRoomConfiguration(room)
  return roomConfig.commands[cmd]
}

export async function executeCommand(room, cmd, msg) {
  const roomConfig = await getRoomConfiguration(room)
  const commandConfig = await getCommandConfiguration(room, cmd)
  const module = require(commandConfig.module ? `./commands/${commandConfig.module}` : './broadlinkController')
  return module[commandConfig.function||'default'].call(module, {...commandConfig, device: roomConfig.device, room, msg})
}

export const sendSignal = async ({signal, device}) => {
  const signalData = await fs.readFile(
    path.join(__dirname, '../signals', signal)
  )
  return device.sendData(signalData)
}

export const learnSignal = async ({device, signalName}) => {
  return new Promise((resolve, reject) => {
    const cancelTimeout = setTimeout(()=>{
      device.cancelLearn()
      reject(new Error('no signal found to learn'))
    }, 10000)

    device.on('rawData', signalData => {
      fs.writeFile(
        path.join(__dirname, '../signals', `${signalName}.deg`),
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
    },3000)
    setTimeout(() => {
      device.checkData()
    },6000)
    setTimeout(() => {
      device.checkData()
    },9000)
  })
}

export const checkSingleTemperature = ({device}) => {
  return new Promise(resolve => {
    // const temperatureFn = (temp)=>{
    //   // dev.off('temperature', temperatureFn)
    //   resolve(temp)
    // }
    device.on('temperature', resolve)
    device.checkTemperature()
  })
}

export const getDevices = () => devicesReady

// b.on('deviceReady', (dev) => {
//     var timer = setInterval(function(){
//         console.log('send check!')
//         dev.checkData()
//     }, 1000)
//
//     dev.on('temperature', (temp)=>{
//         console.log('get temp '+temp)
//         // console.log(dev)
//         // dev.enterLearning()
//     })
//
//     // dev.on('rawData', (data) => {
//     //     fs.writeFile('30.deg', data, function(err) {
//     //         if(err) {
//     //             return console.log(err)
//     //         }
//     //         console.log('The file was saved!')
//     //         clearInterval(timer)
//     //     })
//     // })
//     dev.checkTemperature()
//
//     // fs.readFile('17.deg', (err, data) => {
//     //     // console.log(data)
//     //     dev.sendData(data)
//     // })
//
//     // fs.readFile('off.deg', (err, data) => {
//     //     // console.log(data)
//     //     dev.sendData(data)
//     // })
// })
//
// b.discover()

// const Broadlink = require('../Broadlink')
// let b = new Broadlink()
// b.discover()
// b.getIPAddresses()
//
// rawData
//
// b.checkData()
// b.sendData()
// b.enterLearning()
// b.checkTemperature()
// b.cancelLearn()
