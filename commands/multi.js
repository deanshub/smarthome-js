import { sendSignal } from '../src/broadlinkController'

export default function({ device, signals }) {
  return Promise.all(signals.map(signal => sendSignal({ device, signal })))
}
