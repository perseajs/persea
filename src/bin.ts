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


/*
 * This function starts env.NUM_WORKERS worker processes. Each worker process
 * listens on env.PORT serving the persea application.
 *
 * Each worker is self-healing: if it dies, another process will be created in
 * it's place.
 *
 * @returns The return value is a reference to the array of currently alive
 * workers. When a worker process is restarted, the reference to that worker is
 * updated. See the example below.
 *
 * ```typescript
 * const workers = runWorkers(8080)
 * console.log(workers[0].pid) // 1
 * workers[0].kill();
 * console.log(workers[0].pid) // 2
 * ```
 */
export function runWorkers (port : number): Array<cluster.Worker> {
    if (cluster.isMaster === false) {
        throw new Error('runWorkers should only be called by the master');
    }

    const workers = [];
    for (let i = 0; i < os.cpus().length; i++) {
            const worker = cluster.fork({ CMD_RUN_WORKER: 'true', PORT: port });
            workers.push(worker);
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        const indexOfOldWorker = workers.indexOf(worker);

        const newWorker = cluster.fork({ CMD_RUN_WORKER: 'true', PORT: port });
        workers.splice(indexOfOldWorker, 1, newWorker);
    });

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

        init();
        loadRoutes();
        loadGlobalMiddleware();

        if (require.cache[path.resolve(cwd, filename)] === undefined) { return; }

        lock = true;
        console.log(`Detected change: ${filename}`);
        console.log('Reloading workers');
        const workersToKill = Array.from(workers);
        for (const worker of workersToKill) {
            worker.kill();
        }

        lastStartAt = Date.now();
        lock = false;
    });
}

function main () {
    process.env.PORT = process.env.PORT || '8080';

    if (process.env.CMD_RUN_WORKER === 'true') {

        start(Number(process.env.PORT));
        console.log(`Worker ${process.pid} started`);

    } else if (process.argv.includes('run')) {

        console.log(`Master ${process.pid} is running`);
        console.log(`Listening on ${process.env.PORT}`);
        runWorkers(Number(process.env.PORT));

    } else if (process.argv.includes('dev')) {

        console.log(`Master ${process.pid} is running`);
        console.log(`Listening on ${process.env.PORT}`);
        dev(Number(process.env.PORT));

    } else {

        console.log(`
usage: PORT=8080 persea run|dev
        `.trim());

    }
}

main();
