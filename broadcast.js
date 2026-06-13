// broadcast.js - Listens to localStorage and updates UI

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
    totalBalls: 0,
    target: 0,
    freeHit: false,
    batsmen: [
        { id: 0, name: "Batsman 1", runs: 0, balls: 0, fours: 0, sixes: 0 },
        { id: 1, name: "Batsman 2", runs: 0, balls: 0, fours: 0, sixes: 0 }
    ],
    strikerIndex: 0,
    bowler: { name: "Bowler", overs: 0, ballsInCurrentOver: 0, runs: 0, maidens: 0, wickets: 0 },
    lastBalls: [],
    partnerRuns: 0, partnerBalls: 0
};

const els = {
    runs: document.getElementById('runs'),
    wickets: document.getElementById('wickets'),
    overs: document.getElementById('overs'),
    crr: document.getElementById('crr'),
    rrr: document.getElementById('rrr'),
    partnerRuns: document.getElementById('partner-runs'),
    partnerBalls: document.getElementById('partner-balls'),
    lastBallsContainer: document.getElementById('last-balls'),

    strikerRow: document.getElementById('striker-row'),
    nonStrikerRow: document.getElementById('non-striker-row'),
    sRuns: document.getElementById('striker-runs'),
    sBalls: document.getElementById('striker-balls'),
    s4s: document.getElementById('striker-4s'),
    s6s: document.getElementById('striker-6s'),
    sSr: document.getElementById('striker-sr'),
    nsRuns: document.getElementById('non-striker-runs'),
    nsBalls: document.getElementById('non-striker-balls'),
    ns4s: document.getElementById('non-striker-4s'),
    ns6s: document.getElementById('non-striker-6s'),
    nsSr: document.getElementById('non-striker-sr'),

    bOvers: document.getElementById('bowler-overs'),
    bMaidens: document.getElementById('bowler-maidens'),
    bRuns: document.getElementById('bowler-runs'),
    bWickets: document.getElementById('bowler-wickets'),
    bEco: document.getElementById('bowler-eco'),

    runsNeeded: document.getElementById('runs-needed'),
    ballsRem: document.getElementById('balls-rem'),
    winProbBar: document.getElementById('win-prob-bar'),
    liveTime: document.getElementById('live-time'),
    totalOversDisplay: document.getElementById('total-overs-display'),
    freeHitBadge: document.getElementById('free-hit-badge'),

    inningsDisplay: document.getElementById('innings-display'),
    i1View: document.getElementById('innings-1-view'),
    i2View: document.getElementById('innings-2-view'),
    i1Runs: document.getElementById('i1-runs'),
    i1BallsRem: document.getElementById('i1-balls-rem'),
    i1RR: document.getElementById('i1-rr'),
    i1Wkts: document.getElementById('i1-wkts'),

    dispTournament: document.querySelector('.tournament-name'),
    dispTeamA: document.getElementById('team-a-name'),
    dispTeamB: document.getElementById('team-b-name'),
    dispBattingTeam: document.getElementById('batting-team-name'),
    playerRow0Name: document.querySelectorAll('.player-name')[0],
    playerRow1Name: document.querySelectorAll('.player-name')[1],
    bowlerName: document.querySelectorAll('.player-name')[2]
};

function getOversDisplay(totalBalls) { return `${Math.floor(totalBalls / 6)}.${totalBalls % 6}`; }
function getStrikeRate(runs, balls) { return balls === 0 ? "0.0" : ((runs / balls) * 100).toFixed(1); }
function getEconomy(runs, totalBalls) { return totalBalls === 0 ? "0.0" : (runs / (totalBalls / 6)).toFixed(1); }

setInterval(() => {
    els.liveTime.innerText = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}, 1000);

function animateElement(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.classList.remove('score-update');
    void el.offsetWidth;
    el.classList.add('score-update');
}

