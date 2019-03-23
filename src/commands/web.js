import opn from 'opn'
import puppeteer from 'puppeteer'
import {sendImage, sendMessage, getMessage, editMessage, editMessageText, runCommand} from '../botCommander'

const width = 2400
const height = 600

export async function youtube(data, args) {
  const msg = data.msg || data
  let searchTerm

  if (data.msg) {
    // msg from button
    await editMessage('What?', undefined, {
      chat_id: msg.message.chat.id,
      message_id: msg.message.message_id,
    })
    searchTerm = (await getMessage()).text.trim()
  } else {
    // msg from inline command /search
    searchTerm = args[1]
  }

  // const browser = await puppeteer.launch({headless: false})
  // const page = await browser.newPage()
  // const searchUrl = `https://www.youtube.com/results?search_query=${searchTerm}`
  // await page.goto(searchUrl)
  // const href = await page.$eval('ytd-search #contents a', a => a.getAttribute('href'))
  // await browser.close()
  const url = `https://www.youtube.com/embed?autoplay=true&listType=search&list=${searchTerm}`
  return opn(encodeURI(url))
}

export async function google(data, args) {
  const msg = data.msg || data
  let searchTerm

  if (data.msg) {
    // msg from button
    await editMessage('What?', undefined, {
      chat_id: msg.message.chat.id,
      message_id: msg.message.message_id,
    })
    searchTerm = (await getMessage()).text.trim()
  } else {
    // msg from inline command /search
    searchTerm = args[1]
  }

  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.setViewport({width, height})
  const searchUrl = `https://www.google.com/search?q=${searchTerm}`
  await page.goto(searchUrl)
  const text = (await page.$eval('#search [data-hveid]', a => a.textContent)).slice(0,1500)
  const img = await (await page.$('#search [data-hveid]')).screenshot()
  await browser.close()
  return sendImage(msg.from.id, img)
  if (text) {
    return sendMessage(msg.from.id, text)
  }
}
