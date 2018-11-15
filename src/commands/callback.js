import botCommander from '../botCommander'
import broadlinkController from '../broadlinkController'
import CONSTS from '../consts'

function getRoomFromData(data, command) {
  return data.substr(0, data.length - command.length)
}

function getEmoji(name) {
  switch (name) {
  case CONSTS.COMMANDS.COLD:
    return '❄️'
  case CONSTS.COMMANDS.TEMPRATURE:
    return '🌡️'
  case CONSTS.COMMANDS.HOT:
    return '☀️'
  case CONSTS.COMMANDS.OFF:
    return '💀'
  case CONSTS.COMMANDS.LEARN:
    return '🎓'
  case CONSTS.COMMANDS.BACK:
    return '⬅️'

  default:
    return name.charAt(0).toUpperCase() + name.slice(1).toLocaleLowerCase()
  }

}

export default async function(msg, data){
  if (data.endsWith(CONSTS.COMMANDS.BACK)) {
    return botCommander.runCommand('start', msg)
  } else if (data.endsWith(CONSTS.COMMANDS.COLD)) {
    const room = getRoomFromData(data, CONSTS.COMMANDS.COLD).toLocaleLowerCase()
    broadlinkController[room][CONSTS.COMMANDS.COLD.toLocaleLowerCase()].call(this)
    return botCommander.runCommand('start', msg)
  } else if (data.endsWith(CONSTS.COMMANDS.HOT)) {
    const room = getRoomFromData(data, CONSTS.COMMANDS.HOT).toLocaleLowerCase()
    broadlinkController[room][CONSTS.COMMANDS.HOT.toLocaleLowerCase()].call(this)
    return botCommander.runCommand('start', msg)
  } else if (data.endsWith(CONSTS.COMMANDS.TEMPRATURE)) {
    const room = getRoomFromData(data, CONSTS.COMMANDS.TEMPRATURE).toLocaleLowerCase()
    broadlinkController[room][CONSTS.COMMANDS.TEMPRATURE.toLocaleLowerCase()].call(this).then(t=>{
      return botCommander.sendMessage(msg.from.id, `${t}℃`).then(()=>
        botCommander.runCommand('start', msg)
      )
    })
  } else if (data.endsWith(CONSTS.COMMANDS.LEARN)) {
    const room = getRoomFromData(data, CONSTS.COMMANDS.LEARN).toLocaleLowerCase()
    broadlinkController[room][CONSTS.COMMANDS.LEARN.toLocaleLowerCase()].call(this, room).then(()=>{
      return botCommander.editMessageText('Done learning', {
        chat_id: msg.message.chat.id,
        message_id: msg.message.message_id,
      }).then(()=>
        botCommander.runCommand('start', msg)
      )
    })
  } else if (data.endsWith(CONSTS.COMMANDS.OFF)) {
    const room = getRoomFromData(data, CONSTS.COMMANDS.OFF).toLocaleLowerCase()
    broadlinkController[room][CONSTS.COMMANDS.OFF.toLocaleLowerCase()].call(this)
    return botCommander.runCommand('start', msg)
  } else {
    const inlineButtons = Object.keys(CONSTS.COMMANDS)
      .reduce((res, key, index)=>{
        if (index % 3 === 0) {
          res.push([])
        }
        res[res.length-1].push({
          text: getEmoji(CONSTS.COMMANDS[key]),
          callback_data: `${data}${CONSTS.COMMANDS[key]}`,
        })
        return res
      }, [])

    return botCommander.editMessageText(data.charAt(0).toUpperCase() + data.slice(1).toLocaleLowerCase(), {
      chat_id: msg.message.chat.id,
      message_id: msg.message.message_id,
    }).then(()=>{
      return botCommander.editMessageReplyMarkup({
        inline_keyboard: inlineButtons,
      }, {
        chat_id: msg.message.chat.id,
        message_id: msg.message.message_id,
      })
    })
  }
}
