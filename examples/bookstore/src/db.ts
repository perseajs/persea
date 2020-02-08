import * as fs from 'fs';
import * as util from 'util';

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

export interface Author {
    id: number;
    firstName: string;
    lastName: string;
    deleted?: boolean;
}

export interface Book {
    id: number;
    title: string;
    authorId: number;
    deleted?: boolean;
}

interface DatabaseEntry {
    id: number;
    deleted?: boolean;
}

class Database<T extends DatabaseEntry> {
    filename: string;
    constructor (filename) {
        this.filename = filename;
    }

    async readMap (): Promise<{ [key: string]: T }> {
        return JSON.parse(
            (await readFile(this.filename)).toString()
        );
    }

    async writeMap (payload: { [key: string]: T }): Promise<void> {
        await writeFile(this.filename, JSON.stringify(payload));
    }

    async all (): Promise<Array<T>> {
        const values = Object.values(await this.readMap());

        return values.filter(v => !v.deleted);
    }

    async create (payload: Omit<T, 'id' | 'deleted'>): Promise<T> {
        const map = await this.readMap();

        const id = Object.keys(map).length;
        map[id] = { id, ...payload } as unknown as T;

        await this.writeMap(map);

        return map[id];
    }

    async get (id): Promise<T> {
        const map = await this.readMap();

        if (!map[id] || map[id].deleted) {
            throw new Error('Not Found');
        }

        return map[id];
    }

    async update (id, payload: Omit<T, 'id' | 'deleted'>): Promise<T> {
        const map = await this.readMap();

        if (!map[id] || map[id].deleted) {
            throw new Error('Not Allowed');
        }

        map[id] = { id, ...payload } as unknown as T;

        await this.writeMap(map);

        return map[id];
    }

    async delete (id): Promise<T> {
        const map = await this.readMap();

        if (!map[id] || map[id].deleted) {
            throw new Error('Not Allowed');
        }

        map[id].deleted = true;

        await this.writeMap(map);

        return map[id];
    }
}

export const AuthorsDatabase = new Database<Author>('authors.json');
export const BooksDatabase   = new Database<Book>('books.json');
