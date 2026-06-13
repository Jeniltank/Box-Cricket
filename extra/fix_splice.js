const fs = require('fs');
let lines = fs.readFileSync('d:/box_cricket/admin.js', 'utf8').split('\n');

let start = -1;
for(let i=0; i<lines.length; i++) {
    if (lines[i].includes('function updateLastBalls(eventStr) {')) {
        start = i;
        break;
    }
}

let end = -1;
for(let i=start; i<lines.length; i++) {
    if (lines[i].includes('state.currentOverRuns = 0;')) {
        end = i;
        break;
    }
}

const newBlock = `function updateLastBalls(eventStr) {
    state.lastBalls.push(eventStr);
    if (state.lastBalls.length > 6) state.lastBalls.shift();
}

function checkOverComplete() {
    if (state.bowler.ballsInCurrentOver === 6) {
        // localStorage.setItem('boxcricket_over_summary_data', JSON.stringify({
        //     over: state.bowler.overs + 1,
        //     runs: state.currentOverRuns,
        //     wickets: state.currentOverWickets,
        //     bowler: state.bowler.name
        // }));
        triggerAnimation('OVERSUMMARY');

        state.oversHistory.push({
            over: state.bowler.overs + 1,
            runs: state.currentOverRuns,
            wickets: state.currentOverWickets
        });`;

const newLines = newBlock.split('\n');
lines.splice(start, end - start, ...newLines);

fs.writeFileSync('d:/box_cricket/admin.js', lines.join('\n'));
console.log('Fixed checkOverComplete via splice!');
