import './winston-workaround'
import winston from 'winston'
import 'winston-daily-rotate-file'

const {  combine, timestamp, printf } = winston.format
const logFormat = printf(info => `${info.timestamp} [${info.level}]: ${info.message}`)

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log`
    // - Write all logs error (and below) to `error.log`.
    //
    // new winston.transports.File({ filename: 'error.log', level: 'error' }),
    // new winston.transports.File({ filename: 'combined.log' }),
    new (winston.transports.DailyRotateFile)({
      dirname: './logs',
      filename: 'application-%DATE%.log',
      json: true,
      datePattern: 'YYYY-MM-DD-HH',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: combine(timestamp(), logFormat),
    }),
  ],
})

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
// if (process.env.NODE_ENV !== 'production') {
logger.add(new winston.transports.Console({
  format: combine(timestamp(), logFormat),
}))
// }

export default logger
