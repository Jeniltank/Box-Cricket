const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Client } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); // For image uploads

// Serve static frontend files (HTML, CSS, JS) from the current directory
app.use(express.static(__dirname));

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' }
});

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'boc_cricket',
    password: 'toor',
    port: 5432,
});

async function initDb() {
    try {
        await client.connect();
        console.log('Connected to PostgreSQL database "boc_cricket" successfully.');

        // Create tables if they don't exist
        const schema = `
            CREATE TABLE IF NOT EXISTS tournaments (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255)
            );

            CREATE TABLE IF NOT EXISTS teams (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255),
                category VARCHAR(50) DEFAULT 'MAN'
            );

            CREATE TABLE IF NOT EXISTS players (
                id SERIAL PRIMARY KEY,
                team_id INTEGER REFERENCES teams(id),
                name VARCHAR(255),
                image_base64 TEXT
            );

            CREATE TABLE IF NOT EXISTS matches (
                id SERIAL PRIMARY KEY,
                tournament_id INTEGER REFERENCES tournaments(id),
                team_a_id INTEGER REFERENCES teams(id),
                team_b_id INTEGER REFERENCES teams(id),
                innings INTEGER DEFAULT 1,
                total_overs INTEGER,
                target INTEGER,
                free_hit BOOLEAN DEFAULT false,
                current_state JSONB
            );

            CREATE TABLE IF NOT EXISTS ball_by_ball (
                id SERIAL PRIMARY KEY,
                match_id INTEGER REFERENCES matches(id),
                striker_id INTEGER REFERENCES players(id),
                bowler_id INTEGER REFERENCES players(id),
                over_number INTEGER,
                ball_number INTEGER,
                runs_scored INTEGER DEFAULT 0,
                is_extra BOOLEAN DEFAULT false,
                extra_type VARCHAR(50),
                is_wicket BOOLEAN DEFAULT false,
                wicket_type VARCHAR(50)
            );
            
            -- This fallback table guarantees 100% real-time state synchronization
            CREATE TABLE IF NOT EXISTS app_state (
                id SERIAL PRIMARY KEY,
                state_data JSONB,
                config_data JSONB
            );
        `;
        await client.query(schema);
        await client.query("ALTER TABLE teams ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'MAN';");
        console.log('Database schema initialized.');

        // Ensure at least one app_state row exists
        const res = await client.query('SELECT COUNT(*) FROM app_state');
        if (parseInt(res.rows[0].count) === 0) {
            await client.query('INSERT INTO app_state (state_data, config_data) VALUES ($1, $2)', [{}, {}]);
        }
    } catch (err) {
        console.error('CRITICAL Database Connection Error:', err.message);
        console.error('Make sure the "boc_cricket" database has been created in your PostgreSQL server!');
    }
}

initDb();

