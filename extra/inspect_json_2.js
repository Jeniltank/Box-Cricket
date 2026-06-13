const fs = require('fs');

try {
    const data = JSON.parse(fs.readFileSync('state_response_clean.json', 'utf8'));
    const teams = data.state_data?.teamsWithPlayers || [];
    console.log(`Found ${teams.length} teams in teamsWithPlayers.`);
    for (const team of teams) {
        console.log(`\nTeam: ${team.name} (ID: ${team.id})`);
        for (const player of team.players || []) {
            const hasImg = !!player.image;
            const imgLen = player.image ? player.image.length : 0;
            const imgStart = player.image ? player.image.substring(0, 30) : '';
            console.log(`  - Player: ${player.name} (ID: ${player.id}) | Has Image: ${hasImg} | Length: ${imgLen} | Start: ${imgStart}`);
        }
    }
} catch (e) {
    console.error(e);
}
