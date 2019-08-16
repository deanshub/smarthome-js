import { rediscoverDevices } from '../src/broadlinkController'
import { runCommand } from '../src/botCommander'

export default async function(msg) {
  await rediscoverDevices()
  return runCommand('start', msg)
}
