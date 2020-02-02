const Repo = require('../../repo.js');

module.exports.create = async () => {
    const shortened = await Repo.create(request.json.url);

    response.send({ body: JSON.stringify({ alias_slug: shortened.alias_slug }) });
};

module.exports.show = async (slug) => {
    const row = await Repo.get(slug)

    if (!row) {
        return response.send({ status: 404 });
    }

    response.send({ status: 301, headers: { location: row.url } });
};
