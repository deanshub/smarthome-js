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
    return sendMessage(fromId, log)
  }
}
