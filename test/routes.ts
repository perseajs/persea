import * as assert from 'assert';
import * as path   from 'path';

import { loadRoutes } from '../src/routes';

const routeTable = loadRoutes(path.resolve(__dirname, 'fixtures'));

const paths = Array.from(routeTable.keys()).map(v => v.toString());
assert.deepStrictEqual(paths, [
    '/GET \\/v1\\/foo$/',
    '/POST \\/v1\\/foo$/',
    '/GET \\/v1\\/foo\\/(?<id>[^\\/]+)$/',
    '/PUT \\/v1\\/foo\\/(?<id>[^\\/]+)$/',
    '/PATCH \\/v1\\/foo\\/(?<id>[^\\/]+)$/',
    '/DELETE \\/v1\\/foo\\/(?<id>[^\\/]+)$/'
]);

const testRoute = (method, url, body) => {
    const match = routeTable.match(method, url);
    assert(match);
    assert(match.handler(), body);
}

testRoute('GET',    '/v1/foo',   'index');
testRoute('POST',   '/v1/foo',   'create');
testRoute('GET',    '/v1/foo/1', 'show 1');
testRoute('PUT',    '/v1/foo/1', 'update 1');
testRoute('PATCH',  '/v1/foo/1', 'update 1');
testRoute('DELETE', '/v1/foo/1', 'destroy 1');

assert.equal(routeTable.match('GET', '/v1/foo/bar/baz'), null);
