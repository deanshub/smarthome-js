import { speaker } from 'win-audio'

export async function mute() {
  return speaker.mute()
}
