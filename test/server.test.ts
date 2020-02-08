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

test('server can echo request body', async () => {
    const server = await setupServer(() => {
        Response.send({ body: Request.body });
    });
    const res = await util.post(
        `http://localhost:${port}`,
        'hello world',
    );

    assert.equal(res.body, 'hello world')
    await closeServer(server);
});

test('server can echo request headers', async () => {
    const server = await setupServer(() => {
        Response.send({ body: JSON.stringify(Request.headers) });
    });
    const res = await util.get(
        `http://localhost:${port}`,
        { headers: { 'x-hello': 'world' }}
    );

    assert.equal(res.body, `{"x-hello":"world","host":"localhost:${port}","connection":"close"}`)
    await closeServer(server);
});

test('Response.send can serialize json', async () => {
    const server = await setupServer(() => {
        Response.send({ json: Request.body });
    });
    const res = await util.post(
        `http://localhost:${port}`,
        'hello world',
    );
    assert.equal(res.headers['content-type'], 'application/json');
    assert.equal(res.body, `"hello world"`)
    await closeServer(server);
});
