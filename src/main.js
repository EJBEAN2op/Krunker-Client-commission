/* eslint-disable no-unused-vars */
/*
*   v1.0.2
*/
const { app, BrowserWindow, screen, clipboard, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const krunkerurl = 'https://krunker.io/';
const Store = require('electron-store');
const store = new Store();
const shortcuts = require('electron-localshortcut');
const { evalURL } = require('./utils');
const { autoUpdate } = require('./utils/autoUpdate');
const { initSwapper, attachSwapper } = require('./utils/swapper');

// modifying chromium
app.commandLine.appendSwitch('disable-frame-rate-limit');
app.commandLine.appendSwitch('ignore-gpu-blacklist');
app.commandLine.appendSwitch('disable-breakpad');
app.commandLine.appendSwitch('disable-component-update');
app.commandLine.appendSwitch('disable-print-preview');
app.commandLine.appendSwitch('disable-metrics');
app.commandLine.appendSwitch('disable-metrics-repo');
app.commandLine.appendSwitch('enable-javascript-harmony');
app.commandLine.appendSwitch('enable-future-v8-vm-features');
app.commandLine.appendSwitch('enable-webgl2-compute-context');
app.commandLine.appendSwitch('disable-hang-monitor');
app.commandLine.appendSwitch('no-referrers');
app.commandLine.appendSwitch('renderer-process-limit', 100);
app.commandLine.appendSwitch('max-active-webgl-contexts', 100);
app.commandLine.appendSwitch('enable-quic');
app.commandLine.appendSwitch('high-dpi-support', 1);
app.commandLine.appendSwitch('ignore-gpu-blacklist');
app.commandLine.appendSwitch('disable-2d-canvas-clip-aa');
app.commandLine.appendSwitch('disable-bundled-ppapi-flash');
app.commandLine.appendSwitch('disable-logging');
app.commandLine.appendSwitch('disable-web-security');
app.commandLine.appendSwitch('webrtc-max-cpu-consumption-percentage=100');


// prevents multiple instances
if (!app.requestSingleInstanceLock()) app.quit();

let game = null;
let splash = null;
const social = null;
let internetConnection = true;
let errText;
// functions

/**
 * Keyboard shortcuts binder
 * @returns game window object
 */

function createShortcutKeys() {
    const contents = game.webContents;
    const clipboardURL = clipboard.readText();
    const type = evalURL(clipboardURL);
    shortcuts.register(game, 'Escape', () => contents.executeJavaScript('document.exitPointerLock()', true));
    shortcuts.register(game, 'F5', () => contents.reload()); // reload page
    shortcuts.register(game, 'Shift+F5', () => contents.reloadIgnoringCache());
    shortcuts.register(game, 'F11', () => game.isFullScreen() ? game.setFullScreen(false) : game.setFullScreen(true)); // toggle fullscreen
    //     if (!game.isFullScreen()) game.setFullScreen(true);
    //     else game.setFullScreen(false);
    // });
    shortcuts.register(game, 'F2', () => clipboard.writeText(contents.getURL())); // copy URL to clipboard
    shortcuts.register(game, 'F6', () => { // reload client
        app.quit();
        createGameWindow('https://krunker.io/');
    });
    shortcuts.register(game, 'CommandOrControl+Shift+N', () => createGameWindow(contents.getURL()));
    shortcuts.register(game, 'F12', () => contents.toggleDevTools());
    return game;
}

/**
 * Creates a splash window for the client
 * @returns splash window (object)
 */

function createSplashWindow() {
    splash = new BrowserWindow({
        width: 600,
        height: 300,
        center: true,
        resizable: false,
        frame: false,
        transparent: true,
        icon: path.join(__dirname, 'assets/icons/png/icon.png'),
        alwaysOnTop: true,
        webPreferences: {
            preload: `${__dirname}/preload/splash.js`,
        }
    });
    console.log(`${__dirname}/preload/splash.js`);
    splash.loadFile('src/html/splash.html');
    return splash;
}


/**
 * Creates the main game window
 * @param {string} url
 * @param {*} webContents
 * @returns game window object
 */

function createGameWindow(url, webContents) {
    const { width, height } = screen.getPrimaryDisplay().workArea;
    game = new BrowserWindow({
        width: width,
        height: height,
        center: true,
        show: false,
        title: 'Mentos Client',
        autoHideMenuBar: true,
        icon: path.join(__dirname, 'assets/icons/png/icon.png'),
        webPreferences: {
            preload: `${__dirname}/preload/preload.js`,
            contextIsolation: false,
        }
    });
    const contents = game.webContents;
    createShortcutKeys();
    if (!webContents) {
        game.loadURL(krunkerurl).catch((err) => {
            internetConnection = false;
            errText = `${err}`;
        });
    }
    const swapper = initSwapper(app);
    attachSwapper(game, swapper);
    return game;
}

// function createWindow(event, url, webContents) {
//     if (!url) return;
//     const uri = evalURL(url);
//     if (uri != 'social') {
//         event.preventDefault();
//         shell.openExternal(url);
//     } else {
//         event.preventDefault();
//         const { width, height } = screen.getPrimaryDisplay().workArea;
//         social = new BrowserWindow({
//             width: width,
//             height: height,
//             center: true,
//             show: false,
//             webPreferences: {
//                 preload: path.join(__dirname, 'preload.js'),
//                 contextIsolation: false,
//             }
//         });
//         if (!webContents) social.loadURL(url);
//         return social;
//     }
// }

function createPromptWindow(message, defaultValue, config = null) {
    const prompt = new BrowserWindow({
        width: 480,
        height: 240,
        center: true,
        show: true,
        frame: false,
        resizable: false,
        icon: path.join(__dirname, 'assets/icons/png/icon.png'),
        transparent: true,
        webPreferences: {
            preload: `${__dirname}/preload/prompt.js`
        }
    });
    const contents = prompt.webContents;

    prompt.once('ready-to-show', () => contents.send('prompt-data', message, defaultValue));

    prompt.loadFile('src/html/prompt.html');

    return prompt;
}


/**
 * Main function, splash window + game window
 * Auto updated is initiated after splash screen
 * Returns a dialog box and quits process when intenet connection is not detected
 */

function initClient() { // splash and game
    load();
    createSplashWindow();
    const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
    autoUpdate(splash.webContents, splash).finally(() => {
        createGameWindow(krunkerurl);
        wait(2000).then(() => {
            if (internetConnection == false) {
                splash.destroy();
                dialog.showErrorBox('Failed to load krunker.io', errText);
                app.quit();
                return;
            }
            splash.destroy();
            game.show();
        });
    });
}

/**
 * functions end
 * main events
 */
app.whenReady().then(() => {
    initClient();
});

app.on('quit', () => app.quit());

app.on('window-all-closed', () => {
    if (process.platform != 'darwin') app.quit();
});

function load() {
    ipcMain.handle('get-app-info', () => ({
        name: app.name,
        version: app.getVersion(),
        documentsDir: app.getPath('documents')
    }));

    ipcMain.on('get-path', (event, name) => (event.returnValue = app.getPath(name)));

    ipcMain.on('prompt', (event, message, defaultValue) => {
        const promptWin = createPromptWindow(message, defaultValue);
        let returnValue = null;

        ipcMain.on('prompt-return', (_, value) => (returnValue = value));

        promptWin.on('closed', () => (event.returnValue = returnValue));
    });

    ipcMain.handle('set-bounds', (event, bounds) => BrowserWindow
        .fromWebContents(event.sender)
        .setBounds(bounds));
}

