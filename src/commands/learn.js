import fs from 'fs-extra'
import path from 'path'
import {learnSignal} from '../broadlinkController'
import {sendMessage, getMessage, editMessage, editMessageText, runCommand} from '../botCommander'
import logger from '../logger'

function toSignalName(name){
  return name.replace(/[^0-9a-z]/gi,'')
}

export default async function({device, msg, room}) {
  try {

    // let lastMessage = await sendMessage(msg.from.id, 'Action name?')
    await editMessage('Action name?', undefined, {
      chat_id: msg.message.chat.id,
      message_id: msg.message.message_id,
    })

    const nameMessage = await getMessage()
    const actionDisplayName = nameMessage.text.trim()
    const signalName = toSignalName(actionDisplayName)

    const signalMessage = await sendMessage(msg.from.id, 'Please send signal to learn')

    // await editMessageText('Please send signal to learn', {
    //   chat_id: lastMessage.chat.id,
    //   message_id: lastMessage.message_id,
    // })
    await learnSignal({device, signalName})

    const devicesPath = '../../devices/myDevices.json'
    const myDevices = await import(devicesPath)
    myDevices[room].commands[signalName] = {
      displayName: actionDisplayName,
      function: 'sendSignal',
      signal: `${signalName}.deg`,
    }

    fs.writeFile(path.join(__dirname, devicesPath), JSON.stringify(myDevices, null, 2))

    await sendMessage(msg.from.id, 'Done learning')
    // await editMessageText('Done learning', {
    //   chat_id: signalMessage.chat.id,
    //   message_id: signalMessage.message_id,
    // })
  }catch(e){
    console.log(e && e.stack)
    logger.error(e && e.message)
    await sendMessage(msg.from.id, 'Couldn\'t learn the signal')
  }
  return runCommand('start', {...msg, message: null})
}
