const backendUrl = typeof window !== 'undefined' ? `http://${window.location.hostname}:3000` : 'http://localhost:3000';
const socket = io(backendUrl);
// admin.js - Master State Manager

let config = {
    tournament: "KGK SAMAJ YUVA MANDAL ORGANISED BOX CRICKET TOURNAMENT",
    teamA: "",
    teamB: "",
    innings: 1,
    totalOvers: 6
};

let state = {
    teamRuns: 0,
    teamWickets: 0,
    totalBalls: 0, // 0 overs
    target: 0,
    freeHit: false,
    
    batsmen: [
        { id: 0, name: "Batsman 1", runs: 0, balls: 0, fours: 0, sixes: 0 },
        { id: 1, name: "Batsman 2", runs: 0, balls: 0, fours: 0, sixes: 0 }
    ],
    allBatsmen: [
        { id: 0, name: "Batsman 1", runs: 0, balls: 0, fours: 0, sixes: 0, status: "not out" },
        { id: 1, name: "Batsman 2", runs: 0, balls: 0, fours: 0, sixes: 0, status: "not out" }
    ],
    strikerIndex: 0,
    
    bowler: {
        id: 0,
        name: "Bowler",
        overs: 0,
        ballsInCurrentOver: 0,
        runs: 0,
        maidens: 0,
        wickets: 0
    },
    
    allBowlers: [
        { id: 0, name: "Bowler", overs: 0, ballsInCurrentOver: 0, runs: 0, maidens: 0, wickets: 0 }
    ],
    
    lastBalls: [],
    partnerRuns: 0,
    partnerBalls: 0,
    
    currentOverRuns: 0,
    currentOverWickets: 0,
    oversHistory: [],
    
    teamAPlayers: [],
    teamBPlayers: []
};

let undoStack = [];


