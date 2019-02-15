import opn from 'opn'

export default async function({url}) {
  return opn(url)
}
