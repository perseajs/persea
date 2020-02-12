import * as assert from 'assert';
import * as http from 'http';

import { server, request, response } from '../src/server';

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
        response.send({ body: request.body });
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
        response.send({ body: JSON.stringify(request.headers) });
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
        response.send({ json: request.body });
    });
    const res = await util.post(
        `http://localhost:${port}`,
        'hello world',
    );
    assert.equal(res.headers['content-type'], 'application/json');
    assert.equal(res.body, `"hello world"`)
    await closeServer(server);
});

test('can set response.header before callnig response.send', async () => {
    const server = await setupServer(() => {
        response.headers['x-foo'] = 'foo';
        response.send({ json: request.body });
    });
    const res = await util.post(
        `http://localhost:${port}`,
        'hello world',
    );
    assert.equal(res.headers['x-foo'], 'foo');
});

test('can get response.status after calling response.send', async () => {
    let status;
    const server = await setupServer(() => {
        response.headers['x-foo'] = 'foo';
        response.send({ json: request.body, status: 201 });
        status = response.status;
    });
    const res = await util.post(
        `http://localhost:${port}`,
        'hello world',
    );
    assert.equal(status, 201);
});
