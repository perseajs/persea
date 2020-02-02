const cronParser = require('cron-parser');

const { query } = require('../db.js')

module.exports.create = async () => {
    const { url, crontab } = request.json;

    const nextRunDueAt = cronParser.parseExpression(crontab).next().toISOString();

    const { rows: [ row ] } = await query`
        insert into "scheduledTasks"(url, crontab, "nextRunDueAt")
        values (${url}, ${crontab}, ${nextRunDueAt})
        returning *
    `;

    response.send({ status: 201, json: row });
};

module.exports.show = async (id) => {
    const { rows: [ row ] } = await query`
        select * from "scheduledTasks"
        where id=${id}
    `;

    if (row) {
        response.send({ json: row });
    } else {
        response.send({ status: 404 });
    }
};
