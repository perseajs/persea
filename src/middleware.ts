import * as path from 'path';

import { response } from './server';

export function loadGlobalMiddleware () {
    let before = async () => {};
    let after = async () => {};
    let error = async (e : Error) => {
        console.error(e);
        response.send({ status: 500 });
    };

    const cwd = process.env.WORK_DIR;

    try {
        const middleware = require(path.resolve(cwd, 'middleware'))
        if (middleware.before) { before = middleware.before; }
        if (middleware.after)  { after  = middleware.after;  }
        if (middleware.error)  { error  = middleware.error;  }
    } catch (e) {
        if (/Cannot find module/.test(e) === false) {
            throw e;
        }
    }

    return { before, after, error };
}
