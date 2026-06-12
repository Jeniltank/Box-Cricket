const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'boc_cricket',
    password: 'toor',
    port: 5432,
});

async function findImages() {
    try {
        await client.connect();
        
        // 1. Get count of players with images
        const countRes = await client.query('SELECT COUNT(*) FROM players WHERE image_base64 IS NOT NULL');
        console.log(`Total players with images: ${countRes.rows[0].count}`);

        // 2. Get list of players with images along with their team and category
        const playersRes = await client.query(`
            SELECT p.id as player_id, p.name as player_name, t.id as team_id, t.name as team_name, t.category 
            FROM players p
            JOIN teams t ON p.team_id = t.id
            WHERE p.image_base64 IS NOT NULL
        `);
        console.log("Players with images:");
        console.table(playersRes.rows);

        // 3. Get all teams in database
        const teamsRes = await client.query('SELECT * FROM teams');
        console.log("All teams in database:");
        console.table(teamsRes.rows);

    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}

findImages();
