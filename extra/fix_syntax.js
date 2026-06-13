const fs = require('fs');

let adminJs = fs.readFileSync('d:/box_cricket/admin.js', 'utf8');

const brokenPart = \`            if (!state.allBowlers) {
                state.allBowlers = [{ ...state.bowler }];
            }
    freeHitCheck: document.getElementById('free-hit-check'),\`;

const fixedPart = \`            if (!state.allBowlers) {
                state.allBowlers = [{ ...state.bowler }];
            }
        }
        if(data.config_data && Object.keys(data.config_data).length > 0) {
            config = data.config_data;
        }
        
        els.inpTournament.value = config.tournament;
        if (els.inpCategory && config.category) els.inpCategory.value = config.category;
        els.inpTarget.value = state.target;
        els.inpInnings.value = config.innings;
        els.inpTotalOvers.value = config.totalOvers;
        
        populateTeamDropdowns();
        populatePlayerDropdowns();
        updateAdminUI();
    });

socket.on('configUpdated', (data) => {
    config = data;
    els.inpTournament.value = config.tournament;
    if (els.inpCategory && config.category) els.inpCategory.value = config.category;
    els.inpInnings.value = config.innings;
    els.inpTotalOvers.value = config.totalOvers;
    populateTeamDropdowns();
    updateAdminUI();
});

const els = {
    freeHitCheck: document.getElementById('free-hit-check'),\`;

adminJs = adminJs.replace(brokenPart, fixedPart);

// Wait, I also need to check what else is missing. Let me add the missing part.
// I also notice line 89 has `inpBowler: document.getElementById('input-bowler'),` and then goes straight to `window.handleTeamSelectionChange = function()`
// It missed closing the `els` object!
// Let's fix that too.

const brokenPart2 = \`    inpStriker: document.getElementById('input-striker'),
    inpNonStriker: document.getElementById('input-non-striker'),
    inpBowler: document.getElementById('input-bowler'),
    

window.handleTeamSelectionChange = function() {\`;

const fixedPart2 = \`    inpStriker: document.getElementById('input-striker'),
    inpNonStriker: document.getElementById('input-non-striker'),
    inpBowler: document.getElementById('input-bowler'),
    inpNewBatsman: document.getElementById('input-new-batsman'),
    inpNewBowler: document.getElementById('input-new-bowler')
};

window.handleTeamSelectionChange = function() {\`;

adminJs = adminJs.replace(brokenPart2, fixedPart2);

fs.writeFileSync('d:/box_cricket/admin.js', adminJs);
console.log('Fixed syntax error in admin.js');
