const fs = require('fs');

let adminJs = fs.readFileSync('d:/box_cricket/admin.js', 'utf8');

const fetchBad = `        els.inpTournament.value = config.tournament;
        if (els.inpCategory && config.category) els.inpCategory.value = config.category;
        els.inpTeamA.value = config.teamA;
        els.inpTeamB.value = config.teamB;
        els.inpTarget.value = state.target;
        els.inpInnings.value = config.innings;
        els.inpTotalOvers.value = config.totalOvers;
        
        populatePlayerDropdowns();
        updateAdminUI();
    });`;

const fetchGood = `        els.inpTournament.value = config.tournament;
        if (els.inpCategory && config.category) els.inpCategory.value = config.category;
        els.inpTarget.value = state.target;
        els.inpInnings.value = config.innings;
        els.inpTotalOvers.value = config.totalOvers;
        
        populateTeamDropdowns();
        populatePlayerDropdowns();
        updateAdminUI();
    });`;

adminJs = adminJs.replace(fetchBad, fetchGood);

const socketBad = `socket.on('configUpdated', (data) => {
    config = data;
    els.inpTournament.value = config.tournament;
    if (els.inpCategory && config.category) els.inpCategory.value = config.category;
    els.inpTeamA.value = config.teamA;
    els.inpTeamB.value = config.teamB;
    els.inpInnings.value = config.innings;
    els.inpTotalOvers.value = config.totalOvers;
    updateAdminUI();
});`;

const socketGood = `socket.on('configUpdated', (data) => {
    config = data;
    els.inpTournament.value = config.tournament;
    if (els.inpCategory && config.category) els.inpCategory.value = config.category;
    els.inpInnings.value = config.innings;
    els.inpTotalOvers.value = config.totalOvers;
    populateTeamDropdowns();
    updateAdminUI();
});`;

adminJs = adminJs.replace(socketBad, socketGood);

const saveBad = `window.saveSettings = function() {
    config.tournament = els.inpTournament.value;
    if (els.inpCategory) config.category = els.inpCategory.value;
    config.teamA = els.inpTeamA.value;
    config.teamB = els.inpTeamB.value;`;

const saveGood = `window.saveSettings = function() {
    config.tournament = els.inpTournament.value;
    if (els.inpCategory) config.category = els.inpCategory.value;
    config.battingTeamName = els.inpTeamA.value;
    config.bowlingTeamName = els.inpTeamB.value;`;

adminJs = adminJs.replace(saveBad, saveGood);

fs.writeFileSync('d:/box_cricket/admin.js', adminJs);
console.log('Fixed admin.js successfully.');
