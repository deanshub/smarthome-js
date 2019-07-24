import fs from 'fs-extra'
import path from 'path'
import config from 'config'

let cachedDevices = null

export async function getMyDevices() {
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

  cachedDevices = devicesManifest
  return devicesManifest
}

export async function saveSignalCommandToManifest({
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

export function isMaster(device) {
  // return cachedDevices[device].master
  return device === 'workroom'
}

export function getMasterRoom() {
  return Object.values(cachedDevices).find(device => device.master).propName
}
