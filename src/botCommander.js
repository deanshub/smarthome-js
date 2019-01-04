import config from "config";
import TelegramBot from "node-telegram-bot-api";
import logger from "./logger";

const options = {
  polling: true
  // webHook: {
  //   host: config.WEBHOOK_HOST,
  //   port: config.WEBHOOK_PORT,
  //   key: `${__dirname}/key.pem`,
  //   cert: `${__dirname}/crt.pem`,
  // },
};
const bot = new TelegramBot(config.BOT_TOKEN, options);

bot.on("polling_error", error => {
  logger.error(error.code);
  logger.error(error.Error || error);
});
// bot.on('webhook_error', (error) => {
//   logger.error(error.code)
//   logger.error(error.Error || error)
// })
bot.on("error", error => {
  logger.error(error.code);
  logger.error(error.Error || error);
});

const allKeyboardOpts = {
  reply_markup: JSON.stringify({
    keyboard: [
      ["/start", "/help"]
      // ['/off','/cold','/hot','/temp'],
    ],
    resize_keyboard: true,
    one_time_keyboard: true
  }),
  parse_mode: "Markdown",
  disable_web_page_preview: true
};

bot.on("callback_query", callbackQuery => {
  runCommand("callback", callbackQuery, callbackQuery.data);
});

export function sendMessage(id, message, extraOps) {
  return bot.sendMessage(id, message, { ...allKeyboardOpts, ...extraOps });
}

let commands = {};
export function addCommand(command, fn) {
  commands[`${command.name}.${command.fn || "default"}`] = fn;
  if (command.regex) {
    bot.onText(command.regex, fn);
  }
}

export function runCommand(command, msg, match, fnName = "default") {
  return commands[`${command}.${fnName}`].call(this, msg, match);
}

export function editMessageReplyMarkup(replyMarkup, options) {
  return bot.editMessageReplyMarkup(replyMarkup, options);
}

export function editMessageText(text, options) {
  return bot.editMessageText(text, options);
}

export default {
  sendMessage,
  addCommand,
  runCommand,
  editMessageReplyMarkup,
  editMessageText
};
