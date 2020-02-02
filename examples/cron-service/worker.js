const fetch = require('node-fetch');
const cronParser = require('cron-parser');

const { init, transaction } = require('./db.js');

function sleep (ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main () {
    await init();

    while (true) {
        const trx = await transaction();

        const { rows: [ row ] } = await trx.query`
                select * from "scheduledTasks"
                where "nextRunDueAt" <= now()
                for update skip locked
                limit 1
            `;

        if (!row) {
            trx.commit();
            continue;
        };

        console.log(`Handling ${JSON.stringify(row)}`);

        const res = await fetch(row.url, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ dueAt: row.nextRunDueAt }),
        });

        await trx.query`
                insert into "scheduledTasksStatuses" ("scheduledTasksId", "dueAt", status)
                values (${row.id}, ${row.nextRunDueAt}, ${res.status})
            `;

        const nextRunDueAt = cronParser.parseExpression(row.crontab).next().toISOString();
        await trx.query`
                update "scheduledTasks"
                set "nextRunDueAt" = ${nextRunDueAt}
                where id = ${row.id}
            `;

        await trx.commit();

        await sleep(100);
    }
}

main();
