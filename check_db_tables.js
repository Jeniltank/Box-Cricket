const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'box_cricket',
    password: 'toor',
    port: 5432,
});

async function inspectDb() {
    try {
        await client.connect();
        
        const tables = ['tournaments', 'teams', 'players', 'matches', 'app_state'];
        for (const table of tables) {
            const res = await client.query(`SELECT count(*) FROM ${table}`);
            console.log(`Table ${table} row count: ${res.rows[0].count}`);
            if (res.rows[0].count > 0) {
                const sample = await client.query(`SELECT * FROM ${table} LIMIT 5`);
                console.log(`Sample from ${table}:`, sample.rows);
            }
        }
    } catch (e) {
        console.error("DB Query Error:", e);
    } finally {
        await client.end();
    }
}

inspectDb();
