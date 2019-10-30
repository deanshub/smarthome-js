const path = require('path')
const AutoLaunch = require('auto-launch')
const command = process.argv[process.argv.length - 1]

const autoLauncher = new AutoLaunch({
  name: 'Friday',
  path: `${path.resolve(
    process.cwd(),
    'node_modules/.bin/electron.cmd'
  )} ${path.resolve(process.cwd(), 'dist/smarthome.js')}`,
})

autoLauncher
  .isEnabled()
  .then(function(isEnabled) {
    if (isEnabled && command === 'uninstall') {
      autoLauncher.disable()
    } else if (!isEnabled && command === 'install') {
      autoLauncher.enable()
    } else {
      console.log(
        `the app is ${
          isEnabled ? 'installed' : 'uninstalled'
        } and the command provided was ${command}`
      )
    }
  })
  .catch(console.error)
