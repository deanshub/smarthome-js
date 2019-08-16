import { checkSingleTemperature } from '../src/broadlinkController'
import { sendMessage } from '../src/botCommander'

export default async function({ device, msg }) {
  const t = await checkSingleTemperature({ device })
  return sendMessage(msg.from.id, `${t}℃`)
}
