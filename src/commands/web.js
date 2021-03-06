import opn from 'opn'
import puppeteer from 'puppeteer'
import {
  sendImage,
  sendMessage,
  getMessage,
  editMessage,
} from '../botCommander'

const puppeteerOptions = {
  width: 2400,
  height: 600,
  headless: true,
}

const allKeyboardOpts = {
  reply_markup: JSON.stringify({
    keyboard: [['/start', '/rediscover', '/help']],
    resize_keyboard: true,
  }),
  parse_mode: '',
}

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

  // const browser = await puppeteer.launch({headless})
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

  const { img, text } = await puppeteerSearch(searchTerm)

  if (text) {
    return Promise.all([
      sendImage(msg.from.id, img, allKeyboardOpts),
      sendMessage(msg.from.id, text, allKeyboardOpts),
    ])
  }
  return sendImage(msg.from.id, img)
}

export async function puppeteerSearch(searchTerm) {
  const browser = await puppeteer.launch({
    headless: puppeteerOptions.headless,
  })
  const page = await browser.newPage()
  await page.setViewport({
    width: puppeteerOptions.width,
    height: puppeteerOptions.height,
  })
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
    searchTerm
  )}`
  await page.goto(searchUrl)

  const rhsElement = await page.$('#rhs [data-hveid]')
  let text
  let img
  if (rhsElement) {
    text = (await page.$eval('#rhs [data-hveid]', a => a.textContent)).slice(
      0,
      1500
    )
    img = await rhsElement.screenshot()
  } else {
    text = (await page.$eval('#search [data-hveid]', a => a.textContent)).slice(
      0,
      1500
    )
    img = await (await page.$('#search [data-hveid]')).screenshot()
  }
  await browser.close()
  return { text, img }
}

export async function browser(data, args) {
  const msg = data.msg || data
  let url

  if (data.msg) {
    // msg from button
    await editMessage('What?', undefined, {
      chat_id: msg.message.chat.id,
      message_id: msg.message.message_id,
    })
    url = (await getMessage()).text.trim()
  } else {
    // msg from inline command /search
    url = args[1]
  }

  return opn(encodeURI(url))
}
