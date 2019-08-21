import logger from './logger'
import { addCommand, subscribeToMessages } from './botCommander'
import commandsConfig from './commandsConfiguration'
import { createServer, scanForDevices } from './multiDevices/lanCommunications'
import callback from './commands/callback'
import start from './electron/appLoader'

logger.info('Device Restarted')

commandsConfig
  .filter(command => !command.disabled)
  .forEach(command => {
    addCommand(
      command,
      require(`./commands/${command.name}`)[command.fn || 'default']
    )
  })
addCommand({ name: 'callback' }, callback)

subscribeToMessages()

createServer()
scanForDevices()
console.log('starting')
start()
