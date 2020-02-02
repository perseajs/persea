const knex = require('knex');

const db = knex({
    client: 'sqlite3',
    connection: { filename: './db' },
    useNullAsDefault: true,
});

module.exports.db = db;

module.exports.init = async function init () {
    try {
        await db.schema.createTable('urls', (table) => {
            table.increments();
            table.string('url');
            table.string('alias_slug');
        });
    } catch (e) {
        // TODO
    }
}
