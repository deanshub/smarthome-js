import { sendMessage, getMessage } from '../botCommander'
import logger from '../logger'

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
    }, timeText*60*1000)
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
      const remaining = Math.round((Date.now() - reminder.now + reminder.time*60*1000)/1000/60)
      return sendMessage(msg.from.id, `in ${remaining} minutes`, {
        reply_to_message_id: reminder.message_id,
      })
    })
  }else{
    return sendMessage(msg.from.id, 'no reminders set', {
      reply_to_message_id: msg.message_id,
    })
  }
}
