import { Request, Response } from '@persea/persea';

import { AuthorsDatabase, Author } from '../db';

export async function index () {
    Response.send({ json: await AuthorsDatabase.all() });
};

export async function create () {
    Response.send({ json: await AuthorsDatabase.create(Request.json as Author) });
}

export async function show (id: string) {
    try {
        Response.send({ json: await AuthorsDatabase.get(id) });
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
            json: await AuthorsDatabase.update(id, Request.json as Author)
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
        await AuthorsDatabase.delete(id);
        Response.send({});
    } catch (e) {
        if (e.message === 'Not Allowed') {
            Response.send({ status: 403 });
        }
        throw e;
    }
}
