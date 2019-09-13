import config from 'config'
import {
  getMessage,
  runCallback,
  sendMessage,
  deleteMessage,
  runCommand,
  addCallbackAction,
  editMessageText,
  editMessageReplyMarkup,
  addCallbackActionUsingMatcher,
  getUserFriendlyName,
  isAdmin,
} from '../botCommander'
import * as broadlinkController from '../broadlinkController'
import logger from '../logger'
import CONSTS from '../consts'
import {
  getRoomFromData,
  getTimeFromData,
  isRoomProp,
  getCmdFromData,
  isGroupProp,
} from './callback'
import { excecuteRemoteCommand } from '../multiDevices/lanCommunications'
import { isValidTimeText, later } from '../dateUtils'

export async function timer({ msg }) {
  const whenMessage = await sendMessage(msg.from.id, 'When?')
  try {
    const timeMessage = await getMessage()
    let timerText = timeMessage.text

    if (isValidTimeText(timerText)) {
      return runCommand('start', {
        ...timeMessage,
        timer: timerText,
      })
    } else {
      sendMessage(
        msg.from.id,
        `I don't understand what time is "${timerText}",
you can either enter the format *##:##* or *# m\\h\\d*`
      )
      return runCallback(msg)
    }
  } catch (e) {
    logger.info(e)
    return deleteMessage(whenMessage.chat.id, whenMessage.message_id)
  }
}

export async function roomCallback({ msg, data }) {
  const room = getRoomFromData(data)
  const time = getTimeFromData(data)

  const roomConfig = await broadlinkController.getRoomConfiguration(room)
  const inlineButtons = Object.keys(roomConfig.commands)
    .filter(cmd => !roomConfig.commands[cmd].disabled)
    .reduce((res, cmd, index) => {
      if (index % 3 === 0) {
        res.push([])
      }
      res[res.length - 1].push({
        text: roomConfig.commands[cmd].displayName,
        callback_data: time
          ? `${room}${CONSTS.SEPERATOR}${cmd}${CONSTS.TIME_KEY}${time}`
          : `${room}${CONSTS.SEPERATOR}${cmd}`,
      })
      return res
    }, [])

  if (inlineButtons[inlineButtons.length - 1].length < 3) {
    inlineButtons[inlineButtons.length - 1].push({
      text: CONSTS.BACK_TEXT,
      callback_data: CONSTS.BACK,
    })
  } else {
    inlineButtons.push([
      {
        text: CONSTS.BACK_TEXT,
        callback_data: CONSTS.BACK,
      },
    ])
  }

  await editMessageText(roomConfig.displayName, {
    chat_id: msg.message.chat.id,
    message_id: msg.message.message_id,
  })
  return editMessageReplyMarkup(
    {
      inline_keyboard: inlineButtons,
    },
    {
      chat_id: msg.message.chat.id,
      message_id: msg.message.message_id,
    }
  )
}

export async function groupCallback({ msg, data }) {
  // get room
  // split the data to path
  // move through the path to check if it's a group
  // show the group inline buttons
  // edit message text and reply markup
}

let adminRequestMessages = []
let adminRequestMessagesTimer
function cancelAdminRequestMessages() {
  clearTimeout(adminRequestMessagesTimer)
  adminRequestMessages.forEach(subMsg => {
    editMessageReplyMarkup(undefined, {
      chat_id: subMsg.chat.id,
      message_id: subMsg.message_id,
    })
  })
}

export async function notAuthorized({ msg, data }) {
  logger.info(
    `Not Authorized!: ${getUserFriendlyName(msg)} requested usage of "${data}"`
  )
  logger.info(JSON.stringify(msg, null, 2))
  const res = await sendMessage(msg.from.id, 'Not Authorized!')
  const authorizeKeyboard = [
    [
      {
        text: 'Authorize',
        callback_data: `${res.chat.id}${CONSTS.REQ_AUTH_KEY}${data}`,
      },
    ],
  ]
  cancelAdminRequestMessages()
  const room = getRoomFromData(data)
  const cmd = getCmdFromData(data)
  const time = getTimeFromData(data)
  const roomConfig = await broadlinkController.getRoomConfiguration(room)
  const cmdConfig = await broadlinkController.getCommandConfiguration(room, cmd)

  adminRequestMessages = await Promise.all(
    config.ADMINS_CHATID.map(adminId =>
      sendMessage(
        adminId,
        `${getUserFriendlyName(msg)} requested usage of ${
          cmdConfig.displayName
        } in ${roomConfig.displayName} ${time || ''}`,
        {
          reply_markup: JSON.stringify({
            inline_keyboard: authorizeKeyboard,
          }),
        }
      )
    )
  )
  adminRequestMessagesTimer = setTimeout(
    cancelAdminRequestMessages,
    config.AUTHORIZATION_TIMEOUT || 60 * 1000
  )

  return res
}

