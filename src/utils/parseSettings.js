/* eslint-disable no-undef */
const path = require('path');
const fs = require('fs');
const { app } = require('electron');

const parseSettings = () => {
    // Resource Swapper
    const SWAP_FOLDER = path.join(app.getPath('documents'), '/MentosClient/Settings');
    // eslint-disable-next-line no-empty
    try { fs.mkdir(SWAP_FOLDER, { recursive: true }, e => {}); } catch (e) {}
    const settingsFolder = fs.readdirSync(SWAP_FOLDER);
    for (const file of settingsFolder) {
        if (file.endsWith('.txt')) {
            fs.readFile(file, (e, data) => {
                try {
                    const json = JSON.parse(data);
                    for (const setting in json) {
                        setSetting(setting, json[setting]);
                        showWindow(1);
                    }
                } catch (err) {
                    console.error(err);
                }
            });
        }
    }
};

module.exports = parseSettings;
