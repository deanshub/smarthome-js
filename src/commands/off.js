import broadlinkController from '../broadlinkController'
import botCommander from '../botCommander'

export default function(msg){
  const id = msg.from.id
  return broadlinkController.off().then(() => {
    return botCommander.sendMessage(id, 'It is done')
  })
}
