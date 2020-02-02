Persea
======

Persea is an opinionated http server written in and for node.js.

Here are some opinions which you may or may not agree with:
- global request and response objects, because every function in a web application is _always_ operating in the context of a request/response.
- minimize nesting of routes
- auto-loading routes
- minimize use of middleware
- convention over configuration
