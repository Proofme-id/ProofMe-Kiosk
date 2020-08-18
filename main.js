"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var path = require("path");
var url = require("url");
var USBRelay = require("@josephdadams/usbrelay");
var relay;
var win = null;
var args = process.argv.slice(1), serve = args.some(function (val) { return val === '--serve'; });
function createWindow() {
    var electronScreen = electron_1.screen;
    var display = electronScreen.getPrimaryDisplay();
    var displays = electronScreen.getAllDisplays();
    console.log("Displays:" + JSON.stringify(displays));
    var size = electronScreen.getPrimaryDisplay().workAreaSize;
    var width;
    var height;
    console.log("Display: ");
    console.log("Width: " + size.width);
    console.log("Height: " + size.height);
    console.log("Rotate: " + display.rotation);
    // Create the browser window.
    win = new electron_1.BrowserWindow({
        x: 0,
        y: 0,
        // width: (serve) ? size.width : size.height,
        // height: (serve) ? size.height : size.width,
        height: (serve) ? size.width : size.height,
        width: (serve) ? size.height : size.width,
        frame: false,
        kiosk: (serve) ? false : true,
        webPreferences: {
            nodeIntegration: true,
            allowRunningInsecureContent: (serve) ? true : false,
        },
    });
    if (serve) {
        win.webContents.openDevTools();
        require('electron-reload')(__dirname, {
            electron: require(__dirname + "/node_modules/electron")
        });
        win.loadURL('http://localhost:4208');
    }
    else {
        win.loadURL(url.format({
            pathname: path.join(__dirname, 'dist/index.html'),
            protocol: 'file:',
            slashes: true
        }));
    }
    // Emitted when the window is closed.
    win.on('closed', function () {
        // Dereference the window object, usually you would store window
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });
    return win;
}
try {
    electron_1.app.allowRendererProcessReuse = true;
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    // Added 400 ms to fix the black background issue while using transparent window. More details at https://github.com/electron/electron/issues/15947
    electron_1.app.on('ready', function () { return setTimeout(createWindow, 400); });
    // Quit when all windows are closed.
    electron_1.app.on('window-all-closed', function () {
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
            electron_1.app.quit();
        }
    });
    electron_1.app.on('activate', function () {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (win === null) {
            createWindow();
        }
    });
}
catch (e) {
    // Catch Error
    // throw e;
}
// const relays = USBRelay.Relays
// console.log("Relays:", relays)
// connectToRelay()
try {
    relay = new USBRelay();
    console.log("Relay: ", relay);
    relay.setState(1, true);
    setTimeout(function () {
        relay.setState(1, false);
    }, 1000);
}
catch (e) {
    console.log("Could not switch relay:", e);
}
electron_1.ipcMain.on('activate', function (event, slot) {
    try {
        console.log('Activate ' + slot);
        if (relay != undefined) {
            relay.setState(slot, true);
            event.returnValue = 'ok';
        }
        else {
            event.returnValue = 'nok';
        }
    }
    catch (e) {
        console.log("Activate failed: ", e);
        relay = undefined;
        event.returnValue = 'nok';
    }
});
electron_1.ipcMain.on('deactivate', function (event, slot) {
    try {
        console.log('Deactivate ' + slot);
        if (relay != undefined) {
            relay.setState(slot, false);
            event.returnValue = 'ok';
        }
        else {
            event.returnValue = 'nok';
        }
    }
    catch (e) {
        console.log("Deactivate failed: ", e);
        relay = undefined;
        event.returnValue = 'nok';
    }
});
electron_1.ipcMain.on('relays', function (event, arg) {
    console.log('Get relays');
    try {
        // connect to first relay
        if (relay == undefined) {
            relay = new USBRelay();
            console.log("Relay: ", relay);
        }
        var relays = USBRelay.Relays;
        console.log("usbRelay loaded: relays:", relays);
        event.returnValue = relays;
    }
    catch (e) {
        console.log("Get Relays failed: ", e);
        relay = undefined;
        event.returnValue = [];
    }
});
//# sourceMappingURL=main.js.map