export const INIT_SCRIPT = `
export async function init () {}
`.trim();

export const ROUTE_SCRIPT = `
export async function index () {
    Response.send({ status: 200 });
}

export async function create () {
    Response.send({ status: 201 });
}

export async function create (id) {
    Response.show({ status: 200 });
}

export async function update (id) {
    Response.show({ status: 200 });
}

export async function destoy (id) {
    Response.show({ status: 204 });
}`.trim();

export const MIDDLEWARE_SCRIPT = `
import { randomBytes } from 'crypto';

const { context } = require('persea');

export async function before () {
    const requestId = randomBytes(16).toString('hex');
    context.set('requestId', requestId);
    console.log(\`\${new Date().toISOString()} \${requestId} -> \${request.method} \${request.url}\`);
};

export async function after () {
    const requestId = context.get('requestId');
    console.log(\`\${new Date().toISOString()} \${requestId} <- \${request.method} \${request.url}\`);
 };

export async function error (err) {
    console.error(e);
}`.trim();

export const packageScript = (name : string) => `
{
  "name": "${name}",
  "version": "0.1.0",
  "scripts": {
    "start": "persea run",
    "dev": "persea dev"
  }
}`.trim();
