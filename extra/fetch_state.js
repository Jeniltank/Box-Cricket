const http = require('http');
const fs = require('fs');

http.get('http://localhost:3000/api/state', (res) => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
        try {
            const parsedData = JSON.parse(rawData);
            console.log("Keys in top-level JSON:", Object.keys(parsedData));
            console.log("Keys in state_data:", Object.keys(parsedData.state_data || {}));
            console.log("Keys in config_data:", Object.keys(parsedData.config_data || {}));
            
            const teamsWithPlayers = parsedData.state_data?.teamsWithPlayers;
            console.log(`teamsWithPlayers length: ${teamsWithPlayers?.length}`);
            if (teamsWithPlayers && teamsWithPlayers.length > 0) {
                console.log("First team info:");
                const team = teamsWithPlayers[0];
                console.log(`Team ID: ${team.id}, Name: ${team.name}, Category: ${team.category}`);
                console.log("Players count:", team.players?.length);
                if (team.players && team.players.length > 0) {
                    const player = team.players[0];
                    console.log("First player in team:");
                    console.log(`Player ID: ${player.id}, Name: ${player.name}`);
                    console.log(`Has image? ${player.image ? 'Yes' : 'No'}`);
                    if (player.image) {
                        console.log(`Image length: ${player.image.length}`);
                        console.log(`Image starts with: ${player.image.substring(0, 50)}...`);
                    }
                }
            }
            
            const allTeamsPlayers = parsedData.state_data?.allTeamsPlayers;
            console.log("allTeamsPlayers keys:", Object.keys(allTeamsPlayers || {}));

            // Save clean JSON
            fs.writeFileSync('state_response_clean.json', rawData, 'utf8');
            console.log("Saved clean JSON to state_response_clean.json");
        } catch (e) {
            console.error("Error parsing JSON:", e.message);
        }
    });
}).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
});
