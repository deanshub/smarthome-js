import broadlinkController from '../broadlinkController'
import botCommander from '../botCommander'

export default function(msg){
  const id = msg.from.id
  return broadlinkController.cold().then(() => {
    return botCommander.sendMessage(id, 'It\'ll get chilli in no time')
  })
}
