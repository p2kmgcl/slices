const electron = require('electron')
const path = require('path')
const url = require('url')
const startTwitterStream = require('./twitter-stream')

const index = path.resolve(`${__dirname}/../ui/index.html`)
const app = electron.app
const BrowserWindow = electron.BrowserWindow
let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    autoHideMenuBar: true
  })
  mainWindow.loadURL(url.format({
    pathname: index,
    protocol: 'file:',
    slashes: true
  }))
  mainWindow.on('closed', function () {
    mainWindow = null
  })
  startTwitterStream(mainWindow)
}

app.on('ready', createWindow)
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})
