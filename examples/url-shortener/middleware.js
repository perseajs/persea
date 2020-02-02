const { randomBytes } = require('crypto');

const { context } = require('persea');

module.exports.before = () => {
    const requestId = randomBytes(16).toString('hex');
    context.set('requestId', requestId);
    console.log(`${new Date().toISOString()} ${requestId} -> ${request.method} ${request.url}`);
};

module.exports.after = () => {
    const requestId = context.get('requestId');
    console.log(`${new Date().toISOString()} ${requestId} <- ${request.method} ${request.url}`);
 };
