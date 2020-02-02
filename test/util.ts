import * as http   from 'http';

export function request (url, options?): Promise<{
    statusCode: number;
    headers: http.IncomingHttpHeaders;
    body: string;
}> {
    return new Promise((resolve, reject) => {
        const req = http.request(url, options, (response) => {
            const { statusCode, headers } = response;
            let body = '';

            response.on('data', (chunk) => {
                body += chunk;
            });

            response.on('end', () => {
                resolve({ statusCode, headers, body });
            });
        });
        if (options?.body) {
            req.write(options.body);
        }
        req.end();
    });
}

export function get (url, options?) {
    return request(url, {...options, method: 'get' });
}

export function post (url, body, options?) {
    return request(url, {...options, method: 'post', body });
}

export function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

export function randInt (min : number, max : number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
