import * as http   from 'http';
import * as assert from 'assert';

import { get, set } from '../src/context';
import { request, sleep, randInt } from './util';

// async_hooks interact with the runtime of node, which makes this a little
// tricky to test. Ideally, we would be able to introspect the contexts object
// and assert it's contents are as we would expect. Until we work out a good
// way to do the aforementioned, this test asserts that the context set up by
// each request remains unique to the request context.
//
// We send three requests to the server as follows
//
//   +-- request received by server
//   |
//   |        +-- response returned by server
//   |        |
//   v        v
//
//   AAAAAAAAAA
//     BBBBBBBBBB
//      CCCCCCCCCC
//
//   -----time------>
//
// The idea is that request A will set up a new context, then before request A
// is finished, request B and C will also be received, so that we have three
// requests in flight at once. As a result, three new contexts will have been
// set up.
// we expect the context of A to be returned by A and not that of another
// request.

test('async_hooks isolates request contexts', async () => {
    const port = randInt(10_000, 65_536);

    const server = http.createServer((req, res) => {
        set('timestamp', Date.now());
        setTimeout(() => {
            res.end(get('timestamp').toString());
        }, 100);
    }).listen(port);

    const res0$ = request(`http://localhost:${port}`);
    await sleep(20);
    const res1$ = request(`http://localhost:${port}`);
    await sleep(20);
    const res2$ = request(`http://localhost:${port}`);
    await sleep(20);

    const [
        res0,
        res1,
        res2
    ] = await Promise.all([ res0$, res1$, res2$ ]);

    server.close();

    assert(Number(res0.body) < Number(res1.body));
    assert(Number(res1.body) < Number(res2.body));
});
