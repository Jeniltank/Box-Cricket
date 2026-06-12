const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    password: 'toor',
    port: 5432,
    database: 'postgres' // Connect to default db first
});

async function createDb() {
    try {
        await client.connect();
        await client.query('CREATE DATABASE boc_cricket;');
        console.log('Database boc_cricket created successfully');
    } catch (e) {
        if (e.code === '42P04') {
            console.log('Database already exists');
        } else {
            console.error(e);
        }
    } finally {
        await client.end();
    }
}

createDb();
