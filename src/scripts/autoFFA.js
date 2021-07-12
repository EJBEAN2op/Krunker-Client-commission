/* eslint-disable no-undef */

const getTopFFA = async(window) => {
    const region = window.localStorage.pingRegion7 || (await fetch(`https://matchmaker.krunker.io/game-info?game=${encodeURIComponent(window.getGameActivity().id)}`).then(res => res.json()))[1]; // get region from localStorage, if null or undefined then fetch current game data and get the region
    const gameData = (await fetch(`https://matchmaker.krunker.io/game-list?hostname=${window.location.hostname}`).then(res => res.json())).games; // fetch game list data
    // filter and sort game data
    const filData = gameData.filter(game =>
        game[1] === region && // region check
        game[4].g === 0 && // game mode check (0 == FFA)
        game[4].c === 0 && // custom check (make sure you dont join a custom)
        game[2] < game[3] // makes sure the game is not full (game[2] == player count, game[3] == max player count)
    ).sort((x, y) => y[2] - x[2]); // sort data by player count
    return filData[0];
};

const joinTopFFA = async(win) => {
    const targetGame = await getTopFFA(win);
    window.location.href = `/?game=${targetGame[0]}`;
};

module.exports = joinTopFFA;
