import addDays from 'date-fns/addDays'
import addMinutes from 'date-fns/addMinutes'
import addHours from 'date-fns/addHours'
import setHours from 'date-fns/setHours'
import setMinutes from 'date-fns/setMinutes'
import isFuture from 'date-fns/isFuture'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import formatDistance from 'date-fns/formatDistance'

const timeRegex = /(\d?\d):(\d\d)/
const addRegex = /(\d+) ?([mhd]|minutes?|hours?|days?)/i
const dateRegex = / ?(\d?\d)(\/|\.)(\d?\d)((\/|\.)((\d\d)?\d\d))?( |$)/

export function isValidTimeText(text) {
  const timeText = text.trim()
  return timeRegex.test(timeText) || addRegex.test(timeText)
}

export function later(fn, text) {
  const timeText = text.trim()
  const nowDate = Date.now()
  let futureDate
  if (timeRegex.test(timeText)) {
    futureDate = getTimeActivationDate(timeText, nowDate)
  } else if (addRegex.test(timeText)) {
    futureDate = getAdditionActivationDate(timeText, nowDate)
  } else {
    throw new Error(`unexpected date "${text}"`)
  }
  return {
    text: formatDistanceToNow(futureDate),
    timeout: setTimeout(fn, futureDate - nowDate),
    futureDate,
  }
}

function getAdditionActivationDate(additionTimeText, fromDate = Date.now()) {
  const result = addRegex.exec(additionTimeText)
  const amount = parseInt(result[1])
  const period = result[2].toLocaleLowerCase()

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
  const hours = result[1]
  const minutes = result[2]

  const futureDate = setMinutes(setHours(new Date(fromDate), hours), minutes)
  return isFuture(futureDate) ? futureDate : addDays(futureDate, 1)
}

export function distanceInWords(from, to) {
  return formatDistance(from, to)
}
