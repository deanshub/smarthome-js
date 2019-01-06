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

export default async function(msg, data) {
  if (!isAdmin(msg) && !data.endsWith(CONSTS.COMMANDS.BACK)) {
    logger.info(`Not Authorized!\nrequested usage of "${data}"`)
    logger.info(JSON.stringify(msg, null, 2))
    const res = await botCommander.sendMessage(msg.from.id, 'Not Authorized!')
    config.ADMINS_CHATID.forEach(adminId =>
      // TODO: add request for action with timeout to admins
      // if admin aproved remove request for action from the other admins
      // and send to the requester a message that it has been aproved
      botCommander.sendMessage(
        adminId,
        `${JSON.stringify(msg, null, 2)}\n\n${botCommander.getUserFriendlyName(msg)} requested usage of "${data}"`
      )
    )
    return res
  } else if (data.endsWith(CONSTS.COMMANDS.BACK)) {
    return botCommander.runCommand('start', msg)
  } else if (data.endsWith(CONSTS.COMMANDS.COLD)) {
    const room = getRoomFromData(
      data,
      CONSTS.COMMANDS.COLD
    ).toLocaleLowerCase()
    logAction(msg, room, CONSTS.COMMANDS.COLD)
    broadlinkController[room][CONSTS.COMMANDS.COLD.toLocaleLowerCase()].call(
      this
    )
    return botCommander.runCommand('start', msg)
  } else if (data.endsWith(CONSTS.COMMANDS.HOT)) {
    const room = getRoomFromData(data, CONSTS.COMMANDS.HOT).toLocaleLowerCase()
    logAction(msg, room, CONSTS.COMMANDS.HOT)
    broadlinkController[room][CONSTS.COMMANDS.HOT.toLocaleLowerCase()].call(
      this
    )
    return botCommander.runCommand('start', msg)
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
    const room = getRoomFromData(data, CONSTS.COMMANDS.OFF).toLocaleLowerCase()
    logAction(msg, room, CONSTS.COMMANDS.OFF)
    broadlinkController[room][CONSTS.COMMANDS.OFF.toLocaleLowerCase()].call(
      this
    )
    return botCommander.runCommand('start', msg)
  } else if (data.endsWith(CONSTS.COMMANDS.TV)) {
    const room = getRoomFromData(data, CONSTS.COMMANDS.TV).toLocaleLowerCase()
    logAction(msg, room, CONSTS.COMMANDS.TV)
    broadlinkController[room][CONSTS.COMMANDS.TV.toLocaleLowerCase()].call(
      this
    )
    return botCommander.runCommand('start', msg)
  } else if (data.endsWith(CONSTS.COMMANDS.LIGHTS)) {
    const room = getRoomFromData(data, CONSTS.COMMANDS.LIGHTS).toLocaleLowerCase()
    logAction(msg, room, CONSTS.COMMANDS.LIGHTS)
    broadlinkController[room][CONSTS.COMMANDS.LIGHTS.toLocaleLowerCase()].call(
      this
    )
    return botCommander.runCommand('start', msg)
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
