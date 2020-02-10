import * as http from 'http';

import { server, Request, Response } from './server';
import { loadRoutes }                from './routes';
import { loadGlobalMiddleware }      from './middleware';
import { init }                      from './init';


/**
 * Start a persea application listening on the specified port.
 *
 * An pre-initialization function will be loaded from `$CWD/init.js`.
 * Routes will be automatically loaded from `$CWD/routes/**`.
 * Global middleware will be automatically loaded from `$CWD/middleware.js`.
 *
 * See examples below of auto-loaded code:
 *
 * ```typescript
 * // $CWD/init.js
 * // persea will wait for this function to resolve before binding to a port
 * // and receiving traffic
 * module.exports.init = async () => {
 *   await loadDB();
 * }

 * // $CWD/routes/v1/foo.js
 * module.exports.index   = () => ...   // GET /v1/foo
 * module.exports.create  = () => ...   // POST /v1/foo
 * module.exports.show    = (id) => ... // GET /v1/foo/$id
 * module.exports.update  = (id) => ... // PUT|PATCH /v1/foo/$id.
 * module.exports.destroy = (id) => ... // DELETE /v1/foo/$id

 * // $CWD/routes/v1/foo.js
 * module.exports.before = () => ...    // called before the route handler
 * module.exports.after  = () => ...    // called after the route handler
 * module.exports.error  = (err) => ... // called if the route handler, before or after functions throw an un-handled error
 * ```
 *
 * @param port - The port to which the http.Server will bind.
 */
export async function start (port : number): Promise<http.Server> {
    await init();
    const routeTable       = loadRoutes();
    const globalMiddleware = loadGlobalMiddleware();

    return server(async () => {
        try {
            const [ path ] = Request.url.split('?');
            const matchedRoute = routeTable.match(Request.method, path)

            await globalMiddleware.before();
            if (matchedRoute) {
                const { match, handler } = matchedRoute;
                await handler((match.groups || {}).id);
            } else {
                Response.send({ status: 404, body: 'Not Found' });
            }
            await globalMiddleware.after();

        } catch (e) {
            await globalMiddleware.error(e);
        }
    }).listen(port);
};
