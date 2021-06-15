/* eslint-disable no-constant-condition */
/* eslint-disable no-undef */
const menuTimer = async() => {
    document.head.appendChild(Object.assign(document.createElement('style'), {
        innerText: `#beantimer {
            color: rgba(255,255,255);
        }` }));

    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    while (true) {
        await wait(1000);
        timer();
    }

    /**
     * Sets ingame match time to right header of krunker menu
     * @returns Match time
     */
    function timer() {
        const timerVal = document.getElementById('timerVal');
        if (!timerVal) throw new Error('Game timer not found');
        const rightHeader = document.getElementById('headerRight');
        const menuT = Object.assign(document.createElement('span'), { id: 'beantimer' });
        rightHeader.appendChild(menuT);
        const time = document.getElementById('beantimer');
        time.innerText = timerVal.innerText;
        return time.innerText;
    }
};

module.exports = menuTimer;
