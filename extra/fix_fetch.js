const fs = require('fs');

let adminJs = fs.readFileSync('d:/box_cricket/admin.js', 'utf8');

const fetchBlockOld = `        els.inpTournament.value = config.tournament;
        if (els.inpCategory && config.category) els.inpCategory.value = config.category;
        els.inpTeamA.value = config.teamA;
        els.inpTeamB.value = config.teamB;
        els.inpTarget.value = state.target;
        els.inpInnings.value = config.innings;
        els.inpTotalOvers.value = config.totalOvers;
        
        populatePlayerDropdowns();
        updateAdminUI();`;

const fetchBlockNew = `        els.inpTournament.value = config.tournament;
        if (els.inpCategory && config.category) els.inpCategory.value = config.category;
        els.inpTarget.value = state.target;
        els.inpInnings.value = config.innings;
        els.inpTotalOvers.value = config.totalOvers;
        
        populateTeamDropdowns();
        populatePlayerDropdowns();
        updateAdminUI();`;

adminJs = adminJs.replace(fetchBlockOld, fetchBlockNew);

const socketBlockOld = `    els.inpTournament.value = config.tournament;
    if (els.inpCategory && config.category) els.inpCategory.value = config.category;
    els.inpTeamA.value = config.teamA;
    els.inpTeamB.value = config.teamB;
    els.inpInnings.value = config.innings;
    els.inpTotalOvers.value = config.totalOvers;
    updateAdminUI();`;

const socketBlockNew = `    els.inpTournament.value = config.tournament;
    if (els.inpCategory && config.category) els.inpCategory.value = config.category;
    els.inpInnings.value = config.innings;
    els.inpTotalOvers.value = config.totalOvers;
    populateTeamDropdowns();
    updateAdminUI();`;

adminJs = adminJs.replace(socketBlockOld, socketBlockNew);

fs.writeFileSync('d:/box_cricket/admin.js', adminJs);
console.log('Fixed admin.js fetch and socket init!');
