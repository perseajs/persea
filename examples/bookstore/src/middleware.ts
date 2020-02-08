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

