const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'box_cricket',
    password: 'toor',
    port: 5432,
});

async function run() {
    try {
        await client.connect();
        const teamsRes = await client.query('SELECT * FROM teams ORDER BY id ASC');
        console.log("=== TEAMS AND PLAYERS IN DATABASE ===");
        for (const team of teamsRes.rows) {
            const playersRes = await client.query('SELECT name FROM players WHERE team_id = $1 ORDER BY id ASC', [team.id]);
            const players = playersRes.rows.map(p => p.name).join(', ');
            console.log(`\nTeam Name: ${team.name} (Category: ${team.category || 'N/A'})`);
            console.log(`Players: ${players || 'No players added yet'}`);
        }
    } catch(e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
run();
