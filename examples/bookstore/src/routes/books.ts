import { Request, Response } from '@persea/persea';

import { BooksDatabase, Book } from '../db';

export async function index () {
    Response.send({ json: await BooksDatabase.all() });
};

export async function create () {
    Response.send({ json: await BooksDatabase.create(Request.json as Book) });
}

export async function show (id: string) {
    try {
        Response.send({ json: await BooksDatabase.get(id) });
    } catch (e) {
        if (e.message === 'Not Found') {
            Response.send({ status: 404 });
        }
        throw e;
    }
}

export async function update (id: string) {
    try {
        Response.send({
            json: await BooksDatabase.update(id, Request.json as Book)
        });
    } catch (e) {
        if (e.message === 'Not Allowed') {
            Response.send({ status: 403 });
        }
        throw e;
    }
}

export async function destroy (id: string) {
    try {
        await BooksDatabase.delete(id);
        Response.send({});
    } catch (e) {
        if (e.message === 'Not Allowed') {
            Response.send({ status: 403 });
        }
        throw e;
    }
}
