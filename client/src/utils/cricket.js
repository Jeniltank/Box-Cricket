// Pure utility functions for cricket calculations

export function getOversDisplay(totalBalls) {
  return `${Math.floor(totalBalls / 6)}.${totalBalls % 6}`;
}

export function getStrikeRate(runs, balls) {
  return balls === 0 ? "0.0" : ((runs / balls) * 100).toFixed(1);
}

export function getEconomy(runs, totalBalls) {
  return totalBalls === 0 ? "0.0" : (runs / (totalBalls / 6)).toFixed(1);
}

export function getBallClass(ball) {
  if (ball === 'W' || (typeof ball === 'string' && ball.startsWith('W'))) return 'ball wicket';
  if (ball === '4' || ball === '8') return 'ball runs-4';
  if (ball === '6' || ball === '12') return 'ball runs-6';
  if (ball === '0') return 'ball runs-0';
  return 'ball';
}

export function getWinProbability(runsNeeded, ballsRem, teamRuns, totalBalls) {
  let baseProb = 50;
  if (runsNeeded <= 0) baseProb = 100;
  else if (ballsRem <= 0) baseProb = 0;
  else {
    const reqRate = (runsNeeded / ballsRem) * 6;
    const cRate = totalBalls > 0 ? (teamRuns / (totalBalls / 6)) : 0;
    const diff = cRate - reqRate;
    baseProb = 50 + (diff * 5);
    baseProb = Math.max(5, Math.min(95, baseProb));
  }
  return Math.round(baseProb);
}

export const DEFAULT_CONFIG = {
  tournament: "KGK SAMAJ YUVA MANDAL ORGANISED BOX CRICKET TOURNAMENT",
  teamA: "",
  teamB: "",
  innings: 1,
  totalOvers: 6,
};

export const DEFAULT_STATE = {
  teamRuns: 0,
  teamWickets: 0,
  totalBalls: 0,
  target: 0,
  freeHit: false,
  batsmen: [
    { id: 0, name: "Batsman 1", runs: 0, balls: 0, fours: 0, sixes: 0 },
    { id: 1, name: "Batsman 2", runs: 0, balls: 0, fours: 0, sixes: 0 },
  ],
  allBatsmen: [
    { id: 0, name: "Batsman 1", runs: 0, balls: 0, fours: 0, sixes: 0, status: "not out" },
    { id: 1, name: "Batsman 2", runs: 0, balls: 0, fours: 0, sixes: 0, status: "not out" },
  ],
  strikerIndex: 0,
  bowler: {
    id: 0,
    name: "Bowler",
    overs: 0,
    ballsInCurrentOver: 0,
    runs: 0,
    maidens: 0,
    wickets: 0,
  },
  allBowlers: [
    { id: 0, name: "Bowler", overs: 0, ballsInCurrentOver: 0, runs: 0, maidens: 0, wickets: 0 },
  ],
  lastBalls: [],
  partnerRuns: 0,
  partnerBalls: 0,
  currentOverRuns: 0,
  currentOverWickets: 0,
  oversHistory: [],
  teamAPlayers: [],
  teamBPlayers: [],
};
