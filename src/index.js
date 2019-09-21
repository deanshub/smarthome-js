import start from './electron/appLoader'
import preload from './preload'
import logger from './logger'
;(async function() {
  preload()
  start()
})()

if (process.env.NODE_ENV === 'development') {
  process
    .on('uncaughtException', logger.error)
    .on('unhandledRejection', (reason, p) => {
      logger.error(reason)
      logger.error('Unhandled Rejection at Promise')
      logger.error(p)
    })
}
