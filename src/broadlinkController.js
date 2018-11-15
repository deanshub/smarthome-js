import fs from 'fs-extra'
import path from 'path'
import Broadlink from './Broadlink'
import CONSTS from './consts'
var b = new Broadlink()

const names = Object.values(CONSTS.ROOMS)

const getDeviceNames = Promise.all([
  fs.readFile(path.join(__dirname, '../devices', 'Broadlink RM Mini1')),
  fs.readFile(path.join(__dirname, '../devices', 'Broadlink RM Mini2')),
  fs.readFile(path.join(__dirname, '../devices', 'Broadlink RM2 Pro Plus v23')),
]).then(keys=>{
  return keys.map((key, index)=>({
    key,
    name: names[index].toLocaleLowerCase(),
  }))
})

const devicesReady = new Promise((resolve) => {
  const devices = []
  b.on('deviceReady', (dev) => {
    dev.checkData()
    // fs.writeFile(path.join(__dirname, '../devices', `${dev.model}${index}`), dev.key)
    getDeviceNames.then(devicesNames=>{
      const devName = devicesNames.find(d=>d.key.toString()===dev.key.toString())
      dev.name = (devName&&devName.name)||'Unkown'
      devices.push(dev)
      setTimeout(()=>{
        resolve(devices)
      },200)
    })
  })
  b.discover()
})

const getDeviceByName = (name) => {
  const lowercasedName = name.toLocaleLowerCase()
  return devicesReady.then(devs=>{
    return devs.find(dev=>dev.name===lowercasedName)
  })
}

const sendSignal = (signalFile, name) => {
  return getDeviceByName(name).then(dev=>{
    return fs.readFile(path.join(__dirname, '../signals', signalFile)).then(data=>({dev, data}))
  }).then(({dev, data}) => {
    return dev.sendData(data)
  })
}

const checkSingleTemperature = (dev) => {
  return new Promise(resolve=>{
    // const temperatureFn = (temp)=>{
    //   // dev.off('temperature', temperatureFn)
    //   resolve(temp)
    // }
    dev.on('temperature', resolve)
    dev.checkTemperature()
  })
}

const workroom = {
  cold: () => sendSignal('work17.deg', CONSTS.ROOMS.WORKROOM),
  hot: () => sendSignal('work30.deg', CONSTS.ROOMS.WORKROOM),
  off: () => sendSignal('workoff.deg', CONSTS.ROOMS.WORKROOM),
  temprature: ()=>{
    return getDeviceByName(CONSTS.ROOMS.WORKROOM).then(checkSingleTemperature)
  },
  learn: (cmd) => {
    return getDeviceByName(CONSTS.ROOMS.WORKROOM).then(dev=>{
      return new Promise((resolve, reject) => {
        dev.on('rawData', data => {
          console.log(data);
          fs.writeFile(path.join(__dirname, '../signals', `${cmd}.deg`), data).then(resolve).catch(reject)
        })
        dev.checkData()
        dev.enterLearning()
      })
    })
  },
}

const livingroom = {
  cold: () => sendSignal('salon22.deg', CONSTS.ROOMS.LIVINGROOM),
  hot: () => sendSignal('salon28.deg', CONSTS.ROOMS.LIVINGROOM),
  off: () => sendSignal('salonoff.deg', CONSTS.ROOMS.LIVINGROOM),
  temprature: ()=>{
    return getDeviceByName(CONSTS.ROOMS.LIVINGROOM).then(checkSingleTemperature)
  },
  learn: (cmd) => {
    return getDeviceByName(CONSTS.ROOMS.LIVINGROOM).then(dev=>{
      return new Promise((resolve, reject) => {
        dev.on('rawData', data => {
          console.log(data);
          fs.writeFile(path.join(__dirname, '../signals', `${cmd}.deg`), data).then(resolve).catch(reject)
        })
        dev.checkData()
        dev.enterLearning()
      })
    })
  },
}

let onFile
const bedroom = {
  cold: () => {
    onFile = 'bed16.deg'
    sendSignal(onFile, CONSTS.ROOMS.BEDROOM)
  },
  hot: () => {
    onFile = 'bed30.deg'
    sendSignal(onFile, CONSTS.ROOMS.BEDROOM)
  },
  off: () => sendSignal(onFile, CONSTS.ROOMS.BEDROOM),
  temprature: ()=>{
    return getDeviceByName(CONSTS.ROOMS.BEDROOM).then(checkSingleTemperature)
  },
  learn: (cmd) => {
    return getDeviceByName(CONSTS.ROOMS.BEDROOM).then(dev=>{
      return new Promise((resolve, reject) => {
        dev.on('rawData', data => {
          console.log(data);
          fs.writeFile(path.join(__dirname, '../signals', `${cmd}.deg`), data).then(resolve).catch(reject)
        })
        dev.checkData()
        dev.enterLearning()
      })
    })
  },
}


const getDevices = () => devicesReady

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


export default {
  sendSignal,
  workroom,
  livingroom,
  bedroom,
  getDevices,
}
