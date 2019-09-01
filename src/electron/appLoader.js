// Modules to control application life and create native browser window
import path from 'path'
import { app, BrowserWindow, Tray, Menu } from 'electron'
import { getDevices } from '../broadlinkController'
import { excecuteRemoteCommand } from '../multiDevices/lanCommunications'
import logger from '../logger'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let tray

async function getCommandsMenu() {
  const devices = await getDevices()

  return Object.keys(devices).map(room => {
    return {
      label: room,
      submenu: Object.keys(devices[room].commands)
        .filter(cmd => !devices[room].commands[cmd].disabled)
        .map(cmd => ({
          label: devices[room].commands[cmd].displayName,
          click: async () => {
            try {
              await excecuteRemoteCommand(room, cmd)
            } catch (e) {
              logger.error(e.message)
              logger.error(e.stack)
            }
          },
        })),
    }
  })
}

async function createTray() {
  tray = new Tray('logo.jpg')
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open',
      click: () => {
        if (mainWindow === null) {
          createWindow()
        } else {
          mainWindow.show()
        }
      },
    },
    { type: 'separator' },
    ...(await getCommandsMenu()),
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ])
  tray.setToolTip('friday')
  tray.setContextMenu(contextMenu)
  tray.on('click', () => {
    if (mainWindow === null) {
      createWindow()
    } else {
      mainWindow.show()
    }
  })
}

async function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    // webPreferences: {
    //   preload: path.join(__dirname, 'preload.js'),
    // },
  })
  mainWindow.setMenuBarVisibility(false)
  // and load the index.html of the app.
  mainWindow.loadFile(path.resolve('dist/public/index.html'))

  // Open the DevTools.
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools()
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

function createUI() {
  createTray()
  createWindow()
}

export default async () => {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createUI)

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    //   // On macOS it is common for applications and their menu bar
    //   // to stay active until the user quits explicitly with Cmd + Q
    //   if (process.platform !== 'darwin') app.quit()
  })

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) createWindow()
  })

  // In this file you can include the rest of your app's specific main process
  // code. You can also put them in separate files and require them here.
}
