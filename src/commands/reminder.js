import {
  sendMessage,
  sendImage,
  getMessage,
  addCallbackActionUsingMatcher,
  addCallbackAction,
  deleteMessage,
  editMessage,
} from '../botCommander'
import { puppeteerSearch } from './web'
import logger from '../logger'
import { isValidTimeText, later, distanceInWords } from '../dateUtils'

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

  const timeText = timeMessage.text
  if (isValidTimeText(timeText)) {
    reminderMessage.start = new Date()
    const futureMessage = later(async () => {
      await sendMessage(msg.from.id, 'Reminding you', {
        reply_to_message_id: reminderMessage.message_id,
      })
      reminders.delete(reminderMessage)
    }, timeText)
    reminderMessage.end = futureMessage.futureDate
    reminders.add(reminderMessage)

    return sendMessage(
      msg.from.id,
      `will remind you in ${futureMessage.text}`,
      {
        reply_to_message_id: reminderMessage.message_id,
      }
    )
  }
  logger.error(`cant parse "${timeText}" minutes`)
  return sendMessage(
    msg.from.id,
    `I don't understand what time is "${timeText}",
you can either enter the format *##:##* or *# m\\h\\d*`,
    {
      reply_to_message_id: timeMessage.message_id,
    }
  )
}

export async function getAllReminders(msg) {
  if (reminders.size > 0) {
    reminders.forEach(reminder => {
      return sendMessage(
        msg.from.id,
        `in ${distanceInWords(reminder.start, reminder.end)}`,
        {
          reply_to_message_id: reminder.message_id,
        }
      )
    })
  } else {
    return sendMessage(msg.from.id, 'No reminders set', {
      reply_to_message_id: msg.message_id,
    })
  }
}

const reminderTimes = [
  { text: 'No', callback_data: 'no' },
  { text: '30 min', callback_data: '30m' },
  { text: '1 h', callback_data: '1h' },
  { text: '1 day', callback_data: '1d' },
  { text: '⏰', callback_data: 'setTime' },
]

const googleSearchButton = [{ text: '🔍', callback_data: 'google' }]

const randomMessageCallbackKeyboard = {
  reply_markup: JSON.stringify({
    inline_keyboard: reminderTimes
      .concat(googleSearchButton)
      .reduce((res, cur, index) => {
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
  } else if (data === 'setTime') {
    await sendMessage(msg.from.id, 'when?', {
      reply_to_message_id: msg.message_id,
    })
    const timeMessage = await getMessage()

    const timeText = timeMessage.text
    if (isValidTimeText(timeText)) {
      scheduleReminder({ msg, data: timeText })
    } else {
      logger.error(`cant parse "${timeText}" minutes`)
      return sendMessage(
        msg.from.id,
        `I don't understand what time is "${timeText}",
you can either enter the format *##:##* or *# m\\h\\d*`,
        {
          reply_to_message_id: timeMessage.message_id,
        }
      )
    }
  } else {
    const reminderMessage = msg.message.reply_to_message
    reminderMessage.start = new Date()
    const futureMessage = later(async () => {
      await sendMessage(msg.from.id, 'Reminding you', {
        reply_to_message_id: reminderMessage.message_id,
      })
      reminders.delete(reminderMessage)
    }, data)
    reminderMessage.end = futureMessage.futureDate
    reminders.add(reminderMessage)

    return editMessage(`Will remind you in ${futureMessage.text}`, undefined, {
      chat_id: msg.message.chat.id,
      message_id: msg.message.message_id,
    })
  }
}

export async function googleSearch({ msg }) {
  const { img, text } = await puppeteerSearch(msg.message.reply_to_message.text)
  if (text) {
    return Promise.all([
      sendImage(msg.from.id, img),
      sendMessage(msg.from.id, text),
    ])
  }
  return sendImage(msg.from.id, img)
}

addCallbackActionUsingMatcher(reminderCallbackMatcher, scheduleReminder)
addCallbackAction('google', googleSearch)
