import config from 'config'
import * as botCommander from '../botCommander'
import * as broadlinkController from '../broadlinkController'
import CONSTS from '../consts'
import logger from '../logger'

function getRoomFromData(data, command) {
  return data.substr(0, data.length - command.length)
}

function isAdmin(msg) {
  return config.ADMINS_CHATID.includes(`${msg.from.id}`)
}

function getEmoji(name) {
  switch (name) {
  case CONSTS.COMMANDS.COLD:
    return `❄️ ${name}`
  case CONSTS.COMMANDS.TEMPRATURE:
    return `🌡️ ${name}`
  case CONSTS.COMMANDS.HOT:
    return `☀️ ${name}`
  case CONSTS.COMMANDS.OFF:
    return `💀 ${name}`
  case CONSTS.COMMANDS.LEARN:
    return `🎓 ${name}`
  case CONSTS.COMMANDS.LIGHTS:
    return `💡 ${name}`
  case CONSTS.COMMANDS.BACK:
    return `⬅️ ${name}`
  case CONSTS.COMMANDS.TV:
    return `📺 ${name}`


  default:
    return name.charAt(0).toUpperCase() + name.slice(1).toLocaleLowerCase()
  }
}

function filterCommand(cmd, room) {
  if (cmd === CONSTS.COMMANDS.LIGHTS) {
    if (room === CONSTS.ROOMS.BEDROOM) {
      return true
    }
    return false
  }
  if (cmd === CONSTS.COMMANDS.TV) {
    if (room === CONSTS.ROOMS.BEDROOM || room === CONSTS.ROOMS.LIVINGROOM) {
      return true
    }
    return false
  }
  if (cmd === CONSTS.COMMANDS.TEMPRATURE) {
    if (room === CONSTS.ROOMS.BEDROOM) {
      return true
    }
    return false
  }
  return true
}

const logAction = (msg, room, action) => {
  logger.info(`${botCommander.getUserFriendlyName(msg)} called ${action} at ${room}`)
}

function executeCommand(msg, data, cmd){
  if (data.includes('~')){
    cancelAdminRequestMessages()
    const authData = data.split('~')
    const room = getRoomFromData(authData[1], cmd).toLocaleLowerCase()
    logger.info(`Authorization request granted usage of "${data}"`)
    logAction(msg, room, cmd)
    broadlinkController[room][cmd.toLocaleLowerCase()].call(this)
    return botCommander.sendMessage(authData[0], `@${msg.from.username} authorized your request for ${getEmoji(cmd)} on ${room}`)
  }else {
    const room = getRoomFromData(data, cmd).toLocaleLowerCase()
    logAction(msg, room, cmd)
    broadlinkController[room][cmd.toLocaleLowerCase()].call(this)
    return botCommander.runCommand('start', msg)
  }
}

const roomNames = Object.values(CONSTS.ROOMS).map(r=>r.toLocaleLowerCase())
function anonymousCommands(data) {
  return (data.endsWith(CONSTS.COMMANDS.BACK)) || roomNames.includes(data)
}

let adminRequestMessages = []
let adminRequestMessagesTimer

function cancelAdminRequestMessages(){
  clearTimeout(adminRequestMessagesTimer)
  adminRequestMessages.forEach(subMsg => {
    botCommander.editMessageReplyMarkup(undefined, {
      chat_id: subMsg.chat.id,
      message_id: subMsg.message_id,
    })
  })
}

export default async function(msg, data) {
  if (data.endsWith(CONSTS.COMMANDS.BACK)) {
    return botCommander.runCommand('start', msg)
  } else if (!isAdmin(msg) && !anonymousCommands(data)) {
    logger.info(`Not Authorized!: ${botCommander.getUserFriendlyName(msg)} requested usage of "${data}"`)
    logger.info(JSON.stringify(msg, null, 2))
    const res = await botCommander.sendMessage(msg.from.id, 'Not Authorized!')
    const authorizeKeyboard = [[{text: 'Authorize',callback_data: `${res.chat.id}~${data}`}]]
    cancelAdminRequestMessages()
    adminRequestMessages = await Promise.all(config.ADMINS_CHATID.map(adminId =>
      botCommander.sendMessage(
        adminId,
        `${botCommander.getUserFriendlyName(msg)} requested usage of "${data}"`,
        {reply_markup: JSON.stringify({inline_keyboard: authorizeKeyboard})},
      )
    ))
    adminRequestMessagesTimer = setTimeout(cancelAdminRequestMessages, (config.AUTHORIZATION_TIMEOUT || (60*1000)))

    return res
  } else if (data.endsWith(CONSTS.COMMANDS.COLD)) {
    return executeCommand(msg, data, CONSTS.COMMANDS.COLD)
  } else if (data.endsWith(CONSTS.COMMANDS.HOT)) {
    return executeCommand(msg, data, CONSTS.COMMANDS.HOT)
  } else if (data.endsWith(CONSTS.COMMANDS.TEMPRATURE)) {
    const room = getRoomFromData(
      data,
      CONSTS.COMMANDS.TEMPRATURE
    ).toLocaleLowerCase()
    logAction(msg, room, CONSTS.COMMANDS.TEMPRATURE)
    const t = await broadlinkController[room][CONSTS.COMMANDS.TEMPRATURE.toLocaleLowerCase()].call(this)
    await botCommander.sendMessage(msg.from.id, `${t}℃`)
    return botCommander.runCommand('start', msg)
  } else if (data.endsWith(CONSTS.COMMANDS.LEARN)) {
    const room = getRoomFromData(
      data,
      CONSTS.COMMANDS.LEARN
    ).toLocaleLowerCase()
    logAction(msg, room, CONSTS.COMMANDS.LEARN)
    await broadlinkController[room][CONSTS.COMMANDS.LEARN.toLocaleLowerCase()].call(this, room)
    await botCommander.editMessageText('Done learning', {
      chat_id: msg.message.chat.id,
      message_id: msg.message.message_id,
    })
    return botCommander.runCommand('start', msg)
  } else if (data.endsWith(CONSTS.COMMANDS.OFF)) {
    return executeCommand(msg, data, CONSTS.COMMANDS.OFF)
  } else if (data.endsWith(CONSTS.COMMANDS.TV)) {
    return executeCommand(msg, data, CONSTS.COMMANDS.TV)
  } else if (data.endsWith(CONSTS.COMMANDS.LIGHTS)) {
    return executeCommand(msg, data, CONSTS.COMMANDS.LIGHTS)
  } else {
    const inlineButtons = Object.keys(CONSTS.COMMANDS)
      .filter(cmdKey => filterCommand(cmdKey, data.toUpperCase()))
      .reduce((res, key, index) => {
        if (index % 3 === 0) {
          res.push([])
        }
        res[res.length - 1].push({
          text: getEmoji(CONSTS.COMMANDS[key]),
          callback_data: `${data}${CONSTS.COMMANDS[key]}`,
        })
        return res
      }, [])

    await botCommander.editMessageText(
      data.charAt(0).toUpperCase() + data.slice(1).toLocaleLowerCase(),
      {
        chat_id: msg.message.chat.id,
        message_id: msg.message.message_id,
      }
    )
    return botCommander.editMessageReplyMarkup(
      {
        inline_keyboard: inlineButtons,
      },
      {
        chat_id: msg.message.chat.id,
        message_id: msg.message.message_id,
      }
    )
  }
}
