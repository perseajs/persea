<p align="center">
    <img width="532" alt="persea logo" src="https://user-images.githubusercontent.com/60553092/73610503-05a7eb80-45a6-11ea-8201-c45ab7c608c5.png">
</p>

An intentionally simple and quick http server.

---

Out of the box, you get:
- Automatic route discovery
- Hot-reloading
- Self-healing clustering

Getting started
===============

Getting started is as simple as:

```
$ mkdir my-project
$ yarn init
$ yarn add persea
$ PORT=8080 yarn persea dev

Master 70423 is running
Worker 70424 started
Worker 70425 started
Worker 70426 started
Worker 70427 started
Worker 70428 started
Worker 70429 started
Worker 70430 started
Worker 70431 started
```

A route file looks like this:

```javascript
// routes/v1/books.js

// GET /v1/books
module.exports.index = async function index () {
  response.send({ json: await getAllBooks() });
}
// POST /v1/books
module.exports.create = async function create () {
  response.send({ status: 201, json: await createBook(request.json) });
}
// GET /v1/books/$id
module.exports.show = async function show (id) {
  response.send({ json: await getBook(id) });
}
// PUT|PATCH /v1/books/$id
module.exports.update = async function update (id) {
  response.send({ json: await updateBook(id, request.json) });
}
// DELETE /v1/books/$id
module.exports.destroy = async function destroy (id) {
  await deleteBook(id);
  response.send({ status: 204 });
}
```

If you save the above file to `routes/v1/urls.js`, `persea` will detect the new file and restart the server:

```
Detected change: routes/v1/urls1.js
Reloading workers
Worker 32179 died
Worker 32180 died
Worker 32181 died
Worker 32182 died
Worker 32183 died
Worker 32184 died
Worker 32186 died
Worker 32187 died
Worker 32185 died
Worker 32188 died
Worker 32189 died
Worker 32190 died
Worker 32422 started
Worker 32425 started
Worker 32424 started
Worker 32427 started
Worker 32423 started
Worker 32426 started
Worker 32430 started
Worker 32431 started
Worker 32429 started
Worker 32434 started
Worker 32435 started
Worker 32436 started
```

Requirements
============

Persea depends on experimental feature of node - [async_hooks](https://nodejs.org/api/async_hooks.html). If you are unable to use experimental features for your project, persea is not for you.

Opinions Held
=============

Persea is opinionated in philosophy.

When building a web-application. Everything happens within the context of an http request, `persea` intentionally exposes the `request` and `response` objects globally, using some `async_hooks` magic to bind those objects to the current http request context. This abstracts away some magic, but makes for a pretty api.

`persea` intentionally does not support arbitrary route-definitions eg. `/v1/foo/:fooId/bar/:barId/baz`. This is intended to keep the api endpoints flat, and simple.

`persea` intentionally does not support nesting/chaining of middleware. `persea` supports a single global `before`, `after` and `error` middleware. Anything additional should be handled inside of the route files.
