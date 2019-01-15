import {sendMessage} from '../botCommander'
import logger from '../logger'
import {isAdmin} from './callback'
import fs from 'fs-extra'
import path from 'path'

export default async function(msg) {
  if (isAdmin(msg)){
    const fromId = msg.from.id
    const files = logger.transports[0].logStream.auditLog.files
    const log = await fs.readFile(path.join(__dirname, '../..',files[files.length -1].name))
    const logLines = log.toString().split('\n')
    let message = []
    logLines.forEach((line, index, logLines) => {
      message.push(line)
      if (index===logLines.length -1) {
        sendMessage(fromId, message.join('\n'))
      }else if (index!==0 && (index % 10) === 0) {
        sendMessage(fromId, message.join('\n'))
        message = []
      }
    })
  }
}
