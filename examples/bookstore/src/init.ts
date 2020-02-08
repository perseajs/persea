import * as fs from 'fs';

export async function init () {
    if (false === fs.existsSync('authors.json')) {
        fs.writeFileSync('authors.json', '{}');
    }

    if (false === fs.existsSync('books.json')) {
        fs.writeFileSync('books.json', '{}');
    }
}
