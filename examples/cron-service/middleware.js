const { randomBytes } = require('crypto');

const { set, get } = require('persea/context');

module.exports.before = () => {
    set('requestId', randomBytes(16).toString('hex'));
    console.log(`${new Date().toISOString()} ${get('requestId')} -> ${request.method} ${request.url}`);
};

module.exports.after = () => {
    console.log(`${new Date().toISOString()} ${get('requestId')} <- ${request.method} ${request.url}`);
 };
