import * as broadlinkController from '../broadlinkController'
import CONSTS from '../consts'
import later from 'later'

later.date.localTime()

export function getRoomFromData(data) {
  const withoutTime = data.split(CONSTS.TIME_KEY)[0]
  return withoutTime.split(CONSTS.SEPERATOR)[0]
}
export function getCmdFromData(data) {
  const withoutTime = data.split(CONSTS.TIME_KEY)[0]
  return withoutTime.split(CONSTS.SEPERATOR)[1]
}
export function getTimeFromData(data) {
  return data.split(CONSTS.TIME_KEY)[1]
}

export async function isRoomProp({ data }) {
  if (!data.includes(CONSTS.SEPERATOR)) {
    const devices = await broadlinkController.getDevices()
    const roomPart = data.split(CONSTS.TIME_KEY)[0]
    return Object.keys(devices).includes(roomPart)
  }
  return false
}
