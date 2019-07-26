import { speaker } from 'win-audio'
import lockSystem from 'lock-system'

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
