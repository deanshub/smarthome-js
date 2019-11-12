import { getDevices } from '../broadlinkController'
import {
  editMessageText,
  editMessageReplyMarkup,
  sendMessage,
  addCallbackRunCommand,
} from '../botCommander'
import CONSTS from '../consts'

export default async function(msg) {
  const id = msg.from.id
  const name = msg.from.first_name

  const devices = await getDevices()

  const inline_keyboard = Object.values(devices)
    .sort((a, b) =>
      (a.propName.toUpperCase() < b.propName.toUpperCase() ? -1 : 1)
    )
    .map(device => {
      return {
        text: device.device ? device.displayName : `🔴 ${device.displayName}`,
        callback_data: msg.timer
          ? `${device.propName}${CONSTS.TIME_KEY}${msg.timer}`
          : device.propName,
      }
    })
    .reduce((res, device, index) => {
      if (index % 3 == 0) {
        res.push([device])
      } else {
        res[res.length - 1].push(device)
      }
      return res
    }, [])

  if (!msg.timer) {
    inline_keyboard.unshift([{ text: '⏲ Timer', callback_data: CONSTS.TIMER }])
  }

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

  const startText = msg.timer
    ? `What do you want to do ${msg.timer}`
    : `Hi ${name}, what do you want to do?`
  return sendMessage(id, startText, keyboardOpts)
}

addCallbackRunCommand(CONSTS.BACK, 'start')
