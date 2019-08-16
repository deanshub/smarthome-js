import {
  sendMessage,
  getMessage,
  addCallbackActionUsingMatcher,
  deleteMessage,
  editMessage,
} from '../src/botCommander'
import logger from '../src/logger'

const reminders = new Set()

export default async function(msg) {
  await sendMessage(msg.from.id, 'what should I remind you?', {
    reply_to_message_id: msg.message_id,
  })
  const reminderMessage = await getMessage()
  await sendMessage(msg.from.id, 'when?', {
    reply_to_message_id: reminderMessage.message_id,
  })
  const timeMessage = await getMessage()

  const timeText = Number(timeMessage.text)
  if (!isNaN(timeText)) {
    reminderMessage.time = timeText
    reminderMessage.now = Date.now()
    reminders.add(reminderMessage)
    setTimeout(async () => {
      await sendMessage(msg.from.id, 'Reminding you', {
        reply_to_message_id: reminderMessage.message_id,
      })
      reminders.delete(reminderMessage)
    }, timeText * 60 * 1000)
    return sendMessage(msg.from.id, `will remind you in ${timeText} minutes`, {
      reply_to_message_id: reminderMessage.message_id,
    })
  }
  logger.error(`cant parse "${timeMessage.text}" minutes`)
  return sendMessage(msg.from.id, 'I don\'t understand when', {
    reply_to_message_id: timeMessage.message_id,
  })
}

export async function getAllReminders(msg) {
  if (reminders.size > 0) {
    reminders.forEach(reminder => {
      const remaining = Math.round(
        (Date.now() - reminder.now + reminder.time * 60 * 1000) / 1000 / 60
      )
      return sendMessage(msg.from.id, `in ${remaining} minutes`, {
        reply_to_message_id: reminder.message_id,
      })
    })
  } else {
    return sendMessage(msg.from.id, 'No reminders set', {
      reply_to_message_id: msg.message_id,
    })
  }
}

const reminderTimes = [
  { text: 'No', callback_data: 'no' },
  { text: '30 min', callback_data: '30' },
  { text: '1 h', callback_data: '60' },
  { text: '1 day', callback_data: '1440' },
]

const randomMessageCallbackKeyboard = {
  reply_markup: JSON.stringify({
    inline_keyboard: reminderTimes.reduce((res, cur, index) => {
      if (index % 2 === 0) {
        res.push([cur])
      } else {
        res[res.length - 1].push(cur)
      }
      return res
    }, []),
    resize_keyboard: true,
    one_time_keyboard: true,
  }),
}

export async function randomMessageReminder(msg) {
  return sendMessage(msg.from.id, 'Should I remind you?', {
    reply_to_message_id: msg.message_id,
    ...randomMessageCallbackKeyboard,
  })
}

export async function reminderCallbackMatcher({ data }) {
  return reminderTimes.find(reminderTime => reminderTime.callback_data === data)
}
export async function scheduleReminder({ msg, data }) {
  if (data === 'no') {
    return deleteMessage(msg.from.id, msg.message.message_id)
  } else {
    const reminderMessage = msg.message.reply_to_message
    reminderMessage.time = Number(data)
    reminderMessage.now = Date.now()
    reminders.add(reminderMessage)
    setTimeout(async () => {
      await sendMessage(msg.from.id, 'Reminding you', {
        reply_to_message_id: reminderMessage.message_id,
      })
      reminders.delete(reminderMessage)
    }, reminderMessage.time * 60 * 1000)

    return editMessage(`Will remind you in ${data} minutes`, undefined, {
      chat_id: msg.message.chat.id,
      message_id: msg.message.message_id,
    })
  }
}

addCallbackActionUsingMatcher(reminderCallbackMatcher, scheduleReminder)
