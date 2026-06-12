const { Client } = require('pg');
const { io } = require('./client/node_modules/socket.io-client');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'boc_cricket',
    password: 'toor',
    port: 5432,
});

async function resetMatch() {
    try {
        await client.connect();
        
        // 1. Fetch current config and state
        const dbRes = await client.query('SELECT config_data, state_data FROM app_state WHERE id = 1');
        const currentConfig = dbRes.rows[0].config_data || {};
        const currentState = dbRes.rows[0].state_data || {};
        
        console.log("Current Config:", currentConfig);
        console.log("Current State runs:", currentState.teamRuns, "wickets:", currentState.teamWickets);

        // Get active player names to initialize
        const strikerName = (currentState.batsmen && currentState.batsmen[0]) ? currentState.batsmen[0].name : "Batsman 1";
        const nonStrikerName = (currentState.batsmen && currentState.batsmen[1]) ? currentState.batsmen[1].name : "Batsman 2";
        const bowlerName = currentState.bowler ? currentState.bowler.name : "Bowler";

        // 2. Prepare reset state
        const resetState = {
            ...currentState,
            teamRuns: 0,
            teamWickets: 0,
            totalBalls: 0,
            lastBalls: [],
            partnerRuns: 0,
            partnerBalls: 0,
            strikerIndex: 0,
            target: 0,
            currentOverRuns: 0,
            currentOverWickets: 0,
            oversHistory: [],
            freeHit: false,
            allBatsmen: [
                { id: 0, name: strikerName, runs: 0, balls: 0, fours: 0, sixes: 0, status: 'not out' },
                { id: 1, name: nonStrikerName, runs: 0, balls: 0, fours: 0, sixes: 0, status: 'not out' },
            ],
            batsmen: [
                { id: 0, name: strikerName, runs: 0, balls: 0, fours: 0, sixes: 0 },
                { id: 1, name: nonStrikerName, runs: 0, balls: 0, fours: 0, sixes: 0 },
            ],
            allBowlers: [
                { id: 0, name: bowlerName, overs: 0, ballsInCurrentOver: 0, runs: 0, maidens: 0, wickets: 0 },
            ],
            bowler: { id: 0, name: bowlerName, overs: 0, ballsInCurrentOver: 0, runs: 0, maidens: 0, wickets: 0 },
        };

        const resetConfig = {
            ...currentConfig,
            innings: 1
        };

        // 3. Update Database
        await client.query('UPDATE app_state SET state_data = $1, config_data = $2 WHERE id = 1', [resetState, resetConfig]);
        console.log("Database successfully updated with reset state.");

        // 4. Connect to running Socket.io server to broadcast to all clients in real-time
        console.log("Connecting to socket.io server at http://localhost:3000...");
        const socket = io('http://localhost:3000', {
            transports: ['websocket']
        });

        socket.on('connect', () => {
            console.log("Connected to socket server. Broadcasting updates...");
            socket.emit('updateState', resetState);
            socket.emit('updateConfig', resetConfig);
            
            // Give it a moment to send before closing
            setTimeout(() => {
                socket.disconnect();
                console.log("Successfully broadcasted and disconnected.");
                process.exit(0);
            }, 1000);
        });

        socket.on('connect_error', (err) => {
            console.error("Socket connection error:", err.message);
            process.exit(1);
        });

    } catch (e) {
        console.error("Error resetting match:", e);
        process.exit(1);
    } finally {
        await client.end();
    }
}

resetMatch();
