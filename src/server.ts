import * as http from 'http';
import * as querystring from 'querystring';

import { get, set } from './context';


/**
 * This function wraps `http.createServer`. For each request received a new
 * context will be set up with `request`, `response` and `payload`.
 *
 * @param handler - handler function called for each http request. It takes no
 * parameters. It's return value is discarded. The handler can access the
 * current request and response with [[ Request ]] and [[ Response ]].
 *
 * ```typescript
 * server(() => {
 *     if (Request.url === '/echo') {
 *         Response.send({ body: Request.body });
 *     } else {
 *         Response.send({ status: 404 });
 *     }
 * }).listen(8080);
 * ```
 */
export function server (handler : () => void): http.Server {
    return http.createServer(async (req, res) => {
        set('request', req);
        set('payload', await getBody(req));
        set('response', res);

        handler();
    });
}

async function getBody (request : http.IncomingMessage) {
    return new Promise((resolve, reject) => {
        let data = '';

        request.on('readable', () => {
            let chunk : String;
            while (chunk = request.read()) {
                data += chunk;
            }
        });

        request.on('end', () => {
            resolve(data);
        });

        request.on('error', (e) => {
            reject(e);
        });
    });
}


/**
 * The Request object is context-bound to a request received by [[server]].
 */
export class Request {
    static get body (): string {
        return get('payload');
    }

    /**
     * The decoded json from the request body. Assumes the content-type is json.
     */
    static get json (): object {
        return JSON.parse(get('payload'));
    }

    static get headers (): object {
        return get('request').headers;
    }

    static get method (): string {
        return get('request').method;
    }

    static get url (): string {
        return get('request').url;
    }

    static get query (): object {
        const [ , queryString ] = get('request').url.split('?');
        return querystring.parse(queryString);
    }
}

/**
 * The Response object is context-bound to a request received by [[server]].
 */
export class Response {
    /**
     * Sends the response to the client.
     *
     * When opts is not specified, the response will return with status code
     * 200 and no body.
     *
     * When opts.json is specified, it will be serialized into json and sent as
     * the body to the client. Additionalkly, the `content-type:
     * application/json` header will be added to opts.headers
     *
     * opts.status defaults to 200
     * opts.body defaults to ''
     * opts.json defaults to null
     * opts.headers defaults to {}
     */
    static send (
        {
            status = 200,
            body = '',
            json = null,
            headers = {},
        } : {
            status? : number;
            body? : string;
            json? : object;
            headers? : object;
        }
    ) {
        // const {
        // } = options;

        const response = get('response');
        if (json) {
            response.writeHead(status, { ...headers, 'content-type': 'application/json' });
            response.end(JSON.stringify(json));
        } else {
            response.writeHead(status, headers);
            response.end(body);
        }
    }
}
