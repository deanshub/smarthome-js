import broadlinkController from '../broadlinkController'
import botCommander from '../botCommander'

export default function(msg){
  const id = msg.from.id
  return broadlinkController.checkTemperature().then(temp => {
    const message = temp.filter(t=>t!==0).map(t=>`${t}℃`).join('\n')
    return botCommander.sendMessage(id, message)
  })
}
