import config from 'config'
import * as botCommander from '../botCommander'
import * as broadlinkController from '../broadlinkController'
import CONSTS from '../consts'
import logger from '../logger'
import later from 'later'
later.date.localTime()

function getRoomFromData(data) {
  const withoutTime = data.split(CONSTS.TIME_KEY)[0]
  return withoutTime.split(CONSTS.SEPERATOR)[0]
}
function getCmdFromData(data) {
  const withoutTime = data.split(CONSTS.TIME_KEY)[0]
  return withoutTime.split(CONSTS.SEPERATOR)[1]
}
function getTimeFromData(data) {
  return data.split(CONSTS.TIME_KEY)[1]
}

export function isAdmin(msg) {
  return config.ADMINS_CHATID.includes(`${msg.from.id}`)
}

const logAction = (msg, room, action) => {
  logger.info(`${botCommander.getUserFriendlyName(msg)} called ${action} in ${room}`)
}

async function executeCommand(msg, data, cmd){
  if (data.includes(CONSTS.REQ_AUTH_KEY)){
    cancelAdminRequestMessages()
    const authData = data.split(CONSTS.REQ_AUTH_KEY)
    const room = getRoomFromData(authData[1])
    const time = getTimeFromData(authData[1])
    logger.info(`Authorization request granted usage of "${data}"`)
    logAction(msg, room, cmd)
    const roomConfig = await broadlinkController.getRoomConfiguration(room)
    const cmdConfig = await broadlinkController.getCommandConfiguration(room, cmd)
    if (time) {
      executeCommand(msg, authData[1], cmd)
    }else{
      try {
        await broadlinkController.executeCommand(room, cmd, msg)
      } catch (e) {
        logger.error(e)
        logger.error(e.stack)
        botCommander.sendMessage(msg.from.id, 'Could\'t execute command')
      }
    }
    return botCommander.sendMessage(authData[0], `@${msg.from.username} authorized your request for ${cmdConfig.displayName} on ${roomConfig.displayName} ${time||''}`)
  } else if (data.includes(CONSTS.TIME_KEY)) {
    const room = getRoomFromData(data)
    const timeData = getTimeFromData(data)
    const roomConfig = await broadlinkController.getRoomConfiguration(room)
    const cmdConfig = await broadlinkController.getCommandConfiguration(room, cmd)
    let timeText = timeData

    if (/^\d/.test(timeData)){
      timeText = `at ${timeData}`
    }

    const time = later.parse.text(timeText)
    logger.info(`${botCommander.getUserFriendlyName(msg)} scheduled ${cmd} in ${room} at ${timeData}`)
    const letKnowMessage = await botCommander.sendMessage(msg.from.id, `${cmdConfig.displayName} scheduled in ${roomConfig.displayName} ${timeText}`)
    later.setTimeout(async () => {
      logAction(msg, room, cmd)
      try {
        await broadlinkController.executeCommand(room, cmd, msg)
      } catch (e) {
        logger.error(e)
        logger.error(e.stack)
        botCommander.sendMessage(msg.from.id, 'Could\'t execute command')
      }
      botCommander.sendMessage(msg.from.id, 'Done', {reply_to_message_id: letKnowMessage.message_id})
    }, time)
    return botCommander.runCommand('start', msg)
  } else {
    const room = getRoomFromData(data)
    logAction(msg, room, cmd)
    try {
      await broadlinkController.executeCommand(room, cmd, msg)
    } catch (e) {
      logger.error(e)
      logger.error(e.stack)
      botCommander.sendMessage(msg.from.id, 'Could\'t execute command')
    }
    return botCommander.runCommand('start', msg)
  }
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

async function isRoomProp(data) {
  if (!data.includes(CONSTS.SEPERATOR)){
    const devices = await broadlinkController.getDevices()
    const roomPart = data.split(CONSTS.TIME_KEY)[0]
    return Object.keys(devices).includes(roomPart)
  }
  return false
}

export default async function callback(msg, data) {
  if (data === CONSTS.BACK) {
    return botCommander.runCommand('start', msg)
  } else if (data === CONSTS.TIMER) {
    const whenMessage = await botCommander.sendMessage(msg.from.id, 'When?')
    try {
      const timeMessage = await botCommander.getMessage()
      let timerText = timeMessage.text
      if (/^\d/.test(timeMessage.text)){
        timerText = `at ${timeMessage.text}`
      }

      if (later.parse.text(timerText).error===-1){
        return botCommander.runCommand('start', {...timeMessage, timer: timerText})
      } else {
        botCommander.sendMessage(msg.from.id, `I don't understand what time is ${timerText}`)
        return callback(msg, data)
      }
    }catch(e){
      logger.info(e)
      return botCommander.deleteMessage(whenMessage.chat.id, whenMessage.message_id)
    }
  } else if (await isRoomProp(data)) {
    const room = getRoomFromData(data)
    const time = getTimeFromData(data)

    const roomConfig = await broadlinkController.getRoomConfiguration(room)
    const inlineButtons = Object.keys(roomConfig.commands)
      .filter(cmd => !roomConfig.commands[cmd].disabled)
      .reduce((res, cmd, index)=>{
        if (index % 3 === 0) {
          res.push([])
        }
        res[res.length - 1].push({
          text: roomConfig.commands[cmd].displayName,
          callback_data: time ?
            `${room}${CONSTS.SEPERATOR}${cmd}${CONSTS.TIME_KEY}${time}`
            :
            `${room}${CONSTS.SEPERATOR}${cmd}`,
        })
        return res
      }, [])

    if (inlineButtons[inlineButtons.length-1].length<3) {
      inlineButtons[inlineButtons.length-1].push({
        text: CONSTS.BACK_TEXT,
        callback_data: CONSTS.BACK,
      })
    } else {
      inlineButtons.push([{
        text: CONSTS.BACK_TEXT,
        callback_data: CONSTS.BACK,
      }])
    }

    await botCommander.editMessageText(
      roomConfig.displayName,
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
  } else if (!isAdmin(msg)) {
    logger.info(`Not Authorized!: ${botCommander.getUserFriendlyName(msg)} requested usage of "${data}"`)
    logger.info(JSON.stringify(msg, null, 2))
    const res = await botCommander.sendMessage(msg.from.id, 'Not Authorized!')
    const authorizeKeyboard = [[{
      text: 'Authorize',
      callback_data: `${res.chat.id}${CONSTS.REQ_AUTH_KEY}${data}`,
    }]]
    cancelAdminRequestMessages()
    const room = getRoomFromData(data)
    const cmd = getCmdFromData(data)
    const time = getTimeFromData(data)
    const roomConfig = await broadlinkController.getRoomConfiguration(room)
    const cmdConfig = await broadlinkController.getCommandConfiguration(room, cmd)

    adminRequestMessages = await Promise.all(config.ADMINS_CHATID.map(adminId =>
      botCommander.sendMessage(
        adminId,
        `${botCommander.getUserFriendlyName(msg)} requested usage of ${cmdConfig.displayName} in ${roomConfig.displayName} ${time||''}`,
        {reply_markup: JSON.stringify({inline_keyboard: authorizeKeyboard})},
      )
    ))
    adminRequestMessagesTimer = setTimeout(cancelAdminRequestMessages, (config.AUTHORIZATION_TIMEOUT || (60*1000)))

    return res
  } else {
    const cmd = getCmdFromData(data)
    return executeCommand(msg, data, cmd)
    // logger.error(`${botCommander.getUserFriendlyName(msg)} called unknown command "${data}"`)
  }
}