async function authorizedCommand({ msg, data, cmd }) {
  if (!cmd) {
    cmd = getCmdFromData(data)
  }
  cancelAdminRequestMessages()
  const authData = data.split(CONSTS.REQ_AUTH_KEY)
  const room = getRoomFromData(authData[1])
  const time = getTimeFromData(authData[1])
  logger.info(`Authorization request granted usage of "${data}"`)
  logger.logAction(msg, room, cmd)
  const roomConfig = await broadlinkController.getRoomConfiguration(room)
  const cmdConfig = await broadlinkController.getCommandConfiguration(room, cmd)
  if (time) {
    authorizedCommand({ msg, data: authData[1], cmd })
  } else {
    try {
      await broadlinkController.executeCommand(room, cmd, {
        ...msg,
        from: { ...msg.from, id: authData[0] },
      })
    } catch (e) {
      logger.error(e)
      logger.error(e.stack)
      sendMessage(msg.from.id, 'Could\'t execute command')
    }
  }
  return sendMessage(
    authData[0],
    `@${msg.from.username} authorized your request for ${
      cmdConfig.displayName
    } on ${roomConfig.displayName} ${time || ''}`
  )
}

async function scheduledCommand({ msg, data }) {
  const cmd = getCmdFromData(data)
  const room = getRoomFromData(data)
  const timeData = getTimeFromData(data)
  const roomConfig = await broadlinkController.getRoomConfiguration(room)
  const cmdConfig = await broadlinkController.getCommandConfiguration(room, cmd)
  let timeText = timeData

  const futureCommand = later(async () => {
    logger.logAction(msg, room, cmd)
    try {
      await broadlinkController.executeCommand(room, cmd, msg)
    } catch (e) {
      logger.error(e)
      logger.error(e.stack)
      sendMessage(msg.from.id, 'Could\'t execute command')
    }
    sendMessage(msg.from.id, 'Done', {
      reply_to_message_id: letKnowMessage.message_id,
    })
  }, timeText)

  logger.info(
    `${getUserFriendlyName(msg)} scheduled ${cmd} in ${room} at ${timeData}`
  )
  const letKnowMessage = await sendMessage(
    msg.from.id,
    `${cmdConfig.displayName} scheduled in ${roomConfig.displayName} in ${futureCommand.text}`
  )
  return runCommand('start', msg)
}

async function executeDeviceCommand({ msg, data }) {
  const cmd = getCmdFromData(data)
  const room = getRoomFromData(data)
  logger.logAction(msg, room, cmd)
  try {
    const cmdConfig = await broadlinkController.getCommandConfiguration(
      room,
      cmd
    )
    // if remote command use excecuteRemoteCommand
    if (cmdConfig.remote && config.NAME !== room) {
      await excecuteRemoteCommand(room, cmd, msg)
    } else {
      await broadlinkController.executeCommand(room, cmd, msg)
    }
  } catch (e) {
    logger.error(e)
    logger.error(e.stack)
    sendMessage(msg.from.id, 'Could\'t execute command')
  }
  return runCommand('start', msg)
}

addCallbackAction(CONSTS.TIMER, timer)
addCallbackActionUsingMatcher(isRoomProp, roomCallback)
addCallbackActionUsingMatcher(isGroupProp, groupCallback)
addCallbackActionUsingMatcher(async ({ msg }) => !isAdmin(msg), notAuthorized)
addCallbackActionUsingMatcher(
  async ({ data }) => data.includes(CONSTS.REQ_AUTH_KEY),
  authorizedCommand
)
addCallbackActionUsingMatcher(
  async ({ data }) => data.includes(CONSTS.TIME_KEY),
  scheduledCommand
)
addCallbackActionUsingMatcher(async () => true, executeDeviceCommand)
