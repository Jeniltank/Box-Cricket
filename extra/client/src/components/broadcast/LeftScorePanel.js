'use client';

import { memo } from 'react';
import { getOversDisplay } from '@/utils/cricket';
import BallTimeline from '@/components/broadcast/BallTimeline';

function LeftScorePanel({ state, config }) {
  const oversF = state.totalBalls / 6;
  const currentRR = oversF > 0 ? (state.teamRuns / oversF).toFixed(2) : '0.00';
  const totalMatchBalls = config.totalOvers * 6;
  const ballsRem = Math.max(0, totalMatchBalls - state.totalBalls);
  const runsNeeded = Math.max(0, state.target - state.teamRuns);

  const rrr =
    config.innings === 2 && ballsRem > 0
      ? ((runsNeeded / ballsRem) * 6).toFixed(2)
      : '-';

  const battingTeamName = config.battingTeamName || config.teamA;

  return (
    <section className="left-panel glass-panel neon-border">
      <div className="main-score-box">
        <div className="batting-team">{battingTeamName}</div>
        <div className="score-display">
          <span id="runs">{state.teamRuns}</span>
          <span className="slash">/</span>
          <span id="wickets">{state.teamWickets}</span>
        </div>
        <div className="overs-display">
          Overs: <span className="highlight-text">{getOversDisplay(state.totalBalls)}</span> /{' '}
          <span>{config.totalOvers}.0</span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-item">
          <span className="label">CRR</span>
          <span className="value">{currentRR}</span>
        </div>
        <div className="stat-item">
          <span className="label">REQ. RR</span>
          <span className="value highlight-text">{rrr}</span>
        </div>
        <div className="stat-item partnership-item">
          <span className="label">PARTNERSHIP</span>
          <span className="value">
            <span>{state.partnerRuns}</span> (<span>{state.partnerBalls}</span>)
          </span>
        </div>
      </div>

      <div className="last-over-box">
        <span className="label">LAST 6 BALLS:</span>
        <BallTimeline lastBalls={state.lastBalls} />
      </div>
    </section>
  );
}

export default memo(LeftScorePanel);
