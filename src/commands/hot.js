import broadlinkController from '../broadlinkController'
import botCommander from '../botCommander'

export default function(msg){
  const id = msg.from.id
  return broadlinkController.hot().then(() => {
    return botCommander.sendMessage(id, 'Let it burn')
  })
}