// REST endpoint to get full state on initial load
app.get('/api/state', async (req, res) => {
    try {
        const stateRes = await client.query('SELECT state_data, config_data FROM app_state WHERE id = 1');
        let data = stateRes.rows[0] || { state_data: {}, config_data: {} };

        // Fetch all teams matching the current category
        const category = data.config_data.category || 'MAN';
        const allTeamsRes = await client.query('SELECT id, name FROM teams WHERE category = $1 ORDER BY id ASC', [category]);
        data.config_data.allTeams = allTeamsRes.rows.map(t => t.name);

        // Fetch all teams from the database for the complete roster list (independent of category)
        const allDbTeamsRes = await client.query('SELECT id, name, category FROM teams ORDER BY id ASC');

        // Dynamically override currently selected teams if they are not set
        if (allTeamsRes.rows.length >= 1 && !data.config_data.teamA) data.config_data.teamA = allTeamsRes.rows[0].name;
        if (allTeamsRes.rows.length >= 2 && !data.config_data.teamB) data.config_data.teamB = allTeamsRes.rows[1].name;

        // Fetch all players mapped by team name and build detailed team roster list
        if (!data.state_data) data.state_data = {};
        data.state_data.allTeamsPlayers = {};
        data.state_data.teamsWithPlayers = [];
        for (const team of allDbTeamsRes.rows) {
            const pRes = await client.query('SELECT id, name, image_base64 FROM players WHERE team_id = $1 ORDER BY id ASC', [team.id]);
            data.state_data.allTeamsPlayers[team.name] = pRes.rows.map(p => p.name);
            data.state_data.teamsWithPlayers.push({
                id: team.id,
                name: team.name,
                category: team.category,
                players: pRes.rows.map(p => ({
                    id: p.id,
                    name: p.name,
                    image: p.image_base64
                }))
            });
        }

        // Fetch all player images
        data.state_data.playerImages = {};
        const playersWithImagesRes = await client.query('SELECT name, image_base64 FROM players WHERE image_base64 IS NOT NULL');
        for (const row of playersWithImagesRes.rows) {
            data.state_data.playerImages[row.name] = row.image_base64;
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
});

// REST endpoint to add a single team without deleting existing ones
app.post('/api/add-team', async (req, res) => {
    const { teamName, players, playerImages, category } = req.body;
    try {
        await client.query('BEGIN');

        const teamRes = await client.query('INSERT INTO teams (name, category) VALUES ($1, $2) RETURNING id', [teamName || "NEW TEAM", category || "MAN"]);
        const teamId = teamRes.rows[0].id;

        if (players && Array.isArray(players)) {
            for (const p of players) {
                const img = playerImages && playerImages[p] ? playerImages[p] : null;
                await client.query('INSERT INTO players (team_id, name, image_base64) VALUES ($1, $2, $3)', [teamId, p, img]);
            }
        }

        await client.query('COMMIT');
        res.json({ success: true, teamId });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Transaction Error (add-team):", err);
        res.status(500).json({ error: err.message });
    }
});

// REST endpoint to update an existing team
app.post('/api/update-team', async (req, res) => {
    const { teamId, teamName, players, playerImages, category } = req.body;
    try {
        await client.query('BEGIN');

        // Update team name and category
        await client.query('UPDATE teams SET name = $1, category = $2 WHERE id = $3', [teamName || "NEW TEAM", category || "MAN", teamId]);

        // Clear existing players of this team
        await client.query('DELETE FROM players WHERE team_id = $1', [teamId]);

        // Insert new players
        if (players && Array.isArray(players)) {
            for (const p of players) {
                const img = playerImages && playerImages[p] ? playerImages[p] : null;
                await client.query('INSERT INTO players (team_id, name, image_base64) VALUES ($1, $2, $3)', [teamId, p, img]);
            }
        }

        await client.query('COMMIT');
        res.json({ success: true });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Transaction Error (update-team):", err);
        res.status(500).json({ error: err.message });
    }
});

// REST endpoint to delete a team
app.post('/api/delete-team', async (req, res) => {
    const { teamId } = req.body;
    try {
        await client.query('BEGIN');
        await client.query('DELETE FROM players WHERE team_id = $1', [teamId]);
        await client.query('DELETE FROM teams WHERE id = $1', [teamId]);
        await client.query('COMMIT');
        res.json({ success: true });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Transaction Error (delete-team):", err);
        res.status(500).json({ error: err.message });
    }
});

// WebSockets for Real-Time Synchronization across Devices
io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Sync State
    socket.on('updateState', async (data) => {
        console.log(`[Socket] Received updateState from ${socket.id}`);
        try {
            const res = await client.query('UPDATE app_state SET state_data = $1 WHERE id = 1', [data]);
            console.log(`[Socket] Database state updated successfully (rows: ${res.rowCount})`);
            socket.broadcast.emit('stateUpdated', data);
        } catch (err) {
            console.error('[Socket] Error saving state:', err);
        }
    });

    // Sync Config
    socket.on('updateConfig', async (data) => {
        console.log(`[Socket] Received updateConfig from ${socket.id}`);
        try {
            const category = data.category || 'MAN';
            const allTeamsRes = await client.query('SELECT id, name FROM teams WHERE category = $1 ORDER BY id ASC', [category]);
            data.allTeams = allTeamsRes.rows.map(t => t.name);

            // Dynamically override currently selected teams if they are not set or do not match the new category
            if (data.allTeams.length > 0) {
                if (!data.teamA || !data.allTeams.includes(data.teamA)) {
                    data.teamA = data.allTeams[0];
                }
                if (data.allTeams.length > 1) {
                    if (!data.teamB || !data.allTeams.includes(data.teamB)) {
                        data.teamB = data.allTeams[1];
                    }
                } else {
                    data.teamB = '';
                }
            } else {
                data.teamA = '';
                data.teamB = '';
            }

            // Fetch players for ALL teams in the database to keep the roster synchronized
            const allDbTeamsRes = await client.query('SELECT id, name, category FROM teams ORDER BY id ASC');

            const allTeamsPlayers = {};
            const teamsWithPlayers = [];
            for (const team of allDbTeamsRes.rows) {
                const pRes = await client.query('SELECT id, name, image_base64 FROM players WHERE team_id = $1 ORDER BY id ASC', [team.id]);
                allTeamsPlayers[team.name] = pRes.rows.map(p => p.name);
                teamsWithPlayers.push({
                    id: team.id,
                    name: team.name,
                    category: team.category,
                    players: pRes.rows.map(p => ({
                        id: p.id,
                        name: p.name,
                        image: p.image_base64
                    }))
                });
            }

            // Update configuration in DB
            await client.query('UPDATE app_state SET config_data = $1 WHERE id = 1', [data]);

            // Update app_state state_data to sync the player roster lists
            const stateRes = await client.query('SELECT state_data FROM app_state WHERE id = 1');
            const stateData = stateRes.rows[0]?.state_data || {};
            stateData.allTeamsPlayers = allTeamsPlayers;
            stateData.teamsWithPlayers = teamsWithPlayers;
            await client.query('UPDATE app_state SET state_data = $1 WHERE id = 1', [stateData]);

            console.log(`[Socket] Database config and state players updated successfully`);
            
            // Broadcast updates
            io.emit('configUpdated', data);
            io.emit('stateUpdated', stateData);
        } catch (err) {
            console.error('[Socket] Error saving config:', err);
        }
    });

    // UI Events (Six, Wicket, etc)
    socket.on('triggerEvent', (eventName) => {
        console.log(`[Socket] Received triggerEvent: ${eventName} from ${socket.id}`);
        socket.broadcast.emit('showEvent', eventName);
    });

    socket.on('disconnect', () => {
        console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Backend Server running on http://localhost:${PORT}`);
});
