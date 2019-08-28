import { learnSignal, addSignalCommandToMemory } from '../broadlinkController'
import {
  sendMessage,
  getMessage,
  editMessage,
  runCommand,
} from '../botCommander'
import logger from '../logger'
import { saveSignalCommandToManifest } from '../multiDevices/devicesHelper'

function toSignalName(name) {
  return name.replace(/[^0-9a-z]/gi, '')
}

export default async function({ device, msg, room }) {
  try {
    // let lastMessage = await sendMessage(msg.from.id, 'Action name?')
    await editMessage('Action name?', undefined, {
      chat_id: msg.message.chat.id,
      message_id: msg.message.message_id,
    })

    const nameMessage = await getMessage()
    const actionDisplayName = nameMessage.text.trim()
    const signalName = toSignalName(actionDisplayName)

    await sendMessage(msg.from.id, 'Please send signal to learn')

    await learnSignal({ device, signalName })
    await addSignalCommandToMemory({
      room,
      signalName,
      displayName: actionDisplayName,
    })
    await saveSignalCommandToManifest({
      room,
      signalName,
      displayName: actionDisplayName,
    })

    await sendMessage(msg.from.id, 'Done learning')
  } catch (e) {
    console.log(e && e.stack)
    logger.error(e && e.message)
    await sendMessage(msg.from.id, 'Couldn\'t learn the signal')
  }
  return runCommand('start', { ...msg, message: null })
}