function getPlayerImageHtml(name) {
    if (state.playerImages && state.playerImages[name]) {
        return `<img src="${state.playerImages[name]}" style="width:35px; height:35px; border-radius:50%; object-fit:cover; border:2px solid var(--primary-accent); vertical-align:middle; margin-right:10px;">`;
    }
    return '';
}

function refreshUI() {
    // Config updates
    const categoryText = config.category ? ` [${config.category}]` : '';
    els.dispTournament.innerText = config.tournament + categoryText;
    els.dispTeamA.innerText = config.teamA;
    els.dispTeamB.innerText = config.teamB;
    const battingTeamName = config.battingTeamName || config.teamA;
    els.dispBattingTeam.innerText = battingTeamName;

    // Score updates
    const oldRuns = els.runs.innerText;
    const oldWickets = els.wickets.innerText;

    if (els.freeHitBadge) {
        els.freeHitBadge.style.display = state.freeHit ? 'block' : 'none';
    }

    els.runs.innerText = state.teamRuns;
    els.wickets.innerText = state.teamWickets;
    els.overs.innerText = getOversDisplay(state.totalBalls);

    if (oldRuns != state.teamRuns) animateElement('runs');
    if (oldWickets != state.teamWickets) animateElement('wickets');

    const oversF = state.totalBalls / 6;
    const currentRR = oversF > 0 ? (state.teamRuns / oversF).toFixed(2) : "0.00";
    els.crr.innerText = currentRR;

    const runsNeeded = Math.max(0, state.target - state.teamRuns);
    const totalMatchBalls = config.totalOvers * 6;
    const ballsRem = Math.max(0, totalMatchBalls - state.totalBalls);

    if (els.totalOversDisplay) els.totalOversDisplay.innerText = config.totalOvers + ".0";

    // Innings Toggle
    els.inningsDisplay.innerText = config.innings === 1 ? "1ST INNINGS" : "2ND INNINGS";

    if (config.innings === 1) {
        els.i1View.style.display = 'flex';
        els.i2View.style.display = 'none';

        els.i1Runs.innerText = state.teamRuns;
        els.i1BallsRem.innerText = ballsRem;
        els.i1RR.innerText = currentRR;
        els.i1Wkts.innerText = 7 - state.teamWickets; // 8 players = 7 wickets max
        els.rrr.innerText = "-";
    } else {
        els.i1View.style.display = 'none';
        els.i2View.style.display = 'flex';

        els.rrr.innerText = ballsRem > 0 ? ((runsNeeded / ballsRem) * 6).toFixed(2) : "-";
        els.runsNeeded.innerText = runsNeeded;
        els.ballsRem.innerText = ballsRem;

        let baseProb = 50;
        if (runsNeeded <= 0) baseProb = 100;
        else if (ballsRem <= 0) baseProb = 0;
        else {
            const reqRate = (runsNeeded / ballsRem) * 6;
            const cRate = (state.teamRuns / (state.totalBalls / 6));
            const diff = cRate - reqRate;
            baseProb = 50 + (diff * 5);
            baseProb = Math.max(5, Math.min(95, baseProb));
        }
        els.winProbBar.style.width = `${baseProb}%`;
        els.winProbBar.innerText = `${Math.round(baseProb)}%`;
        els.winProbBar.nextElementSibling.innerText = `${Math.round(100 - baseProb)}%`;
    }

    els.partnerRuns.innerText = state.partnerRuns;
    els.partnerBalls.innerText = state.partnerBalls;

    if (state.strikerIndex === 0) {
        els.strikerRow.classList.add('active-striker');
        els.nonStrikerRow.classList.remove('active-striker');
    } else {
        els.nonStrikerRow.classList.add('active-striker');
        els.strikerRow.classList.remove('active-striker');
    }

    els.playerRow0Name.innerHTML = `${getPlayerImageHtml(state.batsmen[0].name)} ${state.batsmen[0].name} <span class="striker-indicator" style="opacity:${state.strikerIndex === 0 ? 1 : 0}">▶</span>`;
    els.playerRow1Name.innerHTML = `${getPlayerImageHtml(state.batsmen[1].name)} ${state.batsmen[1].name} <span class="striker-indicator" style="opacity:${state.strikerIndex === 1 ? 1 : 0}">▶</span>`;

    els.sRuns.innerText = state.batsmen[0].runs;
    els.sBalls.innerText = state.batsmen[0].balls;
    els.s4s.innerText = state.batsmen[0].fours;
    els.s6s.innerText = state.batsmen[0].sixes;
    els.sSr.innerText = getStrikeRate(state.batsmen[0].runs, state.batsmen[0].balls);

    els.nsRuns.innerText = state.batsmen[1].runs;
    els.nsBalls.innerText = state.batsmen[1].balls;
    els.ns4s.innerText = state.batsmen[1].fours;
    els.ns6s.innerText = state.batsmen[1].sixes;
    els.nsSr.innerText = getStrikeRate(state.batsmen[1].runs, state.batsmen[1].balls);

    els.bowlerName.innerHTML = `${getPlayerImageHtml(state.bowler.name)} ${state.bowler.name}`;
    const totalBowlerBalls = (state.bowler.overs * 6) + state.bowler.ballsInCurrentOver;
    els.bOvers.innerText = `${state.bowler.overs}.${state.bowler.ballsInCurrentOver}`;
    els.bMaidens.innerText = state.bowler.maidens;
    els.bRuns.innerText = state.bowler.runs;
    els.bWickets.innerText = state.bowler.wickets;
    els.bEco.innerText = getEconomy(state.bowler.runs, totalBowlerBalls);

    els.lastBallsContainer.innerHTML = '';
    state.lastBalls.forEach(ball => {
        const span = document.createElement('span');
        span.className = 'ball';
        if (ball === 'W' || (typeof ball === 'string' && ball.startsWith('W'))) span.classList.add('wicket');
        else if (ball === '4' || ball === '8') span.classList.add('runs-4');
        else if (ball === '6' || ball === '12') span.classList.add('runs-6');
        else if (ball === '0') span.classList.add('runs-0');
        span.innerText = ball;
        els.lastBallsContainer.appendChild(span);
    });
}

