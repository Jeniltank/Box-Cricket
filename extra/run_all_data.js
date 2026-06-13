const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const dbConfig = {
    user: 'postgres',
    host: 'localhost',
    database: 'box_cricket',
    password: 'toor',
    port: 5432,
    connectionTimeoutMillis: 3000, // Timeout after 3 seconds so we don't hang!
};

async function checkDatabase() {
    console.log("=== 1. DATABASE CONNECTION & STATE ===");
    const client = new Client(dbConfig);
    try {
        await client.connect();
        console.log('Successfully connected to PostgreSQL database "box_cricket".');
        
        // Check row counts
        const tables = ['tournaments', 'teams', 'players', 'matches', 'app_state'];
        for (const table of tables) {
            try {
                const res = await client.query(`SELECT count(*) FROM ${table}`);
                console.log(`Table "${table}" row count: ${res.rows[0].count}`);
                if (parseInt(res.rows[0].count) > 0) {
                    const sample = await client.query(`SELECT * FROM ${table} LIMIT 3`);
                    console.log(`Sample from "${table}":`);
                    console.log(JSON.stringify(sample.rows, null, 2));
                }
            } catch (tableErr) {
                console.log(`Table "${table}" read failed: ${tableErr.message}`);
            }
        }

        // Teams and players
        console.log("\n=== 2. TEAMS AND PLAYERS ===");
        try {
            const teamsRes = await client.query('SELECT * FROM teams ORDER BY id ASC');
            for (const team of teamsRes.rows) {
                const playersRes = await client.query('SELECT name FROM players WHERE team_id = $1 ORDER BY id ASC', [team.id]);
                const players = playersRes.rows.map(p => p.name).join(', ');
                console.log(`Team: ${team.name} (Category: ${team.category || 'N/A'})`);
                console.log(`Players: ${players || 'No players'}`);
            }
        } catch (teamErr) {
            console.log(`Failed to list teams and players: ${teamErr.message}`);
        }

        // App state config_data
        console.log("\n=== 3. APP STATE CONFIG_DATA ===");
        try {
            const res = await client.query('SELECT config_data FROM app_state WHERE id = 1');
            if (res.rows.length > 0) {
                console.log(JSON.stringify(res.rows[0].config_data, null, 2));
            } else {
                console.log("app_state table is empty or has no row with id = 1.");
            }
        } catch (stateErr) {
            console.log(`Failed to read app_state: ${stateErr.message}`);
        }

    } catch (e) {
        console.log("Database connection failed (PostgreSQL might not be running, or credentials are wrong):");
        console.log(e.message);
    } finally {
        try {
            await client.end();
        } catch (err) {}
    }
}

function checkJSONFiles() {
    console.log("\n=== 4. LOCAL JSON FILES STATE ===");
    const files = ['state_response.json', 'state_response_clean.json'];
    for (const file of files) {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            console.log(`\nFile: ${file}`);
            try {
                let content = fs.readFileSync(filePath, 'utf8');
                if (content.charCodeAt(0) === 0xFEFF) {
                    content = content.slice(1);
                }
                const data = JSON.parse(content);
                console.log("Top-level keys:", Object.keys(data));
                console.log("config_data keys:", Object.keys(data.config_data || {}));
                console.log("state_data keys:", Object.keys(data.state_data || {}));
                
                const teams = data.state_data?.teamsWithPlayers || [];
                console.log(`Teams found in JSON: ${teams.length}`);
                for (const team of teams.slice(0, 3)) { // print first 3 teams
                    console.log(`  - Team: ${team.name} (ID: ${team.id}) | Players count: ${team.players?.length || 0}`);
                }
            } catch (err) {
                console.log(`Failed to parse ${file}: ${err.message}`);
            }
        } else {
            console.log(`File: ${file} does not exist.`);
        }
    }
}

async function run() {
    await checkDatabase();
    checkJSONFiles();
}

run();
