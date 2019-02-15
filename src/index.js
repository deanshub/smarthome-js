import logger from './logger'
import {addCommand, subscribeToMessages} from './botCommander'
import commandsConfig from './commandsConfiguration'

logger.info('Device Restarted')

commandsConfig
  .filter(command=>!command.disabled)
  .forEach(command=>{
    addCommand(command, require(`./commands/${command.name}`)[command.fn||'default'])
  })

subscribeToMessages()

// setTimeout(()=>{
//   console.log('offing');
//   botCommander.runCommand('off', {from:{id:'124'}})
// }, 3000)
