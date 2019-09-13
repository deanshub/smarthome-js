import { sendSignal } from '../broadlinkController'

let onSignal = 'bed30.deg'
let active = false
export async function off({ device }) {
  active = false
  await sendSignal({ device, signal: onSignal })
}

export async function on({ device, signal }) {
  onSignal = signal
  if (active && signal === 'bed25.deg') {
    signal = 'bedTo25.deg'
  } else if (active && signal === 'bed24.deg') {
    signal = 'bedTo24.deg'
  }
  active = true
  return sendSignal({ device, signal })
}
