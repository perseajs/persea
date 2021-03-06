import * as path from 'path';

export async function init () {
    try {
        const initScript = require(
            path.resolve(process.env.WORK_DIR, 'init')
        );
        await initScript.init()
    } catch (e) {
        if (/Cannot find module/.test(e) === false) {
            throw e;
        }
    }
}
