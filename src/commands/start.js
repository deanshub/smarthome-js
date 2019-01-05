import {getDevices} from '../broadlinkController'
import {editMessageText, editMessageReplyMarkup, sendMessage} from '../botCommander'

export default async function(msg) {
  const id = msg.from.id
  const name = msg.from.first_name

  const devices = await getDevices()

  const inline_keyboard = [
    Object.keys(devices).map(devName => {
      return {
        text:
          devName.charAt(0).toUpperCase() +
          devName.slice(1).toLocaleLowerCase(),
        callback_data: devName,
      }
    }),
  ]
  const keyboardOpts = {
    reply_markup: JSON.stringify({
      inline_keyboard,
      resize_keyboard: true,
      one_time_keyboard: true,
    }),
    parse_mode: 'Markdown',
    disable_web_page_preview: true,
  }

  if (msg.message && msg.message.message_id) {
    await editMessageText(`Hi ${name}, what do you want to do?`, {
      chat_id: msg.message.chat.id,
      message_id: msg.message.message_id,
    })

    return editMessageReplyMarkup(
      {
        inline_keyboard,
      },
      {
        chat_id: msg.message.chat.id,
        message_id: msg.message.message_id,
      }
    )
  }
  return sendMessage(
    id,
    `Hi ${name}, what do you want to do?`,
    keyboardOpts
  )
}
