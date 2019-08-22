import start from './electron/appLoader'
import preload from './preload'

;(async function() {
  await preload()
  start()
})()
