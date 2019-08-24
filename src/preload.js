import logger from './logger'
import { addCommand, subscribeToMessages } from './botCommander'
import commandsConfig from './commandsConfiguration'
import { createServer, scanForDevices } from './multiDevices/lanCommunications'

logger.info('Device Restarted')
export default async function() {
  commandsConfig
    .filter(command => !command.disabled)
    .forEach(command => {
      addCommand(
        command,
        require(`./commands/${command.name}`)[command.fn || 'default']
      )
    })

  subscribeToMessages()

  createServer()
  scanForDevices()
}
