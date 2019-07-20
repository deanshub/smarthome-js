import config from 'config'
import TelegramBot from 'node-telegram-bot-api'
import logger from './logger'
import { DEFAULT_COMMANDS } from './commandsConfiguration'
import { isMaster } from './multiDevices/devicesHelper'
import { executeBotRemoteCommand } from './multiDevices/lanCommunications'

const options = {
  polling: true,
  // webHook: {
  //   host: config.WEBHOOK_HOST,
  //   port: config.WEBHOOK_PORT,
  //   key: `${__dirname}/key.pem`,
  //   cert: `${__dirname}/crt.pem`,
  // },
}

let bot
if (!config.BOT_TOKEN) {
  logger.warn('BOT_TOKEN is not set')
  bot = new Proxy(
    {},
    {
      get(target, prop) {
        return () => {
          console.warn(`bot is not initialized "${prop}" will not be called`)
        }
      },
    }
  )
} else {
  bot = new TelegramBot(config.BOT_TOKEN, options)
}

function reconnect() {
  logger.info('reconnecting')
  bot.startPolling({ restart: true })
}

bot.on('polling_error', error => {
  logger.error('polling error')
  logger.error(error.code)
  logger.error(error.Error || error)
  console.error(error)
  bot.stopPolling()
  if (config.BOT_TOKEN) {
    setTimeout(reconnect, 3000)
  }
})
// bot.on('webhook_error', (error) => {
//   logger.error(error.code)
//   logger.error(error.Error || error)
// })
bot.on('error', error => {
  logger.error('general error')
  logger.error(error.code)
  logger.error(error.Error || error)
})

const allKeyboardOpts = {
  reply_markup: JSON.stringify({
    keyboard: DEFAULT_COMMANDS,
    resize_keyboard: true,
    one_time_keyboard: true,
  }),
  parse_mode: 'Markdown',
  disable_web_page_preview: true,
}

bot.on('callback_query', callbackQuery => {
  runCommand('callback', callbackQuery, callbackQuery.data)
})

function sendCommandToMaster(fn, commandName) {
  if (isMaster(config.NAME)) {
    return fn
  } else if(commandName) {
    return (...args) => executeBotRemoteCommand(commandName, ...args)
  }else {
    logger.error('no command name set when trying to send bot command to master')
  }
}

export const sendMessage = sendCommandToMaster((id, message, extraOps) => {
  return bot.sendMessage(id, message, { ...allKeyboardOpts, ...extraOps })
}, 'sendMessage')

export function sendImage(id, img, extraOps, fileOps) {
  return bot.sendPhoto(id, img, { ...allKeyboardOpts, ...extraOps }, fileOps)
}

let commands = {}
export function addCommand(command, fn) {
  const wrappedFn = command.auth
    ? withLog(command, onlyAdmins(fn))
    : withLog(command, fn)
  commands[`${command.name}.${command.fn || 'default'}`] = wrappedFn
  if (command.regex) {
    bot.onText(command.regex, wrappedFn)
  }
}

export function runCommand(command, msg, match, fnName = 'default') {
  return commands[`${command}.${fnName}`].call(this, msg, match)
}

export function editMessageReplyMarkup(replyMarkup, options) {
  return bot.editMessageReplyMarkup(replyMarkup, options)
}

export function editMessageText(text, options) {
  return bot.editMessageText(text, options)
}

export const editMessage = sendCommandToMaster(async function editMessage(
  text,
  replyMarkup,
  options
) {
  await editMessageReplyMarkup(replyMarkup, options)
  return editMessageText(text, options)
}, 'editMessage')

let cb = null
export function subscribeToMessages() {
  bot.on('message', msg => {
    if (cb) {
      return cb(msg)
    } else if (msg.text[0] !== '/') {
      // TODO: intergate reminders
      // should I remind you?
    }
  })
}
export function getMessage() {
  return new Promise((resolve, reject) => {
    const getMessageTimeout = setTimeout(() => {
      cb = null
      reject(new Error('Message not received in time'))
    }, 20000)
    cb = msg => {
      clearTimeout(getMessageTimeout)
      cb = null
      resolve(msg)
    }
  })
}

export function getChat(chatId) {
  return bot.getChat(chatId)
}

export function deleteMessage(chatId, messageId) {
  return bot.deleteMessage(chatId, messageId)
}

export function getUserFriendlyName(msg) {
  let friendlyName = ''
  if (msg.from.is_bot) {
    friendlyName += 'BOT '
  }

  if (msg.from.username) {
    friendlyName += `@${msg.from.username} `
  }

  if (msg.from.first_name) {
    friendlyName += `${msg.from.first_name} `
  }
  if (msg.from.last_name) {
    friendlyName += `${msg.from.last_name} `
  }

  return `${friendlyName}(${msg.from.id})`
}

export function isAdmin(msg) {
  return config.ADMINS_CHATID.includes(`${msg.from.id}`)
}

export function onlyAdmins(fn) {
  return (...args) => {
    if (isAdmin(args[0])) {
      return fn.apply(fn, args)
    }
    logger.info(`${getUserFriendlyName(args[0])} denied because not Admin.`)
  }
}

export function withLog(command, fn) {
  return (...args) => {
    logger.info(
      `${getUserFriendlyName(args[0])} activated "${
        command.name
      }" module's "${command.fn || 'default'}" function`
    )
    logger.info(JSON.stringify(args))
    try {
      return fn.apply(fn, args)
    } catch (err) {
      logger.error(err)
    }
  }
}
