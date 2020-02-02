const { db, query } = require('../db.js');

module.exports.index = async () => {
    const { id, offset = 0, limit = 20, order="desc" } = request.query;

    if (!id) { return response.send({ status: 400 }); }

    const { rows } = await query`
        select * from "scheduledTasksStatuses"
        where "scheduledTasksId"=${id}
        order by "dueAt" ${db.raw(order)}
        limit ${db.raw(limit)} offset ${offset}
    `;
    response.send({ json: rows });
}
