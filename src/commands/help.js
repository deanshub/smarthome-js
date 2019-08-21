import commandsConfig from '../commandsConfiguration'
import { sendMessage } from '../botCommander'

const commandsDescription = commandsConfig
  .filter(command => !command.disabled && command.description)
  .map(command => {
    const mdParams =
      command.params &&
      command.params.map(param => `_<${param.toUpperCase()}>_`).join(' ')
    const paramsStr = mdParams ? ` ${mdParams}` : ''
    return `/${command.name}${paramsStr} - ${command.description}`
  })
  .join('\n')

const helpIntro = `Hi, I'm *Friday*
This is what I can do:`

// const examples = `*Examples:*
// /stock fb
// /info fb
// /add fb
// /add aapl
// /graph wix 1y
// /time at 10:00
// /predict 1 7 5 1 h
// For more information on _<TIME>_, see http://bunkat.github.io/later/assets/img/Schedule.png`

const helpMessage = [helpIntro, commandsDescription].join('\n')

export default function(msg) {
  const fromId = msg.from.id
  sendMessage(fromId, helpMessage, { disable_web_page_preview: false })
}
