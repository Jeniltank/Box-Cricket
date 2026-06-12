const fs = require('fs');

let lines = fs.readFileSync('d:/box_cricket/admin.js', 'utf8').split('\n');

let part1 = [];
for (let i = 0; i < lines.length; i++) {
    part1.push(lines[i]);
    if (lines[i].includes('els.inpTeamB.value = config.bowlingTeamName || config.teamB;')) {
        part1.push(lines[i+1]);
        break;
    }
}

let part2 = [];
let foundSync = false;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('function syncAllBatsmen() {')) {
        foundSync = true;
    }
    if (foundSync) {
        part2.push(lines[i]);
    }
}

const popFunc = `
function populatePlayerDropdowns() {
    if(!els.inpStriker || !els.inpNewBatsman) return;
    
    let battingSquad = [];
    let bowlingSquad = [];
    if (els.inpTeamA && els.inpTeamA.value === config.teamA) {
        battingSquad = state.teamAPlayers || [];
        bowlingSquad = state.teamBPlayers || [];
    } else {
        battingSquad = state.teamBPlayers || [];
        bowlingSquad = state.teamAPlayers || [];
    }
    if(battingSquad.length === 0) battingSquad = ["Player 1", "Player 2"];
    if(bowlingSquad.length === 0) bowlingSquad = ["Bowler 1"];

    const batOptions = battingSquad.map(p => '<option value="' + p + '">' + p + '</option>').join('');
    const bowlOptions = bowlingSquad.map(p => '<option value="' + p + '">' + p + '</option>').join('');

    const currStriker = els.inpStriker.value || (state.batsmen && state.batsmen[0] ? state.batsmen[0].name : "");
    const currNonStriker = els.inpNonStriker.value || (state.batsmen && state.batsmen[1] ? state.batsmen[1].name : "");
    const currBowler = els.inpBowler.value || (state.bowler ? state.bowler.name : "");
    
    els.inpStriker.innerHTML = batOptions;
    els.inpNonStriker.innerHTML = batOptions;
    els.inpNewBatsman.innerHTML = batOptions;
    
    els.inpBowler.innerHTML = bowlOptions;
    els.inpNewBowler.innerHTML = bowlOptions;
    
    if (currStriker) els.inpStriker.value = currStriker;
    if (currNonStriker) els.inpNonStriker.value = currNonStriker;
    if (currBowler) els.inpBowler.value = currBowler;
}

if(!state.teamAPlayers) state.teamAPlayers = ["A. Sharma", "R. Singh", "V. Kohli"];
if(!state.teamBPlayers) state.teamBPlayers = ["M. Patel", "J. Bumrah", "R. Jadeja"];

populatePlayerDropdowns();
`;

fs.writeFileSync('d:/box_cricket/admin.js', part1.join('\n') + popFunc + part2.join('\n'));
console.log('Restored admin.js perfectly!');