const backendUrl = typeof window !== 'undefined' ? `http://${window.location.hostname}:3000` : 'http://localhost:3000';
const socket = io(backendUrl);

function loadState() {
    fetch(`${backendUrl}/api/state`)
        .then(res => res.json())
        .then(data => {
            if (data.state_data && Object.keys(data.state_data).length > 0) Object.assign(state, data.state_data);
            if (data.config_data && Object.keys(data.config_data).length > 0) Object.assign(config, data.config_data);
            refreshUI();
        })
        .catch(err => console.error("Error loading state:", err));
}

socket.on('stateUpdated', (data) => {
    Object.assign(state, data);
    refreshUI();
});

socket.on('configUpdated', (data) => {
    Object.assign(config, data);
    refreshUI();
});

let isGraphVisible = false;
let isBatterSummaryVisible = false;
let isScorecardVisible = false;
let isBowlingScorecardVisible = false;
let isSquadsVisible = false;

let graphTimeout = null;
let batterSummaryTimeout = null;
let scorecardTimeout = null;
let bowlingScorecardTimeout = null;
let squadsTimeout = null;

socket.on('showEvent', (type) => {
    if (type === 'GRAPH_TOGGLE') {
        isGraphVisible = !isGraphVisible;
        const graphOverlay = document.getElementById('graph-overlay');
        if (graphOverlay) {
            if (isGraphVisible) {
                renderGraph();
                graphOverlay.classList.add('active');
                if (graphTimeout) clearTimeout(graphTimeout);
                graphTimeout = setTimeout(() => {
                    isGraphVisible = false;
                    graphOverlay.classList.remove('active');
                }, 3000);
            } else {
                graphOverlay.classList.remove('active');
                if (graphTimeout) clearTimeout(graphTimeout);
            }
        }
    } else if (type === 'GRAPH_HIDE') {
        isGraphVisible = false;
        const graphOverlay = document.getElementById('graph-overlay');
        if (graphOverlay) graphOverlay.classList.remove('active');
        if (graphTimeout) clearTimeout(graphTimeout);
    } else if (type === 'BATTER_SUMMARY_TOGGLE') {
        isBatterSummaryVisible = !isBatterSummaryVisible;
        const overlay = document.getElementById('batter-summary-overlay');
        if (overlay) {
            if (isBatterSummaryVisible) {
                renderBatterSummary();
                overlay.classList.add('active');
                if (batterSummaryTimeout) clearTimeout(batterSummaryTimeout);
                batterSummaryTimeout = setTimeout(() => {
                    isBatterSummaryVisible = false;
                    overlay.classList.remove('active');
                }, 3000);
            } else {
                overlay.classList.remove('active');
                if (batterSummaryTimeout) clearTimeout(batterSummaryTimeout);
            }
        }
    } else if (type === 'BATTER_SUMMARY_HIDE') {
        isBatterSummaryVisible = false;
        const overlay = document.getElementById('batter-summary-overlay');
        if (overlay) overlay.classList.remove('active');
        if (batterSummaryTimeout) clearTimeout(batterSummaryTimeout);
    } else if (type === 'SCORECARD_TOGGLE') {
        isScorecardVisible = !isScorecardVisible;
        const overlay = document.getElementById('scorecard-overlay');
        if (overlay) {
            if (isScorecardVisible) {
                renderScorecard();
                overlay.classList.add('active');
                if (scorecardTimeout) clearTimeout(scorecardTimeout);
                scorecardTimeout = setTimeout(() => {
                    isScorecardVisible = false;
                    overlay.classList.remove('active');
                }, 3000);
            } else {
                overlay.classList.remove('active');
                if (scorecardTimeout) clearTimeout(scorecardTimeout);
            }
        }
    } else if (type === 'SCORECARD_HIDE') {
        isScorecardVisible = false;
        const overlay = document.getElementById('scorecard-overlay');
        if (overlay) overlay.classList.remove('active');
        if (scorecardTimeout) clearTimeout(scorecardTimeout);
    } else if (type === 'BOWLING_SCORECARD_TOGGLE') {
        isBowlingScorecardVisible = !isBowlingScorecardVisible;
        const overlay = document.getElementById('bowling-scorecard-overlay');
        if (overlay) {
            if (isBowlingScorecardVisible) {
                renderBowlingScorecard();
                overlay.classList.add('active');
                if (bowlingScorecardTimeout) clearTimeout(bowlingScorecardTimeout);
                bowlingScorecardTimeout = setTimeout(() => {
                    isBowlingScorecardVisible = false;
                    overlay.classList.remove('active');
                }, 3000);
            } else {
                overlay.classList.remove('active');
                if (bowlingScorecardTimeout) clearTimeout(bowlingScorecardTimeout);
            }
        }
    } else if (type === 'BOWLING_SCORECARD_HIDE') {
        isBowlingScorecardVisible = false;
        const overlay = document.getElementById('bowling-scorecard-overlay');
        if (overlay) overlay.classList.remove('active');
        if (bowlingScorecardTimeout) clearTimeout(bowlingScorecardTimeout);
    } else if (type === 'SQUADS_TOGGLE') {
        isSquadsVisible = !isSquadsVisible;
        const overlay = document.getElementById('squads-overlay');
        if (overlay) {
            if (isSquadsVisible) {
                renderSquads();
                overlay.classList.add('active');
                if (squadsTimeout) clearTimeout(squadsTimeout);
                squadsTimeout = setTimeout(() => {
                    isSquadsVisible = false;
                    overlay.classList.remove('active');
                }, 5000);
            } else {
                overlay.classList.remove('active');
                if (squadsTimeout) clearTimeout(squadsTimeout);
            }
        }
    } else if (type === 'SQUADS_HIDE') {
        isSquadsVisible = false;
        const overlay = document.getElementById('squads-overlay');
        if (overlay) overlay.classList.remove('active');
        if (squadsTimeout) clearTimeout(squadsTimeout);
    } else {
        showEventAnimation(type);
    }
});

