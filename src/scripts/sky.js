const sky = () => {
    Object.defineProperty(Object.prototype, 'skyC', {
        value: '#000000', // your color goes here
        writable: false,
        configurable: true
    });
};

module.exports = sky;
