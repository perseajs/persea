import { Request, Response } from '@persea/persea';

import { AuthorsDatabase, Author } from '../db';

export async function index () {
    Response.send({ json: await AuthorsDatabase.all() });
};

export async function create () {
    Response.send({ json: await AuthorsDatabase.create(Request.json as Author) });
}

export async function show (id: string) {
    Response.send({ json: await AuthorsDatabase.get(id) });
}

export async function update (id: string) {
    Response.send({
        json: await AuthorsDatabase.update(id, Request.json as Author)
    });
}

export async function destroy (id: string) {
    await AuthorsDatabase.delete(id);
    Response.send({});
}
