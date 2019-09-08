import addDays from 'date-fns/addDays'
import addMinutes from 'date-fns/addMinutes'
import addHours from 'date-fns/addHours'
import setHours from 'date-fns/setHours'
import setMinutes from 'date-fns/setMinutes'
import isFuture from 'date-fns/isFuture'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import formatDistance from 'date-fns/formatDistance'

const timeRegexString = '(?<hours>\\d?\\d):(?<minutes>\\d\\d)'
const timeRegex = new RegExp(`^${timeRegexString}$`)
const addRegex = /^(?<amount>\d+) ?(?<period>[mhd]|minutes?|hours?|days?)$/i
const dateRegexString =
  '( ?(?<day>\\d?\\d)(\\/|\\.)(?<month>\\d?\\d)((\\/|\\.)(?<year>(\\d\\d)?\\d\\d))?( |$))'
const dateTimeRegex1 = new RegExp(`^${dateRegexString}${timeRegexString}$`)
const dateTimeRegex2 = new RegExp(`^${timeRegexString}${dateRegexString}$`)

export function isValidTimeText(text) {
  const timeText = text.trim()
  return (
    timeRegex.test(timeText) ||
    addRegex.test(timeText) ||
    dateTimeRegex1.test(timeText) ||
    dateTimeRegex2.test(timeText)
  )
}

export function later(fn, text) {
  const timeText = text.trim()
  const nowDate = Date.now()
  let futureDate
  if (timeRegex.test(timeText)) {
    futureDate = getTimeActivationDate(timeText, nowDate)
  } else if (addRegex.test(timeText)) {
    futureDate = getAdditionActivationDate(timeText, nowDate)
  } else if (dateTimeRegex1.test(timeText) || dateTimeRegex2.test(timeText)) {
    futureDate = getDateTimeActivationDate(timeText)
  } else {
    throw new Error(`unexpected date "${text}"`)
  }
  return {
    text: formatDistanceToNow(futureDate),
    timeout:
      futureDate - nowDate > 2147483647
        ? setTimeout(() => {
          later(fn, `${Math.floor((futureDate - new Date()) / 1000)}s`)
        }, 2147483647)
        : setTimeout(fn, futureDate - nowDate),
    futureDate,
  }
}

function getAdditionActivationDate(additionTimeText, fromDate = Date.now()) {
  const result = addRegex.exec(additionTimeText)
  const amount = parseInt(result.groups.amount)
  const period = result.groups.period.toLocaleLowerCase()

  let func
  if (period === 'm' || period.startsWith('minute')) {
    func = addMinutes
  } else if (period === 'h' || period.startsWith('hour')) {
    func = addHours
  } else if (period === 'd' || period.startsWith('day')) {
    func = addDays
  }

  return func(fromDate, amount)
}

function getTimeActivationDate(timeText, fromDate = Date.now()) {
  const result = timeRegex.exec(timeText)
  const { hours, minutes } = result.groups

  const futureDate = setMinutes(setHours(new Date(fromDate), hours), minutes)
  return isFuture(futureDate) ? futureDate : addDays(futureDate, 1)
}

function getDateTimeActivationDate(timeText) {
  const result = dateTimeRegex1.exec(timeText) || dateTimeRegex2.exec(timeText)
  const { day, month, year, hours, minutes } = result.groups
  const futureDate = new Date(
    year || new Date().getFullYear(),
    month,
    day,
    hours,
    minutes
  )
  return futureDate
}

export function distanceInWords(from, to) {
  return formatDistance(from, to)
}
