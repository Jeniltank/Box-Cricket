const fs = require('fs');

let adminJs = fs.readFileSync('d:/box_cricket/admin.js', 'utf8');

// Find the broken checkOverComplete piece
// It looks like:
/*
function updateLastBalls(eventStr) {
    state.lastBalls.push(eventStr);
            wickets: state.currentOverWickets
        });
*/

// I need to replace it with the proper implementation
const brokenCode = `function updateLastBalls(eventStr) {
    state.lastBalls.push(eventStr);
            wickets: state.currentOverWickets
        });`;

const correctCode = `function updateLastBalls(eventStr) {
    state.lastBalls.push(eventStr);
    if (state.lastBalls.length > 6) state.lastBalls.shift();
}

function checkOverComplete() {
    if (state.bowler.ballsInCurrentOver === 6) {
        // Data is available via state object
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

adminJs = adminJs.replace(brokenCode, correctCode);
fs.writeFileSync('d:/box_cricket/admin.js', adminJs);
console.log('Fixed checkOverComplete perfectly.');
