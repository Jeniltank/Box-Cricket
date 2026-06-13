const fs = require('fs');

let adminJs = fs.readFileSync('d:/box_cricket/admin.js', 'utf8');

// 1. Add handleTeamSelectionChange and populateTeamDropdowns
const populateTeamCode = `
window.handleTeamSelectionChange = function() {
    if (els.inpTeamA.value === config.teamA) {
        els.inpTeamB.value = config.teamB;
    } else {
        els.inpTeamB.value = config.teamA;
    }
    populatePlayerDropdowns();
};

function populateTeamDropdowns() {
    if (!els.inpTeamA || !els.inpTeamB) return;
    const opts = \`<option value="\${config.teamA}">\${config.teamA}</option><option value="\${config.teamB}">\${config.teamB}</option>\`;
    els.inpTeamA.innerHTML = opts;
    els.inpTeamB.innerHTML = opts;
    els.inpTeamA.value = config.battingTeamName || config.teamA;
    els.inpTeamB.value = config.bowlingTeamName || config.teamB;
}
`;

// Inject right before populatePlayerDropdowns
adminJs = adminJs.replace('function populatePlayerDropdowns() {', populateTeamCode + '\nfunction populatePlayerDropdowns() {');

// 2. Modify populatePlayerDropdowns to use battingTeamName
const oldPopulateSquads = `    let battingSquad = config.innings === 1 ? (state.teamAPlayers || []) : (state.teamBPlayers || []);
    let bowlingSquad = config.innings === 1 ? (state.teamBPlayers || []) : (state.teamAPlayers || []);`;

const newPopulateSquads = `    let battingSquad = [];
    let bowlingSquad = [];
    if (els.inpTeamA.value === config.teamA) {
        battingSquad = state.teamAPlayers || [];
        bowlingSquad = state.teamBPlayers || [];
    } else {
        battingSquad = state.teamBPlayers || [];
        bowlingSquad = state.teamAPlayers || [];
    }`;

adminJs = adminJs.replace(oldPopulateSquads, newPopulateSquads);

// 3. Update saveSettings
adminJs = adminJs.replace(
    'config.teamA = els.inpTeamA.value;\n    config.teamB = els.inpTeamB.value;',
    'config.battingTeamName = els.inpTeamA.value;\n    config.bowlingTeamName = els.inpTeamB.value;'
);

// 4. Update the socket configUpdated and initialization to call populateTeamDropdowns
adminJs = adminJs.replace(
    'els.inpTeamA.value = config.teamA;\n    els.inpTeamB.value = config.teamB;',
    'populateTeamDropdowns();'
);

adminJs = adminJs.replace(
    'els.inpTeamA.value = config.teamA;\n        els.inpTeamB.value = config.teamB;',
    'populateTeamDropdowns();'
);

adminJs = adminJs.replace(
    'els.inpTeamA.value = config.teamA;\nels.inpTeamB.value = config.teamB;',
    'populateTeamDropdowns();'
);

fs.writeFileSync('d:/box_cricket/admin.js', adminJs);
console.log('admin.js patched successfully');
