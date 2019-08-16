import { speaker } from 'win-audio'
import lockSystem from 'lock-system'
import Camera from 'node-webcam'
import Webcam from 'node-webcam/src/Webcam'
import { sendImage } from '../src/botCommander'

const webcamOptions = {
  output: 'jpeg',
  callbackReturn: Webcam.CallbackReturnTypes.buffer,
  // verbose: true,
}
const webcam = Camera.create(webcamOptions)

// speaker.polling(200)
//
// let muted = false
// speaker.events.on('toggle', status => {
//   muted = status.new
//   // console.log('muted: %s -> %s', status.old, status.new)
// })

export async function mute() {
  return speaker.toggle()
}

export async function volUp() {
  return speaker.increase(5)
}

export async function volDown() {
  return speaker.decrease(5)
}

export async function lock() {
  return lockSystem()
}

export async function snapshot({ msg }) {
  return new Promise((resolve, reject) => {
    webcam.capture('img', (err, buffer) => {
      if (err) return reject(err)
      return sendImage(msg.from.id, buffer)
    })
  })
}
