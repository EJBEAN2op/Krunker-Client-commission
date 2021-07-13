/* eslint-disable no-unused-vars */
/*
*   v1.0.4
*/
const { app, BrowserWindow, screen, clipboard, dialog, shell, globalShortcut, session } = require('electron');
const path = require('path');
const fs = require('fs');
const krunkerurl = 'https://krunker.io/';
const Store = require('electron-store');
const { URL } = require('url');
const store = new Store();
const shortcuts = require('electron-localshortcut');
const { evalURL } = require('./utils');
const { autoUpdate } = require('./utils/autoUpdate');

// modifying chromium
app.commandLine.appendSwitch('disable-frame-rate-limit');
app.commandLine.appendSwitch('disable-gpu-vsync');
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
    globalShortcut.register('F5', () => contents.reload()); // reload page
    globalShortcut.register('Shift+F5', () => contents.reloadIgnoringCache());
    globalShortcut.register('F2', () => clipboard.writeText(contents.getURL())); // copy URL to clipboard
    shortcuts.register(game, 'F4', () => game.loadURL(krunkerurl));
    globalShortcut.register('F11', () => game.setSimpleFullScreen(!game.isSimpleFullScreen()));
    globalShortcut.register('CommandOrControl+Shift+N', () => createGameWindow(contents.getURL()));
    globalShortcut.register('F12', () => contents.toggleDevTools());
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
    contents.on('new-window', initNewWin);
    return game;
}


/**
 * Main function, splash window + game window
 * Auto updated is initiated after splash screen
 * Returns a dialog box and quits process when intenet connection is not detected
 */

function initClient() { // splash and game
    createSplashWindow();
    const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
    // autoUpdate(splash.webContents, splash).finally(() => {
    createGameWindow(krunkerurl);
    wait(5000).then(() => {
        if (internetConnection == false) {
            splash.destroy();
            dialog.showErrorBox('Failed to load krunker.io', errText);
            app.quit();
            return;
        }
        splash.destroy();
        game.show();
    });
    // });
    // initResourceSwapper();
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


function initNewWin(event, url, _, __, options) {
    if (!url) return;
    if (!isSocial(url)) {
        event.preventDefault();
        shell.openExternal(url);
        // eslint-disable-next-line no-useless-return
        return;
    } else {
        event.preventDefault();
        const { width, height } = screen.getPrimaryDisplay().workArea;
        const newWin = new BrowserWindow({
            width: width,
            height: height,
            webContents: options.webContents,
            icon: path.join(__dirname, 'assets/icons/png/icon.png'),
            show: false,
            backgroundColor: '#131313',
            webPreferences: {
                nodeIntergration: false,
                webSecurity: false,
                devTools: true,
            },
        });

        if (!options.webContents) {
            newWin.loadURL(url);
            newWin.webContents.once('dom-ready', () => setTimeout(() => newWin.show(), 600));
        }
        event.newGuest = newWin;
        newWin.removeMenu();
        newWin.webContents.on('new-window', initNewWin);
    }
}

function isSocial(rawUrl) {
    return new URL(rawUrl).pathname == '/social.html' ? true : false;
}

// function initResourceSwapper() {
//     // Resource Swapper
//     const SWAP_FOLDER = path.join(app.getPath('documents'), '/KrunkerResourceSwapper');
//     // eslint-disable-next-line no-empty
//     try { fs.mkdir(SWAP_FOLDER, { recursive: true }, e => {}); } catch (e) {}
//     const swap = { filter: { urls: [] }, files: {} };
//     const allFilesSync = (dir, fileList = []) => {
//         fs.readdirSync(dir).forEach(file => {
//             const filePath = path.join(dir, file);
//             const useAssets = !(/KrunkerResourceSwapper\\(css|docs|img|libs|pkg|sound)/.test(dir));
//             if (fs.statSync(filePath).isDirectory()) allFilesSync(filePath);
//             else {
//                 const krunk = '*://' + (useAssets ? 'assets.' : '') + 'krunker.io' + filePath.replace(SWAP_FOLDER, '').replace(/\\/g, '/') + '*';
//                 swap.filter.urls.push(krunk);
//                 swap.files[krunk.replace(/\*/g, '')] = URL.format({
//                     pathname: filePath,
//                     protocol: 'file:',
//                     slashes: true
//                 });
//             }
//         });
//     };
//     allFilesSync(SWAP_FOLDER);
//     if (swap.filter.urls.length) {
//         session.defaultSession.webRequest.onBeforeRequest(swap.filter, (details, callback) => {
//             const redirect = swap.files[details.url.replace(/https|http|(\?.*)|(#.*)/gi, '')] || details.url;
//             callback({ cancel: false, redirectURL: redirect });
//             // log.debug('Redirecting ', details.url, 'to', redirect);
//             // console.log('onBeforeRequest details', details);
//         });
//     }
// }

