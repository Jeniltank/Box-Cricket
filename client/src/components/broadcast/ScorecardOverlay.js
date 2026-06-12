'use client';

import { memo, useMemo } from 'react';
import { getStrikeRate, getOversDisplay } from '@/utils/cricket';

function getPlayerImageHtml(name, playerImages) {
  if (playerImages && playerImages[name]) {
    return (
      <img
        src={playerImages[name]}
        alt={name}
        style={{
          width: '35px',
          height: '35px',
          borderRadius: '50%',
          objectFit: 'cover',
          border: '2px solid var(--primary-accent)',
          verticalAlign: 'middle',
          marginRight: '10px',
          display: 'inline-block',
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: '35px',
        height: '35px',
        borderRadius: '50%',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        color: 'rgba(255, 255, 255, 0.4)',
        verticalAlign: 'middle',
        marginRight: '10px',
      }}
    >
      👤
    </div>
  );
}

function ScorecardOverlay({ active, state, onClick }) {
  const { totalBatterRuns, extras } = useMemo(() => {
    const total = (state.allBatsmen || []).reduce((sum, b) => sum + b.runs, 0);
    return { totalBatterRuns: total, extras: state.teamRuns - total };
  }, [state.allBatsmen, state.teamRuns]);

  return (
    <div
      className={`graph-overlay ${active ? 'active' : ''}`}
      onClick={onClick}
      style={{ alignItems: 'center', justifyContent: 'flex-start', paddingTop: '50px' }}
    >
      <div className="graph-title" style={{ color: '#FFEA00', textShadow: '0 0 20px rgba(255, 234, 0, 0.5)', fontSize: '70px' }}>
        BATTING SCORECARD
      </div>
      <div className="scorecard-table-wrapper">
        <table className="scorecard-table">
          <thead>
            <tr>
              <th style={{ width: '35%' }}>BATTER</th>
              <th style={{ width: '25%' }}>STATUS</th>
              <th>R</th>
              <th>B</th>
              <th>4s</th>
              <th>6s</th>
              <th>SR</th>
            </tr>
          </thead>
          <tbody>
            {(state.allBatsmen || []).map((b, i) => {
              const sr = getStrikeRate(b.runs, b.balls);
              const status = b.status || 'not out';
              return (
                <tr key={i}>
                  <td style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                    {getPlayerImageHtml(b.name, state.playerImages)}
                    <span>{b.name}</span>
                  </td>
                  <td style={{ color: status === 'not out' ? '#00E676' : (status === 'retired' ? '#FF9800' : '#FF1744') }}>
                    {status.toUpperCase()}
                  </td>
                  <td style={{ textAlign: 'center', color: 'white', fontWeight: 'bold' }}>{b.runs}</td>
                  <td style={{ textAlign: 'center' }}>{b.balls}</td>
                  <td style={{ textAlign: 'center' }}>{b.fours}</td>
                  <td style={{ textAlign: 'center' }}>{b.sixes}</td>
                  <td style={{ textAlign: 'center' }}>{sr}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="scorecard-totals">
        <div>TOTAL: <span style={{ color: '#00E676' }}>{state.teamRuns}</span>/<span style={{ color: '#FF1744' }}>{state.teamWickets}</span></div>
        <div>OVERS: <span style={{ color: '#00B0FF' }}>{getOversDisplay(state.totalBalls)}</span></div>
        <div>EXTRAS: <span style={{ color: '#E040FB' }}>{extras}</span></div>
      </div>
    </div>
  );
}

export default memo(ScorecardOverlay);
