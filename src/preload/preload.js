/* eslint-disable no-undef */
const { runScript } = require('../utils/runScript');
const { ipcRenderer } = require('electron');
window.addEventListener('DOMContentLoaded', () => {
    window.prompt = (message, defaultValue) => ipcRenderer.sendSync('prompt', message, defaultValue);
    const err = document.getElementById('err');
    ipcRenderer.on('errURL', (event, messageText = '') => {
        if (messageText != null) err.innerText = messageText;
    });
    const scripts = ['sky', 'menuTimer'];
    for (const script of scripts) runScript(script);
});

