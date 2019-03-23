import {sendMessage, isAdmin} from '../botCommander'
import logger from '../logger'
import fs from 'fs-extra'
import path from 'path'

const allKeyboardOpts = {
  reply_markup: JSON.stringify({
    keyboard: [
      ['/start', '/rediscover', '/help'],
    ],
    resize_keyboard: true,
  }),
  parse_mode: '',
}

export default async function(msg, values) {
  if (isAdmin(msg)){
    const fromId = msg.from.id
    const files = logger.transports[0].logStream.auditLog.files
    const days = values[1] ? parseInt(values[1].trim()) : 1
    const logs = await Promise.all(Array.from(Array(days)).map((_, index)=>{
      if (files[files.length - (index+1)]) {
        return fs.readFile(path.join(__dirname, '../..', files[files.length - (index+1)].name))
      }
      return ''
    }))
    const logLines = logs.reduce((res, l)=>{
      return res.concat(l.toString().split('\n'))
    },[])
    let message = []
    logLines.forEach((line, index, logLines) => {
      message.push(line)
      if (index === logLines.length - 1) {
        sendMessage(fromId, message.join('\n'), allKeyboardOpts)
        message = []
      }else if ((index !== 0) && (index % 10) === 0) {
        sendMessage(fromId, message.join('\n'), allKeyboardOpts)
        message = []
      }
    })
  }
}
