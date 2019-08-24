import start from './electron/appLoader'
import preload from './preload'
;(async function() {
  await preload()
  start()
})()

if (process.env.NODE_ENV === 'development') {
  process
    .on('uncaughtException', console.error)
    .on('unhandledRejection', (reason, p) => {
      console.error(reason, 'Unhandled Rejection at Promise', p)
    })
}
