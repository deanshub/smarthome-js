import { sendMessage, getMessage } from '../botCommander'
import later from 'later'

export default async function(msg) {
  await sendMessage(msg.id, 'what should I remind you?', {
    reply_to_message_id: msg.message_id,
  })
  const reminderMessage = await getMessage()
  await sendMessage(msg.id, 'when?', {
    reply_to_message_id: reminderMessage.message_id,
  })
  const timeMessage = await getMessage()

  const timeText = Number(timeMessage.text)
  if (!isNaN(timeText)) {
    const time = later.parse.text(`in ${timeText} minutes`)
    return later.setTimeout(async () => {
      await sendMessage(msg.id, 'Reminding you', {
        reply_to_message_id: reminderMessage.message_id,
      })
    }, time)
  } else {
    return sendMessage(msg.id, 'I don\'t understand when', {
      reply_to_message_id: timeMessage.message_id,
    })
  }
}
