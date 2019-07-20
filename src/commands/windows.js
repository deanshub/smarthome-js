import { speaker } from 'win-audio'
import lockSystem from 'lock-system'

export async function mute() {
  return speaker.mute()
}

export async function lock() {
  return lockSystem()
}
