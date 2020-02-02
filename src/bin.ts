#!/usr/bin/env node

import * as cluster from 'cluster';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';

import './index';
import { loadRoutes }           from './routes';
import { loadGlobalMiddleware } from './middleware';
import { init }                 from './init';
import { start }                from './start';

cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
});

export function runWorkers (port : number) {
    if (cluster.isMaster === false) {
        throw new Error('runWorkers should only be called by the master');
    }

    const workers = [];
    for (let i = 0; i < os.cpus().length; i++) {
            const worker = cluster.fork({ CMD_RUN_WORKER: 'true', PORT: port });
            workers.push(worker);
    }

    return workers;
}

export function dev (port : number) {
    let workers = runWorkers(port);

    // The master doesn't use any of the functionality in the following
    // functions. However calling them loads in all the dependencies, which we
    // check against in the watch loop below.
    init();
    loadRoutes();
    loadGlobalMiddleware();

    let lock = false;
    let lastStartAt = Date.now();
    const cwd = process.cwd();
    fs.watch(cwd, { recursive: true }, (eventType, filename) => {
        if (lock) { return; }
        if ((Date.now() - lastStartAt) < 1000) { return; }
        if (require.cache[path.resolve(cwd, filename)] === undefined) { return; }

        lock = true;
        console.log(`Detected change:, ${filename}`);
        console.log('Reloading workers');
        while (workers.length) {
            const worker = workers.shift();
            worker.kill();
        }
        workers = runWorkers(port);

        // re-load the dependencies, in case there are new modules required
        init();
        loadRoutes();
        loadGlobalMiddleware();

        lastStartAt = Date.now();
        lock = false;
    });
}

export async function initProject () {
    // check if cwd is empty

    // package.json
    // src/
    //    /init.js
    //    /middleware.js
    //    /routes/v1/hello.js

    // yarn | npm add persea
}

if (process.env.CMD_RUN_WORKER === 'true') {
    start(Number(process.env.PORT));
    console.log(`Worker ${process.pid} started`);
} else if (process.argv.includes('run')) {
    console.log(`Master ${process.pid} is running`);
    runWorkers(Number(process.env.PORT));
} else if (process.argv.includes('dev')) {
    console.log(`Master ${process.pid} is running`);
    dev(Number(process.env.PORT));
} else {
    console.log(`
usage: PORT=8080 persea run
                `.trim());
}