fetch(`${backendUrl}/api/state`)
    .then(res => res.json())
    .then(data => {
        if(data.state_data && Object.keys(data.state_data).length > 0) {
            state = data.state_data;
            if (!state.allBatsmen) {
                state.allBatsmen = [
                    { id: state.batsmen[0].id, name: state.batsmen[0].name, runs: state.batsmen[0].runs, balls: state.batsmen[0].balls, fours: state.batsmen[0].fours, sixes: state.batsmen[0].sixes, status: "not out" },
                    { id: state.batsmen[1].id, name: state.batsmen[1].name, runs: state.batsmen[1].runs, balls: state.batsmen[1].balls, fours: state.batsmen[1].fours, sixes: state.batsmen[1].sixes, status: "not out" }
                ];
            }
            if (state.bowler.id === undefined) {
                state.bowler.id = 0;
            }
            if (!state.allBowlers) {
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
    freeHitCheck: document.getElementById('free-hit-check'),
    batsmanModal: document.getElementById('batsman-modal'),
    bowlerModal: document.getElementById('bowler-modal'),
    
    inpTournament: document.getElementById('input-tournament'),
    inpCategory: document.getElementById('input-category'),
    inpTeamA: document.getElementById('input-team-a'),
    inpTeamB: document.getElementById('input-team-b'),
    inpTarget: document.getElementById('input-target'),
    inpInnings: document.getElementById('input-innings'),
    inpTotalOvers: document.getElementById('input-total-overs'),
    
    inpStriker: document.getElementById('input-striker'),
    inpNonStriker: document.getElementById('input-non-striker'),
    inpBowler: document.getElementById('input-bowler'),
    inpNewBatsman: document.getElementById('input-new-batsman'),
    inpNewBowler: document.getElementById('input-new-bowler')
};

window.handleTeamSelectionChange = function() {
    populatePlayerDropdowns();
};

window.handleCategoryChange = function() {
    if (els.inpCategory) {
        config.category = els.inpCategory.value;
        socket.emit('updateConfig', config);
    }
};

function populateTeamDropdowns() {
    if (!els.inpTeamA || !els.inpTeamB) return;
    const allTeams = config.allTeams && config.allTeams.length > 0 ? config.allTeams : [config.teamA, config.teamB].filter(Boolean);
    const opts = allTeams.map(t => `<option value="${t}">${t}</option>`).join('');
    els.inpTeamA.innerHTML = opts;
    els.inpTeamB.innerHTML = opts;
    els.inpTeamA.value = config.battingTeamName || config.teamA;
    els.inpTeamB.value = config.bowlingTeamName || config.teamB;
}
function populatePlayerDropdowns() {
    if(!els.inpStriker || !els.inpNewBatsman) return;
    
    let battingSquad = [];
    let bowlingSquad = [];
    
    const teamAName = els.inpTeamA ? els.inpTeamA.value : '';
    const teamBName = els.inpTeamB ? els.inpTeamB.value : '';
    
    if (state.allTeamsPlayers) {
        battingSquad = state.allTeamsPlayers[teamAName] || [];
        bowlingSquad = state.allTeamsPlayers[teamBName] || [];
    }
    
    if (battingSquad.length === 0) {
        if (els.inpTeamA && els.inpTeamA.value === config.teamA) battingSquad = state.teamAPlayers || [];
        else battingSquad = state.teamBPlayers || [];
    }
    if (bowlingSquad.length === 0) {
        if (els.inpTeamB && els.inpTeamB.value === config.teamB) bowlingSquad = state.teamBPlayers || [];
        else bowlingSquad = state.teamAPlayers || [];
    }
    
    const batOptions = battingSquad.length > 0
        ? battingSquad.map(p => '<option value="' + p + '">' + p + '</option>').join('')
        : '<option value="">-- No Players --</option>';
    const bowlOptions = bowlingSquad.length > 0
        ? bowlingSquad.map(p => '<option value="' + p + '">' + p + '</option>').join('')
        : '<option value="">-- No Bowlers --</option>';

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

if(!state.teamAPlayers) state.teamAPlayers = [];
if(!state.teamBPlayers) state.teamBPlayers = [];

populatePlayerDropdowns();
function syncAllBatsmen() {
    if (!state.allBatsmen) return;
    for (let i = 0; i < 2; i++) {
        const striker = state.batsmen[i];
        const ab = state.allBatsmen.find(b => b.id === striker.id);
        if (ab) {
            ab.runs = striker.runs;
            ab.balls = striker.balls;
            ab.fours = striker.fours;
            ab.sixes = striker.sixes;
            ab.name = striker.name;
        }
    }
}

function syncAllBowlers() {
    if (!state.allBowlers) return;
    const ab = state.allBowlers.find(b => b.id === state.bowler.id);
    if (ab) {
        ab.overs = state.bowler.overs;
        ab.ballsInCurrentOver = state.bowler.ballsInCurrentOver;
        ab.runs = state.bowler.runs;
        ab.maidens = state.bowler.maidens;
        ab.wickets = state.bowler.wickets;
        ab.name = state.bowler.name;
    }
}

function broadcastUpdate() {
    syncAllBatsmen();
    syncAllBowlers();
    socket.emit('updateState', state);
    socket.emit('updateConfig', config);
}

let animationTimeout = null;
function showEventAnimation(type) {
    const overlay = document.getElementById('event-overlay');
    const text = document.getElementById('event-text');
    if(!overlay || !text) return;
    
    overlay.className = 'event-overlay';
    void overlay.offsetWidth; 
    
    if(type === 'OVERSUMMARY') {
        const summaryOverlay = document.getElementById('over-summary-overlay');
        if (summaryOverlay) {
            if (state.oversHistory && state.oversHistory.length > 0) {
                const lastOver = state.oversHistory[state.oversHistory.length - 1];
                document.getElementById('summary-over-num').innerText = lastOver.over;
                document.getElementById('summary-bowler').innerText = state.bowler.name;
                document.getElementById('summary-runs').innerText = lastOver.runs;
                document.getElementById('summary-wickets').innerText = lastOver.wickets;
            }
            summaryOverlay.className = 'event-overlay active';
            if(animationTimeout) clearTimeout(animationTimeout);
            animationTimeout = setTimeout(() => {
                summaryOverlay.classList.remove('active');
            }, 6000);
        }
        return;
    } else if(type === 'SIX') {
        text.innerText = "SIX!";
        text.className = 'event-text event-six';
    } else if(type === 'FOUR') {
        text.innerText = "FOUR!";
        text.className = 'event-text event-four';
    } else if(type === 'WICKET') {
        text.innerText = "OUT!";
        text.className = 'event-text event-wicket';
    } else if(type === 'NOTOUT') {
        text.innerText = "NOT OUT!";
        text.className = 'event-text event-notout';
    } else if(type === 'WIDE') {
        text.innerText = "WIDE!";
        text.className = 'event-text event-wide';
    } else if(type === 'NOBALL') {
        text.innerText = "FREE HIT!";
        text.className = 'event-text event-noball';
    } else if (type === 'INNINGS_COMPLETE') {
        text.innerText = "1ST INNINGS COMPLETE!";
        text.className = 'event-text event-six';
    } else {
        return;
    }
    
    overlay.className = 'event-overlay active';
    
    if(animationTimeout) clearTimeout(animationTimeout);
    animationTimeout = setTimeout(() => {
        overlay.classList.remove('active');
    }, 3500);
}

function triggerAnimation(type) {
    socket.emit('triggerEvent', type);
    showEventAnimation(type); // Show on Admin panel too
}

function saveState() {
    undoStack.push(JSON.parse(JSON.stringify(state)));
    if (undoStack.length > 10) undoStack.shift();
}

function swapBatsmen() {
    state.strikerIndex = state.strikerIndex === 0 ? 1 : 0;
}

function updateLastBalls(eventStr) {
    state.lastBalls.push(eventStr);
    if (state.lastBalls.length > 6) state.lastBalls.shift();
}

function checkOverComplete() {
    if (state.bowler.ballsInCurrentOver === 6) {
        state.oversHistory.push({
            over: state.oversHistory.length + 1,
            runs: state.currentOverRuns,
            wickets: state.currentOverWickets
        });
        state.currentOverRuns = 0;
        state.currentOverWickets = 0;
        
        state.bowler.overs += 1;
        state.bowler.ballsInCurrentOver = 0;
        swapBatsmen();
        
        // Broadcast the updated state (with oversHistory) first
        broadcastUpdate();
        
        if (state.bowler.overs === config.totalOvers) {
            // First trigger the end of over summary
            triggerAnimation('OVERSUMMARY');
            
            if (config.innings === 1) {
                // Show "Innings Complete" after the over summary finishes (6 seconds)
                setTimeout(() => {
                    triggerAnimation('INNINGS_COMPLETE');
                }, 6000);
                
                // Show scorecard after the innings complete animation finishes (6s + 3.5s = 9.5 seconds)
                setTimeout(() => {
                    triggerAnimation('SCORECARD_TOGGLE');
                }, 9500);
            }
        } else {
            // Then trigger the summary overlay animation
            triggerAnimation('OVERSUMMARY');
            els.bowlerModal.style.display = 'flex';
        }
    }
}

// Actions
window.addRuns = function(runs) {
    saveState();
    
    const isLastBallOfOver = (state.bowler.ballsInCurrentOver + 1 === 6);
    const actualRuns = isLastBallOfOver ? (runs * 2) : runs;
    
    state.teamRuns += actualRuns;
    state.totalBalls += 1;
    state.partnerRuns += actualRuns;
    state.partnerBalls += 1;
    state.currentOverRuns += actualRuns;
    
    const striker = state.batsmen[state.strikerIndex];
    striker.runs += actualRuns;
    striker.balls += 1;
    if (runs === 4) {
        striker.fours += 1;
        triggerAnimation('FOUR');
    }
    if (runs === 6) {
        striker.sixes += 1;
        triggerAnimation('SIX');
    }
    
    state.bowler.runs += actualRuns;
    state.bowler.ballsInCurrentOver += 1;
    
    updateLastBalls(actualRuns.toString());
    
    if (state.freeHit) {
        state.freeHit = false;
        els.freeHitCheck.checked = false;
    }
    
    if (runs % 2 !== 0) swapBatsmen();
    checkOverComplete();
    broadcastUpdate();
};

window.addExtra = function(type) {
    saveState();
    if (type === 'WIDE') {
        state.teamRuns += 1;
        state.currentOverRuns += 1;
        state.bowler.runs += 1;
        updateLastBalls('WD');
        triggerAnimation('WIDE');
    } else if (type === 'NB') {
        state.teamRuns += 1;
        state.currentOverRuns += 1;
        state.bowler.runs += 1;
        state.freeHit = true;
        els.freeHitCheck.checked = true;
        updateLastBalls('NB');
        triggerAnimation('NOBALL');
    } else if (type === 'LB' || type === 'B') {
        const isLastBallOfOver = (state.bowler.ballsInCurrentOver + 1 === 6);
        const extraRuns = isLastBallOfOver ? 2 : 1;
        
        state.teamRuns += extraRuns;
        state.currentOverRuns += extraRuns;
        state.totalBalls += 1;
        state.partnerRuns += extraRuns;
        state.partnerBalls += 1;
        state.batsmen[state.strikerIndex].balls += 1;
        state.bowler.ballsInCurrentOver += 1;
        updateLastBalls(isLastBallOfOver ? `2${type}` : type);
        swapBatsmen();
        checkOverComplete();
    }
    broadcastUpdate();
};

window.addWicket = function() {
    saveState();
    if (state.freeHit) {
        alert("Cannot take wicket on a Free Hit (unless run out).");
        state.freeHit = false;
        els.freeHitCheck.checked = false;
        state.totalBalls += 1;
        state.bowler.ballsInCurrentOver += 1;
        state.batsmen[state.strikerIndex].balls += 1;
        checkOverComplete();
        updateLastBalls('0');
        broadcastUpdate();
        return;
    }

    const isLastBallOfOver = (state.bowler.ballsInCurrentOver + 1 === 6);

    state.teamWickets += 1;
    state.currentOverWickets += 1;
    state.totalBalls += 1;
    state.bowler.ballsInCurrentOver += 1;
    state.bowler.wickets += 1;
    state.batsmen[state.strikerIndex].balls += 1;
    
    if (isLastBallOfOver) {
        state.teamRuns -= 5;
        state.currentOverRuns -= 5;
        updateLastBalls('W(-5)');
    } else {
        updateLastBalls('W');
    }
    triggerAnimation('WICKET');
    
    state.partnerRuns = 0;
    state.partnerBalls = 0;
    
    const striker = state.batsmen[state.strikerIndex];
    if (state.allBatsmen) {
        const ab = state.allBatsmen.find(b => b.id === striker.id);
        if (ab) ab.status = "out"; 
    }
    
    striker.id = state.allBatsmen ? state.allBatsmen.length : Date.now();
    striker.runs = 0;
    striker.balls = 0;
    striker.fours = 0;
    striker.sixes = 0;
    
    els.batsmanModal.style.display = 'flex';
    broadcastUpdate();
};

window.retireBatsman = function() {
    saveState();
    const striker = state.batsmen[state.strikerIndex];
    if (state.allBatsmen) {
        const ab = state.allBatsmen.find(b => b.id === striker.id);
        if (ab) ab.status = "retired";
    }
    striker.id = state.allBatsmen ? state.allBatsmen.length : Date.now();
    striker.runs = 0;
    striker.balls = 0;
    striker.fours = 0;
    striker.sixes = 0;
    
    els.batsmanModal.style.display = 'flex';
    broadcastUpdate();
};

window.undoLastBall = function() {
    if (undoStack.length === 0) return alert("No more actions to undo.");
    state = undoStack.pop();
    els.freeHitCheck.checked = state.freeHit;
    broadcastUpdate();
};

els.freeHitCheck.addEventListener('change', (e) => {
    state.freeHit = e.target.checked;
    broadcastUpdate();
});

// Admin Setup Handlers
window.saveSettings = function() {
    const strikerVal = els.inpStriker.value;
    const nonStrikerVal = els.inpNonStriker.value;
    if (strikerVal && nonStrikerVal && strikerVal === nonStrikerVal) {
        alert("Error: Striker and non-striker cannot be the same player!");
        return;
    }

    config.tournament = els.inpTournament.value;
    if (els.inpCategory) config.category = els.inpCategory.value;
    config.teamA = els.inpTeamA.value;
    config.teamB = els.inpTeamB.value;
    if (state.allTeamsPlayers) {
        state.teamAPlayers = state.allTeamsPlayers[config.teamA] || [];
        state.teamBPlayers = state.allTeamsPlayers[config.teamB] || [];
    }
    config.innings = parseInt(els.inpInnings.value) || 2;
    config.totalOvers = parseInt(els.inpTotalOvers.value) || 6;
    state.target = parseInt(els.inpTarget.value) || 0;
    
    state.batsmen[0].name = strikerVal || "Batsman 1";
    state.batsmen[1].name = nonStrikerVal || "Batsman 2";
    state.bowler.name = els.inpBowler.value || "Bowler";
    
    broadcastUpdate();
    alert("Settings Saved & Synced!");
};

window.resetMatch = function() {
    if(!confirm("Are you sure you want to reset the match to 0-0?")) return;
    
    // Reset match state
    state.teamRuns = 0;
    state.teamWickets = 0;
    state.totalBalls = 0;
    state.lastBalls = [];
    state.partnerRuns = 0;
    state.partnerBalls = 0;
    state.strikerIndex = 0;
    state.target = 0;
    state.currentOverRuns = 0;
    state.currentOverWickets = 0;
    state.oversHistory = [];
    
    // Reset config to 1st Innings
    config.innings = 1;
    
    // Update admin UI inputs
    els.inpTarget.value = 0;
    els.inpInnings.value = 1;
    
    state.allBatsmen = [
        { id: 0, name: els.inpStriker.value || "Batsman 1", runs: 0, balls: 0, fours: 0, sixes: 0, status: "not out" },
        { id: 1, name: els.inpNonStriker.value || "Batsman 2", runs: 0, balls: 0, fours: 0, sixes: 0, status: "not out" }
    ];
    
    state.batsmen[0] = { id: 0, name: els.inpStriker.value || "Batsman 1", runs: 0, balls: 0, fours: 0, sixes: 0 };
    state.batsmen[1] = { id: 1, name: els.inpNonStriker.value || "Batsman 2", runs: 0, balls: 0, fours: 0, sixes: 0 };
    
    state.allBowlers = [
        { id: 0, name: els.inpBowler.value || "Bowler", overs: 0, ballsInCurrentOver: 0, runs: 0, maidens: 0, wickets: 0 }
    ];
    state.bowler = { id: 0, name: els.inpBowler.value || "Bowler", overs: 0, ballsInCurrentOver: 0, runs: 0, maidens: 0, wickets: 0 };
    
    undoStack = [];
    broadcastUpdate();
    populatePlayerDropdowns();
    alert("Match Reset! Now in 1st Innings.");
};

window.startSecondInnings = function() {
    if(!confirm("Start 2nd Innings? This will set the target, clear current score, and reset scorecards. Team names will be swapped!")) return;
    
    state.target = state.teamRuns + 1;
    els.inpTarget.value = state.target;
    
    config.innings = 2;
    els.inpInnings.value = 2;
    
    const tempTeam = els.inpTeamA.value;
    els.inpTeamA.value = els.inpTeamB.value;
    els.inpTeamB.value = tempTeam;
    config.teamA = els.inpTeamA.value;
    config.teamB = els.inpTeamB.value;
    
    state.teamRuns = 0;
    state.teamWickets = 0;
    state.totalBalls = 0;
    state.lastBalls = [];
    state.partnerRuns = 0;
    state.partnerBalls = 0;
    state.strikerIndex = 0;
    state.currentOverRuns = 0;
    state.currentOverWickets = 0;
    state.oversHistory = [];
    
    state.allBatsmen = [
        { id: 0, name: els.inpStriker.value || "Batsman 1", runs: 0, balls: 0, fours: 0, sixes: 0, status: "not out" },
        { id: 1, name: els.inpNonStriker.value || "Batsman 2", runs: 0, balls: 0, fours: 0, sixes: 0, status: "not out" }
    ];
    
    state.batsmen[0] = { id: 0, name: els.inpStriker.value || "Batsman 1", runs: 0, balls: 0, fours: 0, sixes: 0 };
    state.batsmen[1] = { id: 1, name: els.inpNonStriker.value || "Batsman 2", runs: 0, balls: 0, fours: 0, sixes: 0 };
    
    state.allBowlers = [
        { id: 0, name: els.inpBowler.value || "Bowler", overs: 0, ballsInCurrentOver: 0, runs: 0, maidens: 0, wickets: 0 }
    ];
    state.bowler = { id: 0, name: els.inpBowler.value || "Bowler", overs: 0, ballsInCurrentOver: 0, runs: 0, maidens: 0, wickets: 0 };
    
    undoStack = [];
    broadcastUpdate();
    populatePlayerDropdowns();
    alert("2nd Innings Started! Target is " + state.target);
};

window.showNotOut = function() {
    triggerAnimation('NOTOUT');
};

let isGraphVisible = false;
window.toggleAnalysisGraph = function() {
    socket.emit('triggerEvent', 'graph_toggle'.toUpperCase());
    isGraphVisible = !isGraphVisible;
    const graphOverlay = document.getElementById('graph-overlay');
    if (graphOverlay) {
        if (isGraphVisible) {
            renderGraph();
            graphOverlay.classList.add('active');
        } else {
            graphOverlay.classList.remove('active');
        }
    }
};

window.hideAnalysisGraph = function() {
    socket.emit('triggerEvent', 'graph_hide'.toUpperCase());
    isGraphVisible = false;
    const graphOverlay = document.getElementById('graph-overlay');
    if (graphOverlay) {
        graphOverlay.classList.remove('active');
    }
};

let isBatterSummaryVisible = false;
window.toggleBatterSummary = function() {
    socket.emit('triggerEvent', 'batter_summary_toggle'.toUpperCase());
    isBatterSummaryVisible = !isBatterSummaryVisible;
    const overlay = document.getElementById('batter-summary-overlay');
    if (overlay) {
        if (isBatterSummaryVisible) {
            renderBatterSummary();
            overlay.classList.add('active');
        } else {
            overlay.classList.remove('active');
        }
    }
};

window.hideBatterSummary = function() {
    socket.emit('triggerEvent', 'batter_summary_hide'.toUpperCase());
    isBatterSummaryVisible = false;
    const overlay = document.getElementById('batter-summary-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
};

let isScorecardVisible = false;
window.toggleScorecard = function() {
    socket.emit('triggerEvent', 'scorecard_toggle'.toUpperCase());
    isScorecardVisible = !isScorecardVisible;
    const overlay = document.getElementById('scorecard-overlay');
    if (overlay) {
        if (isScorecardVisible) {
            renderScorecard();
            overlay.classList.add('active');
        } else {
            overlay.classList.remove('active');
        }
    }
};

window.hideScorecard = function() {
    socket.emit('triggerEvent', 'scorecard_hide'.toUpperCase());
    isScorecardVisible = false;
    const overlay = document.getElementById('scorecard-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
};

let isBowlingScorecardVisible = false;
window.toggleBowlingScorecard = function() {
    socket.emit('triggerEvent', 'bowling_scorecard_toggle'.toUpperCase());
    isBowlingScorecardVisible = !isBowlingScorecardVisible;
    const overlay = document.getElementById('bowling-scorecard-overlay');
    if (overlay) {
        if (isBowlingScorecardVisible) {
            renderBowlingScorecard();
            overlay.classList.add('active');
        } else {
            overlay.classList.remove('active');
        }
    }
};

window.hideBowlingScorecard = function() {
    socket.emit('triggerEvent', 'bowling_scorecard_hide'.toUpperCase());
    isBowlingScorecardVisible = false;
    const overlay = document.getElementById('bowling-scorecard-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
};

function renderBowlingScorecard() {
    const tbody = document.getElementById('bowling-scorecard-body');
    if (!tbody || !state.allBowlers) return;
    
    tbody.innerHTML = '';
    
    state.allBowlers.forEach(b => {
        const oversFormatted = `${b.overs}.${b.ballsInCurrentOver}`;
        const totalBalls = (b.overs * 6) + b.ballsInCurrentOver;
        const econ = totalBalls === 0 ? "0.0" : ((b.runs / totalBalls) * 6).toFixed(1);
        
        const tr = document.createElement('tr');
        tr.style.borderBottom = "1px solid rgba(255,255,255,0.1)";
        tr.innerHTML = `
            <td style="padding: 12px 15px; font-weight: bold;">${b.name}</td>
            <td style="padding: 12px 15px; text-align: center;">${oversFormatted}</td>
            <td style="padding: 12px 15px; text-align: center;">${b.maidens}</td>
            <td style="padding: 12px 15px; text-align: center; color: #FF5252; font-weight: bold;">${b.runs}</td>
            <td style="padding: 12px 15px; text-align: center; color: #00E676; font-weight: bold;">${b.wickets}</td>
            <td style="padding: 12px 15px; text-align: center;">${econ}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderScorecard() {
    const tbody = document.getElementById('scorecard-body');
    if (!tbody || !state.allBatsmen) return;
    
    tbody.innerHTML = '';
    let totalBatterRuns = 0;
    
    state.allBatsmen.forEach(b => {
        totalBatterRuns += b.runs;
        const sr = b.balls === 0 ? "0.0" : ((b.runs / b.balls) * 100).toFixed(1);
        const tr = document.createElement('tr');
        tr.style.borderBottom = "1px solid rgba(255,255,255,0.1)";
        tr.innerHTML = `
            <td style="padding: 12px 15px; font-weight: bold;">${b.name}</td>
            <td style="padding: 12px 15px; color: ${(b.status || 'not out') === 'not out' ? '#00E676' : ((b.status || 'not out') === 'retired' ? '#FF9800' : '#FF1744')};">${(b.status || 'not out').toUpperCase()}</td>
            <td style="padding: 12px 15px; text-align: center; color: white; font-weight: bold;">${b.runs}</td>
            <td style="padding: 12px 15px; text-align: center;">${b.balls}</td>
            <td style="padding: 12px 15px; text-align: center;">${b.fours}</td>
            <td style="padding: 12px 15px; text-align: center;">${b.sixes}</td>
            <td style="padding: 12px 15px; text-align: center;">${sr}</td>
        `;
        tbody.appendChild(tr);
    });
    
    document.getElementById('scorecard-total-runs').innerText = state.teamRuns;
    document.getElementById('scorecard-total-wickets').innerText = state.teamWickets;
    document.getElementById('scorecard-total-overs').innerText = `${Math.floor(state.totalBalls / 6)}.${state.totalBalls % 6}`;
    
    const extras = state.teamRuns - totalBatterRuns;
    document.getElementById('scorecard-total-extras').innerText = extras;
}

function renderBatterSummary() {
    for (let i = 0; i < 2; i++) {
        const b = state.batsmen[i];
        const elName = document.getElementById('bs-name-' + i);
        if(!elName) return; 
        elName.innerText = b.name + (state.strikerIndex === i ? ' ▶' : '');
        document.getElementById('bs-runs-' + i).innerText = b.runs;
        document.getElementById('bs-balls-' + i).innerText = b.balls;
        document.getElementById('bs-4s-' + i).innerText = b.fours;
        document.getElementById('bs-6s-' + i).innerText = b.sixes;
        const sr = b.balls === 0 ? "0.0" : ((b.runs / b.balls) * 100).toFixed(1);
        document.getElementById('bs-sr-' + i).innerText = sr;
    }
}

function renderGraph() {
    const container = document.getElementById('chart-container');
    if (!container) return;
    container.innerHTML = '';
    
    let allOvers = [...(state.oversHistory || [])];
    
    if (state.bowler.ballsInCurrentOver > 0 || (state.currentOverRuns || 0) > 0 || (state.currentOverWickets || 0) > 0) {
        allOvers.push({
            over: state.oversHistory.length + 1,
            runs: state.currentOverRuns || 0,
            wickets: state.currentOverWickets || 0
        });
    }
    
    if (allOvers.length === 0) return;
    
    const maxRuns = Math.max(...allOvers.map(o => o.runs), 10);
    
    allOvers.forEach(o => {
        const heightPct = (o.runs / maxRuns) * 100;
        
        const wrapper = document.createElement('div');
        wrapper.className = 'bar-wrapper';
        
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = `${Math.max(5, heightPct)}%`;
        
        for (let i = 0; i < o.wickets; i++) {
            const w = document.createElement('div');
            w.className = 'wicket-dot';
            bar.appendChild(w);
        }
        
        if (o.runs > 0 || o.wickets > 0) {
            const runsLabel = document.createElement('div');
            runsLabel.className = 'bar-runs';
            runsLabel.innerText = o.runs;
            wrapper.appendChild(runsLabel);
        }
        
        const label = document.createElement('div');
        label.className = 'bar-label';
        label.innerText = `Ov ${o.over}`;

        wrapper.appendChild(bar);
        wrapper.appendChild(label);
        
        container.appendChild(wrapper);
    });
}

window.saveNewBatsman = function() {
    const name = document.getElementById('input-new-batsman').value || "New Batsman";
    const striker = state.batsmen[state.strikerIndex];
    
    let existing = null;
    if (state.allBatsmen) {
        existing = state.allBatsmen.find(b => b.name === name);
    }
    
    if (existing) {
        striker.id = existing.id;
        striker.name = existing.name;
        striker.runs = existing.runs;
        striker.balls = existing.balls;
        striker.fours = existing.fours;
        striker.sixes = existing.sixes;
        existing.status = "not out";
    } else {
        striker.name = name;
        if (state.allBatsmen) {
            state.allBatsmen.push({
                id: striker.id,
                name: striker.name,
                runs: 0,
                balls: 0,
                fours: 0,
                sixes: 0,
                status: "not out"
            });
        }
    }
    
    document.getElementById('input-new-batsman').value = ""; 
    els.batsmanModal.style.display = 'none';
    checkOverComplete();
    broadcastUpdate();
};

window.saveNewBowler = function() {
    const name = document.getElementById('input-new-bowler').value || "New Bowler";
    
    let existing = null;
    if (state.allBowlers) {
        existing = state.allBowlers.find(b => b.name.toLowerCase() === name.toLowerCase());
    }
    
    if (existing) {
        state.bowler = { ...existing };
    } else {
        const newId = state.allBowlers ? state.allBowlers.length : Date.now();
        state.bowler = { id: newId, name: name, overs: 0, ballsInCurrentOver: 0, runs: 0, maidens: 0, wickets: 0 };
        if (state.allBowlers) {
            state.allBowlers.push({ ...state.bowler });
        }
    }
    
    document.getElementById('input-new-bowler').value = ""; 
    els.bowlerModal.style.display = 'none';
    broadcastUpdate();
};

// Listen for updates from other tabs (like teams.html)


// Initial Sync
broadcastUpdate();
