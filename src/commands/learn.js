import {learnSignal} from '../broadlinkController'
import {sendMessage, getMessage} from '../botCommander'
import logger from '../logger'

export default async function({device, msg}) {
  try {
    await sendMessage(msg.from.id, 'Action name?')
    const nameMessage = await getMessage()
    const signalName = nameMessage.text.trim()

    const learningMessage = await sendMessage(msg.from.id, 'Please send signal to learn')
    await learnSignal({device, signalName})
    await sendMessage(msg.from.id, 'Done learning')
    // return botCommander.editMessageText('Done learning', {
    //   chat_id: `${learningMessage.chat.id}`,
    //   message_id: `${learningMessage.message_id}`,
    // })
  }catch(e){
    logger.error(e)
    return sendMessage(msg.from.id, 'Couldn\'t learn the signal')
  }
}
