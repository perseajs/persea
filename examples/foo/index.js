const { persea } = require('persea');

const { init } = require('./db');

(async () => {
    await init();

    persea().listen(process.env.PORT);
});
