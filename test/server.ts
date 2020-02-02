import * as assert from 'assert';
import * as http from 'http';

import { server, Request, Response } from '../src/server';

import * as util from './util';


const port = util.randInt(10_000, 65_536);

async function setupServer (handler): Promise<http.Server> {
    return new Promise(resolve => {
        const s = server(handler);
        s.listen(port);
        s.on('listening', () => resolve(s));
    });
}

async function closeServer (s : http.Server) {
    return new Promise(resolve => {
        s.on('close', resolve);
        s.close();
    });
}

(async () => {
    let s : http.Server;
    let res : {
        statusCode : number;
        headers : http.IncomingHttpHeaders,
        body : string;
    };

    try {
        // test body is echoed back
        s = await setupServer(() => {
            Response.send({ body: Request.body });
        });
        res = await util.post(
            `http://localhost:${port}`,
                'hello world',
        );
        assert.equal(res.body, 'hello world')
        await closeServer(s);


        // test headers is echoed back
        s = await setupServer(() => {
            Response.send({ body: JSON.stringify(Request.headers) });
        });
        res = await util.get(
            `http://localhost:${port}`,
                { headers: { 'x-hello': 'world' }}
        );
        assert.equal(res.body, `{"x-hello":"world","host":"localhost:${port}","connection":"close"}`)
        await closeServer(s);


        // test Response.json serializes for us
        s = await setupServer(() => {
            Response.send({ json: Request.body });
        });
        res = await util.post(
            `http://localhost:${port}`,
                'hello world',
        );
        assert.equal(res.headers['content-type'], 'application/json');
        assert.equal(res.body, `"hello world"`)
        await closeServer(s);

    } catch (e) {
        await closeServer(s);
        console.error(e);
        process.exit(1);
    }
})();