function showEventAnimation(type) {
    const overlay = document.getElementById('event-overlay');
    const text = document.getElementById('event-text');
    if (!overlay || !text) return;

    // Reset
    overlay.className = 'event-overlay';
    void overlay.offsetWidth; // trigger reflow

    if (type === 'OVERSUMMARY') {
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
            if (animationTimeout) clearTimeout(animationTimeout);
            animationTimeout = setTimeout(() => {
                summaryOverlay.classList.remove('active');
            }, 3000);
        }
        return;
    } else if (type === 'SIX') {
        text.innerText = "SIX!";
        text.className = 'event-text event-six';
    } else if (type === 'FOUR') {
        text.innerText = "FOUR!";
        text.className = 'event-text event-four';
    } else if (type === 'WICKET') {
        text.innerText = "OUT!";
        text.className = 'event-text event-wicket';
    } else if (type === 'NOTOUT') {
        text.innerText = "NOT OUT!";
        text.className = 'event-text event-notout';
    } else if (type === 'WIDE') {
        text.innerText = "WIDE!";
        text.className = 'event-text event-wide';
    } else if (type === 'NOBALL') {
        text.innerText = "FREE HIT!";
        text.className = 'event-text event-noball';
    } else if (type === 'INNINGS_COMPLETE') {
        text.innerText = "1ST INNINGS COMPLETE!";
        text.className = 'event-text event-six';
    } else {
        return;
    }

    overlay.className = 'event-overlay active';

    if (animationTimeout) clearTimeout(animationTimeout);
    animationTimeout = setTimeout(() => {
        overlay.classList.remove('active');
    }, 3000); // Hide after 3.5 seconds
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

