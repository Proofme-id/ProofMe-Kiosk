import { app, BrowserWindow, screen, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';
const USBRelay = require("@josephdadams/usbrelay");

let relay: any;
let win: BrowserWindow = null;
const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve');

function createWindow(): BrowserWindow {


  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: (serve) ? true : false,
    },
  });

  win.webContents.openDevTools();

  if (serve) {

    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL('http://localhost:4208');

  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  return win;
}

try {

  app.allowRendererProcessReuse = true;

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More details at https://github.com/electron/electron/issues/15947
  app.on('ready', () => setTimeout(createWindow, 400));

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });
} catch (e) {
  // Catch Error
  // throw e;
}

// const relays = USBRelay.Relays
// console.log("Relays:", relays)

// connectToRelay()

try {
  relay = new USBRelay();
  console.log("Relay: ", relay)
  relay.setState(1, true);

  setTimeout(function () {
    relay.setState(1, false);
  }, 1000);
} catch (e) {
  console.log("Could not switch relay:", e)
}

ipcMain.on('activate', (event, slot) => {
  try {
    console.log('Activate ' + slot)
    if (relay != undefined) {
      relay.setState(slot, true);
      event.returnValue = 'ok'
    } else {
      event.returnValue = 'nok'
    }
  } catch (e) {
    console.log("Activate failed: ", e)
    relay = undefined
    event.returnValue = 'nok'
  }
})

ipcMain.on('deactivate', (event, slot) => {
  try {
    console.log('Deactivate ' + slot)
    if (relay != undefined) {
      relay.setState(slot, false);
      event.returnValue = 'ok'
    } else {
      event.returnValue = 'nok'
    }
  } catch (e) {
    console.log("Deactivate failed: ", e)
    relay = undefined
    event.returnValue = 'nok'
  }
})

ipcMain.on('relays', (event, arg) => {
  console.log('Get relays')
  try {
    // connect to first relay
    if (relay == undefined) {
      relay = new USBRelay();
      console.log("Relay: ", relay)
    }
    const relays = USBRelay.Relays
    console.log("usbRelay loaded: relays:", relays)
    event.returnValue = relays

  } catch (e) {
    console.log("Get Relays failed: ", e)
    relay = undefined
    event.returnValue = []
  }

})
