/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
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

function createPromptWindow(message, defaultValue) {
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
