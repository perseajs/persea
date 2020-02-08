import * as fs from 'fs';
import * as path from 'path';

export function loadGlobalMiddleware (envPath = process.cwd()) {
    let before = () => {};
    let after = () => {};
    let error = (e) => {
        Response.send({ status: 500 });
    };

    if (fs.existsSync(path.resolve(envPath, 'middleware.js'))) {
        const middleware = require(path.resolve(envPath, 'middleware.js'));
        if (middleware.before) { before = middleware.before; }
        if (middleware.after)  { after  = middleware.after;  }
        if (middleware.error)  { error  = middleware.error;  }
    }

    return { before, after, error };
}
