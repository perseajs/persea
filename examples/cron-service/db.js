const knex = require('knex');

const db = knex({ client:'pg', connection: process.env.DB_URI });

module.exports.db = db;

module.exports.init = async function init () {
    try {
        await db.schema.createTable('scheduledTasks', (table) => {
            table.increments();
            table.string('url');
            table.string('crontab');
            table.datetime('nextRunDueAt');
        });
    } catch (e) {}

    try {
        await db.schema.createTable('scheduledTasksStatuses', (table) => {
            table.integer('scheduledTasksId').unsigned();
            table.foreign('scheduledTasksId').references('scheduledTasks.id');
            table.datetime('dueAt');
            table.string('status');
        });
    } catch (e) {}
}

module.exports.query = function query (parts, ...bindings) {
    return db.raw(parts.join('?'), bindings);
}

module.exports.transaction = async function transaction () {
    const transaction = await db.transaction();
    return {
        commit: transaction.commit,
        rollback: transaction.rollback,
        query (parts, ...bindings) {
            return transaction.raw(parts.join('?'), bindings);
        }
    }
}
