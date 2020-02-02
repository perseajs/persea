/**
 * This is where the magic of persea happens.
 * This depends on the experimental functionality of [async_hooks](https://nodejs.org/dist/latest-v12.x/docs/api/documentation.html),
 * but allows us to do some nifty stuff.
 *
 * For every http request that the server receives, we set up a new isolated
 * "context" that is unique to that request. Every function that is called
 * inside within the request handler, has access to this context. [[server]]
 * sets up this context for us. This is perhaps better illustrated with
 * an example, see below:
 *
 * ```typescript
 * server(() => {
 *     Actions.purchaseProduct(...);
 * }).listen(8080)
 *
 * // somewhere down in the call stack we reach
 * function processCharge (user, charge) {
 *     try {
 *         // call a 3rd party api
 *     } catch (e) {
 *         // something goes wrong!
 *
 *         // requestId is part of the current request context. We don't need
 *         // to pass it to every function in order to have access at this one location.
 *         const requestId = get('requestId');
 *         console.error(`Error processing payment. requestId=${requestId}`);
 *     }
 * }
 * ```
 * @packageDocumentation
 */

import * as ah from 'async_hooks';

const contexts = {};
const asyncHook = ah.createHook({
    init (asyncId, type, triggerId, resource) {
        if (type === 'HTTPINCOMINGMESSAGE') {
            contexts[asyncId] = {};
        } else if (contexts[triggerId]) {
            contexts[asyncId] = contexts[triggerId];
        }
    },
    destroy (asyncId) {
        delete contexts[asyncId];
    },
});
asyncHook.enable();

/**
 * Sets a value on the current request context.
 */
export function set (key : string, val : unknown) {
    contexts[ah.executionAsyncId()][key] = val;
}

/**
 * Returns a value from the current request context.
 */
export function get (key : string) {
    return contexts[ah.executionAsyncId()][key];
}