function renderBatterSummary() {
    for (let i = 0; i < 2; i++) {
        const b = state.batsmen[i];
        const elName = document.getElementById('bs-name-' + i);
        if (!elName) return;
        elName.innerHTML = getPlayerImageHtml(b.name) + b.name + (state.strikerIndex === i ? ' <span style="color:#FFEA00; font-size:30px; margin-left:10px;">▶</span>' : '');
        document.getElementById('bs-runs-' + i).innerText = b.runs;
        document.getElementById('bs-balls-' + i).innerText = b.balls;
        document.getElementById('bs-4s-' + i).innerText = b.fours;
        document.getElementById('bs-6s-' + i).innerText = b.sixes;
        const sr = b.balls === 0 ? "0.0" : ((b.runs / b.balls) * 100).toFixed(1);
        document.getElementById('bs-sr-' + i).innerText = sr;
    }
}

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
            <td style="padding: 12px 15px; font-weight: bold; display:flex; align-items:center;">${getPlayerImageHtml(b.name)} ${b.name}</td>
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
            <td style="padding: 12px 15px; font-weight: bold; display:flex; align-items:center;">${getPlayerImageHtml(b.name)} ${b.name}</td>
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

function renderSquads() {
    const container = document.getElementById('squads-container');
    const subtitle = document.getElementById('squads-subtitle');
    if (!container || !subtitle) return;

    subtitle.innerHTML = `${config.teamA} <span style="color: #00E5FF">VS</span> ${config.teamB}`;
    container.innerHTML = '';

    // Team A Card
    const teamAPlayers = state.teamsWithPlayers?.find(t => t.name === config.teamA)?.players || [];
    const playersA = teamAPlayers.length > 0 ? teamAPlayers : (state.teamAPlayers || []).map(name => ({
        name,
        image: state.playerImages?.[name] || null
    }));

    const cardA = document.createElement('div');
    cardA.style.cssText = "background: rgba(0, 15, 40, 0.9); border-radius: 20px; border: 2px solid #E040FB; box-shadow: 0 0 35px rgba(224, 64, 251, 0.25); padding: 30px;";
    cardA.innerHTML = `<h2 style="color: #E040FB; font-size: 32px; font-weight: 900; text-align: center; margin-bottom: 25px; border-bottom: 2px solid rgba(224, 64, 251, 0.2); padding-bottom: 15px; text-transform: uppercase; letter-spacing: 1px;">${config.teamA}</h2>`;
    const listA = document.createElement('div');
    listA.style.cssText = "display: flex; flex-direction: column; gap: 15px;";
    playersA.forEach((p, idx) => {
        const item = document.createElement('div');
        item.style.cssText = "display: flex; align-items: center; gap: 18px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); padding: 10px 20px; border-radius: 12px;";
        const avatarHtml = p.image ? `<img src="${p.image}" style="width: 45px; height: 45px; border-radius: 50%; object-fit: cover; border: 2px solid #E040FB;">` : `<div style="width: 45px; height: 45px; border-radius: 50%; border: 2px solid rgba(255, 255, 255, 0.2); display: flex; align-items: center; justify-content: center; font-size: 20px; color: rgba(255, 255, 255, 0.4);">👤</div>`;
        item.innerHTML = `
            <span style="color: #E040FB; font-size: 18px; font-weight: bold; width: 24px;">${idx + 1}</span>
            ${avatarHtml}
            <span style="color: #fff; font-size: 22px; font-weight: bold;">${p.name}</span>
        `;
        listA.appendChild(item);
    });
    cardA.appendChild(listA);
    container.appendChild(cardA);

    // Team B Card
    const teamBPlayers = state.teamsWithPlayers?.find(t => t.name === config.teamB)?.players || [];
    const playersB = teamBPlayers.length > 0 ? teamBPlayers : (state.teamBPlayers || []).map(name => ({
        name,
        image: state.playerImages?.[name] || null
    }));

    const cardB = document.createElement('div');
    cardB.style.cssText = "background: rgba(0, 15, 40, 0.9); border-radius: 20px; border: 2px solid #00B0FF; box-shadow: 0 0 35px rgba(0, 176, 255, 0.25); padding: 30px;";
    cardB.innerHTML = `<h2 style="color: #00B0FF; font-size: 32px; font-weight: 900; text-align: center; margin-bottom: 25px; border-bottom: 2px solid rgba(0, 176, 255, 0.2); padding-bottom: 15px; text-transform: uppercase; letter-spacing: 1px;">${config.teamB}</h2>`;
    const listB = document.createElement('div');
    listB.style.cssText = "display: flex; flex-direction: column; gap: 15px;";
    playersB.forEach((p, idx) => {
        const item = document.createElement('div');
        item.style.cssText = "display: flex; align-items: center; gap: 18px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); padding: 10px 20px; border-radius: 12px;";
        const avatarHtml = p.image ? `<img src="${p.image}" style="width: 45px; height: 45px; border-radius: 50%; object-fit: cover; border: 2px solid #00B0FF;">` : `<div style="width: 45px; height: 45px; border-radius: 50%; border: 2px solid rgba(255, 255, 255, 0.2); display: flex; align-items: center; justify-content: center; font-size: 20px; color: rgba(255, 255, 255, 0.4);">👤</div>`;
        item.innerHTML = `
            <span style="color: #00B0FF; font-size: 18px; font-weight: bold; width: 24px;">${idx + 1}</span>
            ${avatarHtml}
            <span style="color: #fff; font-size: 22px; font-weight: bold;">${p.name}</span>
        `;
        listB.appendChild(item);
    });
    cardB.appendChild(listB);
    container.appendChild(cardB);
}

loadState();
