import config from 'config'
import TelegramBot from 'node-telegram-bot-api'
import logger from './logger'

const options = {
  polling: true,
  // webHook: {
  //   host: config.WEBHOOK_HOST,
  //   port: config.WEBHOOK_PORT,
  //   key: `${__dirname}/key.pem`,
  //   cert: `${__dirname}/crt.pem`,
  // },
}
const bot = new TelegramBot(config.BOT_TOKEN, options)

function reconnect() {
  logger.info('reconnecting')
  bot.startPolling({restart: true})
}

bot.on('polling_error', error => {
  logger.error('polling error')
  logger.error(error.code)
  logger.error(error.Error || error)
  console.error(error)
  bot.stopPolling()
  setTimeout(reconnect, 3000)
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
    keyboard: [
      ['/start', '/rediscover', '/help'],
    ],
    resize_keyboard: true,
    one_time_keyboard: true,
  }),
  parse_mode: 'Markdown',
  disable_web_page_preview: true,
}

bot.on('callback_query', callbackQuery => {
  runCommand('callback', callbackQuery, callbackQuery.data)
})

export function sendMessage(id, message, extraOps) {
  return bot.sendMessage(id, message, { ...allKeyboardOpts, ...extraOps })
}

export function sendImage(id, img, extraOps, fileOps) {
  return bot.sendPhoto(id, img, { ...allKeyboardOpts, ...extraOps }, fileOps)
}

let commands = {}
export function addCommand(command, fn) {
  commands[`${command.name}.${command.fn || 'default'}`] = fn
  if (command.regex) {
    bot.onText(command.regex, fn)
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

export async function editMessage(text, replyMarkup, options) {
  await editMessageReplyMarkup(replyMarkup, options)
  return editMessageText(text, options)
}

let cb
export function subscribeToMessages(){
  bot.on('message', (msg) => {
    if (cb) {
      cb(msg)
    }
  })
}
export function getMessage() {
  return new Promise((resolve, reject) => {
    const getMessageTimeout = setTimeout(()=>reject(new Error('Message not received in time')), 20000)
    cb = (msg) => {
      clearTimeout(getMessageTimeout)
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
    friendlyName+='BOT '
  }

  if (msg.from.username) {
    friendlyName+=`@${msg.from.username} `
  }

  if (msg.from.first_name) {
    friendlyName+=`${msg.from.first_name} `
  }
  if (msg.from.last_name) {
    friendlyName+=`${msg.from.last_name} `
  }

  return `${friendlyName}(${msg.from.id})`
}
