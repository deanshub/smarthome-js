import fs from 'fs-extra'
import path from 'path'
import Broadlink from './Broadlink'
import CONSTS from './consts'
import logger from './logger'
let b = new Broadlink()

const names = Object.values(CONSTS.ROOMS)

const getDeviceNames = Promise.all([
  fs.readFile(path.join(__dirname, '../devices', 'Broadlink RM Mini1')),
  fs.readFile(path.join(__dirname, '../devices', 'Broadlink RM2 Pro Plus v23')),
  fs.readFile(path.join(__dirname, '../devices', 'Broadlink RM Mini2')),
]).then(keys => {
  return keys.map((key, index) => ({
    key,
    name: names[index].toLocaleLowerCase(),
  }))
})

const discoverDevices = () =>  new Promise(resolve => {
  const devices = {}
  let unkownIndex = 0
  b.on('deviceReady', dev => {
    dev.checkData()
    // fs.writeFile(path.join(__dirname, '../devices', `${dev.model}${index}`), dev.key)
    getDeviceNames.then(devicesNames => {
      const devName = devicesNames.find(
        d => d.key.toString() === dev.key.toString()
      )
      dev.name = (devName && devName.name) || `Unkown${unkownIndex++}`
      logger.info(`device "${dev.name}" found`)
      devices[dev.name] = dev
      setTimeout(() => {
        resolve(devices)
      }, 200)
    })
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

export const getDeviceByName = name => {
  const lowercasedName = name.toLocaleLowerCase()
  return devicesReady.then(devices => devices[lowercasedName])
}

export const sendSignal = async (signalFile, deviceName) => {
  const dev = await getDeviceByName(deviceName)
  const signalData = await fs.readFile(
    path.join(__dirname, '../signals', signalFile)
  )
  return dev.sendData(signalData)
}

const learnSignal = async (deviceName, signalName) => {
  const dev = await getDeviceByName(deviceName)
  return new Promise((resolve, reject) => {
    const cancelTimeout = setTimeout(()=>{
      dev.cancelLearn()
      reject(new Error('no signal found to learn'))
    }, 10000)

    dev.on('rawData', signalData => {
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
    dev.enterLearning()
    setTimeout(() => {
      dev.checkData()
    },3000)
    setTimeout(() => {
      dev.checkData()
    },6000)
    setTimeout(() => {
      dev.checkData()
    },9000)
  })
}

const checkSingleTemperature = dev => {
  return new Promise(resolve => {
    // const temperatureFn = (temp)=>{
    //   // dev.off('temperature', temperatureFn)
    //   resolve(temp)
    // }
    dev.on('temperature', resolve)
    dev.checkTemperature()
  })
}

export const workroom = {
  cold: () => sendSignal('work17.deg', CONSTS.ROOMS.WORKROOM),
  hot: () => sendSignal('work30.deg', CONSTS.ROOMS.WORKROOM),
  off: () => sendSignal('workoff.deg', CONSTS.ROOMS.WORKROOM),
  temprature: () => {
    return getDeviceByName(CONSTS.ROOMS.WORKROOM).then(checkSingleTemperature)
  },
  learn: cmd => learnSignal(CONSTS.ROOMS.WORKROOM, cmd),
}

export const livingroom = {
  cold: () => sendSignal('salon22.deg', CONSTS.ROOMS.LIVINGROOM),
  hot: () => sendSignal('salon28.deg', CONSTS.ROOMS.LIVINGROOM),
  off: () => sendSignal('salonoff.deg', CONSTS.ROOMS.LIVINGROOM),
  temprature: () => {
    return getDeviceByName(CONSTS.ROOMS.LIVINGROOM).then(
      checkSingleTemperature
    )
  },
  tv: () => sendSignal('salonTv.deg', CONSTS.ROOMS.LIVINGROOM),
  learn: cmd => learnSignal(CONSTS.ROOMS.LIVINGROOM, cmd),
}

let onFile = 'bed30.deg'
export const bedroom = {
  cold: () => {
    onFile = 'bed16.deg'
    sendSignal(onFile, CONSTS.ROOMS.BEDROOM)
  },
  hot: () => {
    onFile = 'bed30.deg'
    sendSignal(onFile, CONSTS.ROOMS.BEDROOM)
  },
  tv: () => sendSignal('bedTv.deg', CONSTS.ROOMS.BEDROOM),
  off: () => sendSignal(onFile, CONSTS.ROOMS.BEDROOM),
  temprature: () => {
    return getDeviceByName(CONSTS.ROOMS.BEDROOM).then(checkSingleTemperature)
  },
  lights: () => sendSignal('bedLights.deg', CONSTS.ROOMS.BEDROOM),
  learn: cmd => learnSignal(CONSTS.ROOMS.BEDROOM, cmd),
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
