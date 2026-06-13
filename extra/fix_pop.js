const fs = require('fs');
let adminJs = fs.readFileSync('d:/box_cricket/admin.js', 'utf8');

const brokenPart = `    const currStriker = els.inpStriker.value || state.batsmen[0].name;
    const currNonStriker = els.inpNonStriker.value || state.batsmen[1].name;
    const currBowler = els.inpBowler.value || state.bowler.name;
    
    els.inpStriker.innerHTML = batOptions;
    els.inpNonStriker.innerHTML = batOptions;
    els.inpNewBatsman.innerHTML = batOptions;
    
    els.inpBowler.innerHTML = bowlOptions;
    els.inpNewBowler.innerHTML = bowlOptions;
    
    els.inpStriker.value = currStriker;
    els.inpNonStriker.value = currNonStriker;
    els.inpBowler.value = currBowler;
}`;

const fixedPart = `function populatePlayerDropdowns() {
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

    const batOptions = battingSquad.map(p => \`<option value="\${p}">\${p}</option>\`).join('');
    const bowlOptions = bowlingSquad.map(p => \`<option value="\${p}">\${p}</option>\`).join('');

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
}`;

adminJs = adminJs.replace(brokenPart, fixedPart);
fs.writeFileSync('d:/box_cricket/admin.js', adminJs);
console.log('Fixed populatePlayerDropdowns');
