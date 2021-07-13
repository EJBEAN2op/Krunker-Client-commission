const Store = require('electron-store');
const store = new Store();

const sky = () => {
    Reflect.defineProperty(Object.prototype, 'skyCol', {
        value: store.get('sky-color'), // your color goes here
        writable: false,
        configurable: true
    });
};

module.exports = sky;
