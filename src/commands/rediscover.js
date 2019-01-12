import {rediscoverDevices} from '../broadlinkController'
import {runCommand} from '../botCommander'

export default async function(msg) {
  await rediscoverDevices()
  return runCommand('start', msg)
}
