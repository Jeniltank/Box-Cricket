const fs = require('fs');
let serverJs = fs.readFileSync('d:/box_cricket/server.js', 'utf8');

const oldApi = `// REST endpoint to get full state on initial load
app.get('/api/state', async (req, res) => {
    try {
        const result = await client.query('SELECT state_data, config_data FROM app_state WHERE id = 1');
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});`;

const newApi = `// REST endpoint to get full state on initial load
app.get('/api/state', async (req, res) => {
    try {
        const stateRes = await client.query('SELECT state_data, config_data FROM app_state WHERE id = 1');
        let data = stateRes.rows[0] || { state_data: {}, config_data: {} };
        
        // Dynamically override teams and players from the SQL tables
        const teamsRes = await client.query('SELECT id, name FROM teams ORDER BY id ASC LIMIT 2');
        if (teamsRes.rows.length >= 1) data.config_data.teamA = teamsRes.rows[0].name;
        if (teamsRes.rows.length >= 2) data.config_data.teamB = teamsRes.rows[1].name;
        
        if (teamsRes.rows.length > 0) {
            const teamA_id = teamsRes.rows[0].id;
            const playersA = await client.query('SELECT name FROM players WHERE team_id = $1 ORDER BY id ASC', [teamA_id]);
            data.state_data.teamAPlayers = playersA.rows.map(p => p.name);
        }
        if (teamsRes.rows.length > 1) {
            const teamB_id = teamsRes.rows[1].id;
            const playersB = await client.query('SELECT name FROM players WHERE team_id = $1 ORDER BY id ASC', [teamB_id]);
            data.state_data.teamBPlayers = playersB.rows.map(p => p.name);
        }
        
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// REST endpoint to save teams directly into SQL tables
app.post('/api/save-teams', async (req, res) => {
    const { config, state } = req.body;
    try {
        await client.query('BEGIN');
        
        // Clear old tables
        await client.query('DELETE FROM players');
        await client.query('DELETE FROM teams');
        
        // Insert Team A
        const teamA_res = await client.query('INSERT INTO teams (name) VALUES ($1) RETURNING id', [config.teamA || "TEAM A"]);
        const teamA_id = teamA_res.rows[0].id;
        
        if (state.teamAPlayers && Array.isArray(state.teamAPlayers)) {
            for (const p of state.teamAPlayers) {
                const img = state.playerImages && state.playerImages[p] ? state.playerImages[p] : null;
                await client.query('INSERT INTO players (team_id, name, image_base64) VALUES ($1, $2, $3)', [teamA_id, p, img]);
            }
        }
        
        // Insert Team B
        const teamB_res = await client.query('INSERT INTO teams (name) VALUES ($1) RETURNING id', [config.teamB || "TEAM B"]);
        const teamB_id = teamB_res.rows[0].id;
        
        if (state.teamBPlayers && Array.isArray(state.teamBPlayers)) {
            for (const p of state.teamBPlayers) {
                const img = state.playerImages && state.playerImages[p] ? state.playerImages[p] : null;
                await client.query('INSERT INTO players (team_id, name, image_base64) VALUES ($1, $2, $3)', [teamB_id, p, img]);
            }
        }
        
        // Sync the app_state table as well for legacy functions
        await client.query('UPDATE app_state SET config_data = $1, state_data = $2 WHERE id = 1', [config, state]);
        
        await client.query('COMMIT');
        
        // Broadcast updates via websocket to keep other clients in sync
        io.emit('configUpdated', config);
        io.emit('stateUpdated', state);
        
        res.json({ success: true });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Transaction Error:", err);
        res.status(500).json({ error: err.message });
    }
});`;

serverJs = serverJs.replace(oldApi, newApi);
fs.writeFileSync('d:/box_cricket/server.js', serverJs);
console.log('Successfully patched server.js with SQL logic!');
