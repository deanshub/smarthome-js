import * as broadlinkController from '../broadlinkController'
import CONSTS from '../consts'

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

export async function isGroupProp({ data }) {
  if (data.includes(CONSTS.GROUP_SEPERATOR)) {
    const parts = data.split(CONSTS.GROUP_SEPERATOR)
    const devices = await broadlinkController.getDevices()
    const pathResolver = parts.reduce((res, cur) => {
      if (res) {
        return res[cur]
      }
      return null
    }, devices)
    return !!pathResolver
  }
  return false
}
