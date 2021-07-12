/* eslint-disable no-undef */
const Store = require('electron-store');
const store = new Store();
const { runScript } = require('../utils/runScript');
const { ipcRenderer } = require('electron');
window.addEventListener('DOMContentLoaded', () => {
    // window.prompt = (message, defaultValue) => ipcRenderer.sendSync('prompt', message, defaultValue);
    const err = document.getElementById('err');
    ipcRenderer.on('errURL', (event, messageText = '') => {
        if (messageText != null) err.innerText = messageText;
    });
    const scripts = ['sky', 'menuTimer'];
    for (const script of scripts) runScript(script);
    document.getElementById('customizeButton').addEventListener('click', generateSkySelector);
});

// Object.assign(customizeObj, { onclick: `SOUND.play('select_0', 0.1);showWindow(3); generateSkySelector();` });

function generateSkySelector() {
    document.querySelectorAll('.selectorItem').item(3).addEventListener('click', createSelector);

    function createSelector() {
        const container = document.getElementById('customizeContainer');
        const skyDiv = document.createElement('div');
        const divProps = { className: 'settName', innerText: 'Select Sky Color' };
        for (const [key, value] of Object.entries(divProps)) skyDiv[key] = value;
        const skyInput = document.createElement('input');
        skyInput.id = 'skyInput';
        skyDiv.id = 'skyInputDiv';
        const inputProps = {
            class: 'skyColorItem',
            value: store.get('sky-color'),
            type: 'color',
            style: 'border-radius:2px;width:40px;',
            onmouseenter: 'playTick()',
            onchange: skyInputVal
        };
        for (const [key, value] of Object.entries(inputProps)) skyInput[key] = value;
        if (document.getElementById('customizeContainer').childElementCount != 5) {
            skyDiv.appendChild(skyInput);
            container.appendChild(skyDiv);
        }
        // skyInput.addEventListener('input', inputHandler());
    }
}

function skyInputVal() {
    const val = document.getElementById('skyInput').value;
    alert('Changes will be applied next time the client is launched');
    store.set('sky-color', val);
    console.log(`set store value ${val}`);
}

window.prompt = () => { // import settings fix
    let tempHTML = '<div class="setHed">Import Settings</div>';
    tempHTML +=
        '<div class="settName" id="importSettings_div" style="display:block">Settings String<input type="url" placeholder="Paste Settings String Here" name="url" class="inputGrey2" id="settingString"></div>';
    tempHTML += '<a class="+" id="importBtn">Import</a>';
    menuWindow.innerHTML = tempHTML;
    importBtn.addEventListener('click',
        () => { parseSettings(settingString.value); });

    function parseSettings(string) {
        if (string && string != '') {
            try {
                const json = JSON.parse(string);
                for (const setting in json) {
                    setSetting(setting, json[setting]);
                    showWindow(1);
                }
            } catch (err) {
                console.error(err);
                alert('Error importing settings.');
            }
        }
    }
};
