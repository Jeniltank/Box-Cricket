'use client';

import { memo } from 'react';
import { getWinProbability } from '@/utils/cricket';

function RightStatsPanel({ state, config }) {
  const totalMatchBalls = config.totalOvers * 6;
  const ballsRem = Math.max(0, totalMatchBalls - state.totalBalls);
  const runsNeeded = Math.max(0, state.target - state.teamRuns);
  const oversF = state.totalBalls / 6;
  const currentRR = oversF > 0 ? (state.teamRuns / oversF).toFixed(2) : '0.00';

  const winProb = getWinProbability(runsNeeded, ballsRem, state.teamRuns, state.totalBalls);

  return (
    <section className="right-panel glass-panel neon-border">
      {/* 1ST INNINGS VIEW */}
      {config.innings === 1 && (
        <div className="innings-view" style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center' }}>
          <div className="target-box">
            <span className="label">RUNS SCORED</span>
            <span className="target-score">{state.teamRuns}</span>
          </div>
          <div className="equation-box">
            <div className="eq-item">
              <span className="label">BALLS REM.</span>
              <span className="value">{ballsRem}</span>
            </div>
            <div className="eq-item">
              <span className="label">RUN RATE</span>
              <span className="value highlight-text">{currentRR}</span>
            </div>
            <div className="eq-item">
              <span className="label">WKTS REM.</span>
              <span className="value">{7 - state.teamWickets}</span>
            </div>
          </div>
        </div>
      )}

      {/* 2ND INNINGS VIEW */}
      {config.innings === 2 && (
        <div className="innings-view" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="target-box">
            <span className="label">TARGET</span>
            <span className="target-score">{state.target}</span>
          </div>
          <div className="equation-box">
            <div className="eq-item">
              <span className="label">RUNS NEEDED</span>
              <span className="value highlight-text">{runsNeeded}</span>
            </div>
            <div className="eq-item">
              <span className="label">BALLS REM.</span>
              <span className="value">{ballsRem}</span>
            </div>
          </div>
          <div className="win-predictor">
            <div className="win-header">
              <span>WIN PROBABILITY</span>
            </div>
            <div className="win-bar">
              <div className="team-a-bar" style={{ width: `${winProb}%` }}>
                {winProb}%
              </div>
              <div className="team-b-bar">{100 - winProb}%</div>
            </div>
            <div className="win-labels">
              <span>{config.teamA}</span>
              <span>{config.teamB}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default memo(RightStatsPanel);
