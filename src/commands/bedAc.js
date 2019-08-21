import { sendSignal } from '../broadlinkController'

let onSignal = 'bed30.deg'
export async function off({ device }) {
  await sendSignal({ device, signal: onSignal })
}

export async function on({ device, signal }) {
  onSignal = signal
  await sendSignal({ device, signal })
}
