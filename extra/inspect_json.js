const fs = require('fs');

try {
    let content = fs.readFileSync('state_response.json', 'utf8');
    if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
    }
    const data = JSON.parse(content);
    console.log("Keys in top-level JSON:", Object.keys(data));
    console.log("Keys in state_data:", Object.keys(data.state_data || {}));
    console.log("Keys in config_data:", Object.keys(data.config_data || {}));
    
    const teamsWithPlayers = data.state_data?.teamsWithPlayers;
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
                console.log(`Image starts with: ${player.image.substring(0, 50)}...`);
            }
        }
    }

    const allTeamsPlayers = data.state_data?.allTeamsPlayers;
    console.log("allTeamsPlayers:", allTeamsPlayers);

} catch (e) {
    console.error("Error reading/inspecting JSON:", e);
}
