import devices from '../../devices/myDevices.json'
import fs from 'fs-extra'
import path from 'path'
import config from 'config'

let cachedDevices = null

export async function getMyDevices2() {
  // get all files from dir
  const files = await fs.readdir(
    path.resolve(process.cwd(), config.DEVICES_DIRECTORY)
  )
  // filter just for the jsons
  const deviceFiles = files.filter(name => name.endsWith('.json'))
  // import the json
  const devicesManifest = {}
  await Promise.all(
    deviceFiles.map(async file => {
      const manifest = await import(
        path.resolve(process.cwd(), config.DEVICES_DIRECTORY, file)
      )
      // add the key (readfile) and propName
      let key
      if (manifest.keyName) {
        key = await fs.readFile(
          path.resolve(
            process.cwd(),
            config.DEVICES_DIRECTORY,
            manifest.keyName
          )
        )
      }
      const room = file.slice(0, file.length - 5)
      devicesManifest[room] = { ...manifest, key, propName: room }
    })
  )

  return devicesManifest
}

export async function saveSignalCommandToManifest2({
  room,
  signalName,
  displayName,
}) {
  const deviceFile = path.resolve(
    process.cwd(),
    config.DEVICES_DIRECTORY,
    `${room}.json`
  )
  const manifest = await import(deviceFile)
  manifest.commands[signalName] = {
    displayName,
    function: 'sendSignal',
    signal: `${signalName}.deg`,
  }

  return fs.writeFile(deviceFile, JSON.stringify(manifest, null, 2))
}

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
