import broadlinkController from '../broadlinkController'
import botCommander from '../botCommander'

export default function(msg){
  const id = msg.from.id //33923320
  const name = msg.from.first_name

  broadlinkController.getDevices().then(devs=>{
    const inline_keyboard = [
      devs.map(dev=>{
        return {
          text: dev.name.charAt(0).toUpperCase() + dev.name.slice(1).toLocaleLowerCase(),
          callback_data: dev.name,
        }
      }),
    ]
    const keyboardOpts = {
      reply_markup:JSON.stringify({
        inline_keyboard,
        resize_keyboard: true,
        one_time_keyboard: true,
      }),
      parse_mode: 'Markdown',
      disable_web_page_preview:true,
    }

    if (msg.message && msg.message.message_id){
      return botCommander.editMessageText(`Hi ${name}, what do you want to do?`, {
        chat_id: msg.message.chat.id,
        message_id: msg.message.message_id,
      }).then(()=>{
        return botCommander.editMessageReplyMarkup({
          inline_keyboard,
        }, {
          chat_id: msg.message.chat.id,
          message_id: msg.message.message_id,
        })
      })
    }
    return botCommander.sendMessage(id, `Hi ${name}, what do you want to do?`, keyboardOpts)
  })
}
