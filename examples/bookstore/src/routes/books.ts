import { Request, Response } from '@persea/persea';

import { BooksDatabase, Book } from '../db';

export async function index () {
    Response.send({ json: await BooksDatabase.all() });
};

export async function create () {
    Response.send({ json: await BooksDatabase.create(Request.json as Book) });
}

export async function show (id: string) {
    Response.send({ json: await BooksDatabase.get(id) });
}

export async function update (id: string) {
    Response.send({
        json: await BooksDatabase.update(id, Request.json as Book)
    });
}

export async function destroy (id: string) {
    await BooksDatabase.delete(id);
    Response.send({});
}
