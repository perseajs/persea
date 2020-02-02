const { db } = require('./db.js');

const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function genId (id) {
    let remainder = id;
    let res = [ ];

    while (remainder >= 0) {
        res.unshift(chars[(remainder % chars.length)]);
        remainder = Math.floor(remainder / chars.length) - 1;
    }

    return res.join('');
};

module.exports.create = async function create (url) {
    const trx = await db.transaction();
    const numRows = await db('urls').transacting(trx).count().first();
    const nextSlugAlias = genId(numRows['count(*)']);

    await db('urls')
        .transacting(trx)
        .insert({ url, alias_slug: nextSlugAlias });

    await trx.commit();

    return { alias_slug: nextSlugAlias, url };
}

module.exports.get = async function get (slug) {
    return await db('urls')
        .where({ alias_slug: slug })
        .first();
}
