import fs from 'fs-extra'
import path from 'path'
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

const REMINDERS_PATH = path.resolve(process.cwd(), 'config/reminders.json')
let reminders = new Set()

function outOfDateReminder(reminder) {
  return new Date() - reminder.end > 0
}
export async function loadReminders() {
  if (await fs.pathExists(REMINDERS_PATH)) {
    const tempReminders = JSON.parse(
      (await fs.readFile(REMINDERS_PATH)).toString()
    ).map(reminder => {
      reminder.start = new Date(reminder.start)
      reminder.end = new Date(reminder.end)
      return reminder
    })
    reminders = new Set(tempReminders)
    reminders.forEach(async reminder => {
      if (outOfDateReminder(reminder)) {
        await notifyAndRemoveReminder(reminder)
      } else {
        later(async () => {
          await notifyAndRemoveReminder(reminder)
        }, `${Math.floor((reminder.end - new Date()) / 1000 / 60)}m`)
      }
    })
  }
}
function addReminder(reminder) {
  reminders.add(reminder)
  return persistReminders(reminders)
}
async function notifyAndRemoveReminder(reminder) {
  await sendMessage(reminder.from.id, 'Reminding you', {
    reply_to_message_id: reminder.message_id,
  })
  reminders.delete(reminder)
  if (reminder.repeat) {
    // reminder.start = new Date() // no need because it already has a start date
    const futureMessage = later(async () => {
      await notifyAndRemoveReminder(reminder)
    }, '7d')
    reminder.end = futureMessage.futureDate
    addReminder(reminder)
  }
  return persistReminders(reminders)
}
function persistReminders(reminders) {
  return fs.writeFile(REMINDERS_PATH, JSON.stringify(Array.from(reminders)))
}

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
      await notifyAndRemoveReminder(reminderMessage)
    }, timeText)
    reminderMessage.end = futureMessage.futureDate
    addReminder(reminderMessage)

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

const getRepeatCallbackKeyboard = reminder => {
  const inline_keyboard = reminder.repeat
    ? [[{ text: '❌', callback_data: 'deleteReminder' }]]
    : [
      [
        { text: '🔁', callback_data: 'repeatReminder' },
        { text: '❌', callback_data: 'deleteReminder' },
      ],
    ]

  return {
    reply_markup: JSON.stringify({
      inline_keyboard,
      resize_keyboard: true,
      one_time_keyboard: true,
    }),
  }
}

export async function getAllReminders(msg) {
  if (reminders.size > 0) {
    reminders.forEach(reminder => {
      return sendMessage(
        msg.from.id,
        `in ${distanceInWords(new Date(), reminder.end)}`,
        {
          reply_to_message_id: reminder.message_id,
          ...getRepeatCallbackKeyboard(reminder),
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
  const reminderMessage = await sendMessage(
    msg.from.id,
    'Should I remind you?',
    {
      reply_to_message_id: msg.message_id,
      ...randomMessageCallbackKeyboard,
    }
  )
  // setTimeout(() => {
  // deleteMessage(reminderMessage.chat.id, reminderMessage.message_id)
  // }, config.MESSAGE_RESULT_TIMEOUT)
  return reminderMessage
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
      await notifyAndRemoveReminder(reminderMessage)
    }, data)
    reminderMessage.end = futureMessage.futureDate
    addReminder(reminderMessage)

    return sendMessage(
      msg.from.id,
      `will remind you in ${futureMessage.text}`,
      {
        reply_to_message_id: reminderMessage.message_id,
      }
    )
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

async function deleteReminder({ msg }) {
  const reminder = Array.from(reminders).find(
    cur => cur.message_id === msg.message.reply_to_message.message_id
  )
  reminders.delete(reminder)
  persistReminders(reminders)
  return editMessage('Reminder deleted', undefined, {
    chat_id: msg.message.chat.id,
    message_id: msg.message.message_id,
  })
}

async function repeatReminder({ msg }) {
  const reminder = Array.from(reminders).find(
    cur => cur.message_id === msg.message.reply_to_message.message_id
  )
  reminder.repeat = true
  persistReminders(reminders)
  return editMessage('Reminder will repeat', undefined, {
    chat_id: msg.message.chat.id,
    message_id: msg.message.message_id,
  })
}

addCallbackActionUsingMatcher(reminderCallbackMatcher, scheduleReminder)
addCallbackAction('google', googleSearch)
addCallbackAction('deleteReminder', deleteReminder)
addCallbackAction('repeatReminder', repeatReminder)

loadReminders()
