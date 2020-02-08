import { randomBytes } from 'crypto';

import { Request, Response, context } from '@persea/persea';

export function before () {
    const requestId = randomBytes(16).toString('hex');
    context.set('requestId', requestId);
    console.log(`${new Date().toISOString()} ${requestId} -> ${Request.method} ${Request.url}`);
};

export function after () {
    const requestId = context.get('requestId');
    console.log(`${new Date().toISOString()} ${requestId} <- ${Request.method} ${Request.url}`);
 };


export function error (e) {
    if (e.message === 'Not Found') {
        Response.send({ status: 404 });
    } else if (e.message === 'Not Allowed') {
        Response.send({ status: 403 });
    } else {
        console.error(e);
        Response.send({ status: 500 });
    }

    const requestId = context.get('requestId');
    console.log(`${new Date().toISOString()} ${requestId} <- ${Request.method} ${Request.url}`);
}
