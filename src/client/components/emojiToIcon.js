import { faTemperatureHigh } from '@fortawesome/free-solid-svg-icons/faTemperatureHigh'
import { faTemperatureLow } from '@fortawesome/free-solid-svg-icons/faTemperatureLow'
import { faTv } from '@fortawesome/free-solid-svg-icons/faTv'
import { faPowerOff } from '@fortawesome/free-solid-svg-icons/faPowerOff'
import { faThermometer } from '@fortawesome/free-solid-svg-icons/faThermometer'
import { faGraduationCap } from '@fortawesome/free-solid-svg-icons/faGraduationCap'
import { faCouch } from '@fortawesome/free-solid-svg-icons/faCouch'
import { faVideo } from '@fortawesome/free-solid-svg-icons/faVideo'
import { faGlobe } from '@fortawesome/free-solid-svg-icons/faGlobe'
import { faVolumeDown } from '@fortawesome/free-solid-svg-icons/faVolumeDown'
import { faVolumeMute } from '@fortawesome/free-solid-svg-icons/faVolumeMute'
import { faVolumeUp } from '@fortawesome/free-solid-svg-icons/faVolumeUp'
import { faCamera } from '@fortawesome/free-solid-svg-icons/faCamera'
import { faUserLock } from '@fortawesome/free-solid-svg-icons/faUserLock'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons/faArrowLeft'
import { faSearch } from '@fortawesome/free-solid-svg-icons/faSearch'
import { faFlag } from '@fortawesome/free-solid-svg-icons/faFlag'

const emojis = [
  '☀️',
  '❄️',
  '📺',
  '💀',
  '🌡',
  '🎓',
  '🌅',
  '📽',
  '🌐',
  '🔈',
  '🔇',
  '🔊',
  '📸',
  '🔒',
  '👈',
  '🔍',
  '💡',
  '🛏️',
  '🛋️',
  '🖥️',
  '👶',
]
const icons = [
  faTemperatureHigh,
  faTemperatureLow,
  faTv,
  faPowerOff,
  faThermometer,
  faGraduationCap,
  faCouch,
  faVideo,
  faGlobe,
  faVolumeDown,
  faVolumeMute,
  faVolumeUp,
  faCamera,
  faUserLock,
  faArrowLeft,
  faSearch,
  faFlag,
]
const emojiFinder = new RegExp(`(${emojis.join('|')})`)
const emojiToIcon = emoji => {
  const i = emojis.findIndex(e => e === emoji)
  return icons[i]
}
export const parseText = text => {
  const clearedText = text.replace(emojiFinder, '').trim()
  const result = emojiFinder.exec(text)

  return {
    clearedText,
    icon: emojiToIcon(result && result[1]),
  }
}
