import { checkSingleTemperature } from '../broadlinkController'
import { sendMessage } from '../botCommander'

export default async function({ device, msg }) {
  const t = await checkSingleTemperature({ device })
  return sendMessage(msg.from.id, `${t}℃`)
}
