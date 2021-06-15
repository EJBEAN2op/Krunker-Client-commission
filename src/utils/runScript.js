/* eslint-disable max-statements-per-line */
module.exports.runScript = function(moduleName) {
    const module = require(`../scripts/${moduleName}`);
    try { module(); } catch (err) { console.log(err); }
};

