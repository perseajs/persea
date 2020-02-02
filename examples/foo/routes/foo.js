module.exports.index = () => {
    response.send({ body: 'hello from foo' });
}

module.exports.create = async () => {
    response.send({ body: `hello from ${request.body}` });
}

module.exports.show = (id) => {
    response.send({ body: `hello from foo:${id}` });
}
