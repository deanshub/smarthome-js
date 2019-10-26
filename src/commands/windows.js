import { audio } from 'system-control'
import lockSystem from 'lock-system'
import Camera from 'node-webcam'
import Webcam from 'node-webcam/src/Webcam'
import { sendImage } from '../botCommander'

const webcamOptions = {
  output: 'jpeg',
  callbackReturn: Webcam.CallbackReturnTypes.buffer,
  // verbose: true,
}
const webcam = Camera.create(webcamOptions)

export async function mute() {
  const muted = await audio.muted()
  return audio.muted(!muted)
}

export async function volUp() {
  const volume = await audio.volume()
  return audio.volume(volume + 5)
}

export async function volDown() {
  const volume = await audio.volume()
  return audio.volume(volume - 5)
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
