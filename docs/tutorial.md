Tutorial
========

This document walks through setting a up a new `persea` application and introduces the features that `persea` has to offter.


## Getting Started 

First, let's get up and running by creating a new directory and installing `persea`.

```
$ mkdir example-app
$ cd example-app
$ yarn init --yes
$ yarn add @persea/persea
```

Let's boot up the server:

```
$ yarn persea dev
Master 70423 is running
Listening on port 8080
Worker 70424 started
Worker 70425 started
Worker 70426 started
Worker 70427 started
Worker 70428 started
Worker 70429 started
Worker 70430 started
Worker 70431 started
```

When files on disk are changed, `persea dev` will pick up these changes and restart itself. This helps to shorten the development cycle.

Let's try to make a request to the server:

```
curl localhost:8080
Not Found
```

That makes sense, we haven't added any routes yet!

## Routing

```
$ mkdir -p routes/v1/
$ touch routes/v1/echo.js
```

And inside of the file, let's add the following:

```
// routes/v1/echo.js
const { Response } = require('@persea/persea');

module.exports.index = () => {
  Response.send({ body: 'hello world\n' });
};
```

As you save the file, you should see the server process restarting itself:

```
Detected change: routes/v1/echo.js
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

Now if we make a request:

```
curl localhost:8080/v1/echo
hello world
```

Nice.

`persea` has automatic routing. `persea` will use files defined in the `routes` directory as handlers for the http request. So in this case, we had a file `v1/echo.js` inside the `routes` directory with a `index` export, so when the server receives a request to `GET /v1/echo` - that is the function that it will be used as the handler.

More handlers can be defined as folows:

```
// routes/v1/echo.js
const { Request, Response } = require('@persea/persea');

// GET /v1/echo
module.exports.index = () => {
  Response.send({ body: 'hello world\n' });
};


// POST /v1/echo
module.exports.create = () => {
  Response.send({ body: Request.body });
};

// GET /v1/echo/$id
module.exports.show = (id) => {
  Response.send({ body: `hello world ${id}` });
};

// PATCH /v1/echo/$id
module.exports.update = (id) => {
  Response.send({ body: `updating world ${id} with ${Request.body}` });
};

// DELETE /v1/echo/$id
module.exports.destroy = (id) => {
  Response.send({ body: `deleting world ${id}` });
};
```
