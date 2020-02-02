const persea = require('persea');

const { init } = require('./db.js');

(async () => {
    await init();

    persea(process.env.PORT);
})();
