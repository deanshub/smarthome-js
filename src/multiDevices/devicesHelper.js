import devices from '../../devices/myDevices.json'
import fs from 'fs-extra'
import path from 'path'

let cachedDevices = null

export async function getMyDevices() {
  const devicesProps = Object.keys(devices)
  const keys = await Promise.all(
    devicesProps.map(deviceProp =>
      fs.readFile(
        path.join(__dirname, '../../devices', devices[deviceProp].keyName)
      )
    )
  )

  cachedDevices = devicesProps.reduce((res, deviceProp, index) => {
    res[deviceProp] = {
      ...devices[deviceProp],
      key: keys[index],
      propName: deviceProp,
    }
    return res
  }, {})

  return cachedDevices
}

export async function saveSignalCommandToManifest({
  room,
  signalName,
  displayName,
}) {
  const devicesPath = '../../devices/myDevices.json'
  const myDevices = await import(devicesPath)
  myDevices[room].commands[signalName] = {
    displayName,
    function: 'sendSignal',
    signal: `${signalName}.deg`,
  }

  return fs.writeFile(
    path.join(__dirname, devicesPath),
    JSON.stringify(myDevices, null, 2)
  )
}

export function isMaster(device) {
  return devices[device].master
}

export function getMasterRoom() {
  return Object.values(cachedDevices).find(device => device.master).propName
}
