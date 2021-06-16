const Store = require('electron-store');
const store = new Store();

const sky = () => {
    Object.defineProperty(Object.prototype, 'skyC', {
        value: store.get('sky-color'), // your color goes here
        writable: false,
        configurable: true
    });
};

module.exports = sky;
