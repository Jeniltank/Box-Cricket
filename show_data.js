const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'box_cricket',
    password: 'toor',
    port: 5432,
});

async function showData() {
    try {
        await client.connect();
        const res = await client.query('SELECT config_data FROM app_state WHERE id = 1');
        console.log("Here is the data currently saved in your database:");
        console.log(JSON.stringify(res.rows[0].config_data, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}

showData();
