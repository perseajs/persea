import * as http from 'http';
import * as querystring from 'querystring';

import * as context from './context';


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
        context.set('request', req);

        request.body    = await getBody(req);
        try {
            request.json    = JSON.parse(request.body);
        } catch (e) {
            request.json    = null;
        }
        request.url     = req.url;
        request.headers = req.headers;
        request.method  = req.method;
        request.query   = querystring.parse(req.url.split('?')[1]);

        context.set('response.headers', {});
        context.set('response', res);

        handler();
    });
}

async function getBody (httpRequest : http.IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
        let data = '';

        httpRequest.on('readable', () => {
            let chunk : String;
            while (chunk = httpRequest.read()) {
                data += chunk;
            }
        });

        httpRequest.on('end', () => {
            resolve(data);
        });

        httpRequest.on('error', (e) => {
            reject(e);
        });
    });
}

/**
 * The Request object is context-bound to a request received by [[server]].
 */
export interface Request {
    body:    string;
    json:    object | null;
    headers: object;
    method:  string;
    url:     string;
    query:   object;
}
export const request: Request = new Proxy({
    body:    '',
    json:    null,
    headers: {},
    method:  '',
    url:     '',
    query:   {}
}, {
    get (_, prop) {
        return context.get(`request.${prop.toString()}`);
    },
    set (_, prop, value) {
        context.set(`request.${prop.toString()}`, value);
        return true;
    }
});

/**
 * The Response object is context-bound to a request received by [[server]].
 */
export interface Response {
    status: number;
    headers: object;
    send: (opt: {
        status? : number;
        body? : string;
        json? : unknown;
        headers? : object;
    }) => void;
}
export const response: Response = {
    get status () {
        return context.get('response').statusCode;
    },

    get headers () {
        return context.get('response.headers');
    },

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
    send (
        {
            status = 200,
            body = '',
            json = null,
            headers = {},
        } : {
            status? : number;
            body? : string;
            json? : unknown;
            headers? : object;
        }
    ) {
        const response = context.get('response');
        if (json) {
            response.writeHead(status, {
                ...context.get('response.headers'),
                ...headers,
                'content-type': 'application/json'
            });
            response.end(JSON.stringify(json));
        } else {
            response.writeHead(status, { ...context.get('response.headers'), ...response.headers });
            response.end(body);
        }
    }
};
