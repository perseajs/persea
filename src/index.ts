const { Request, Response } = require('./server');

module.exports.start   = require('./start').start;
module.exports.server  = require('./server').server;
module.exports.context = require('./context');

declare module NodeJS  {
    interface Global {
        request:  typeof Request;
        response: typeof Response;
    }
}

/**
 * @global
 * @see {@link Request}
 */
global.request = Request;
/**
 * @global
 * @see {@link Response}
 */
global.response = Response;
