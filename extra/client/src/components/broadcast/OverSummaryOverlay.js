'use client';

import { memo } from 'react';

function getPlayerImageHtml(name, playerImages, size = '45px') {
  if (playerImages && playerImages[name]) {
    return (
      <img
        src={playerImages[name]}
        alt={name}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          border: '2px solid var(--primary-accent)',
          verticalAlign: 'middle',
          marginRight: '15px',
          display: 'inline-block',
        }}
      />
    );
  }
  return null;
}

function OverSummaryOverlay({ active, state }) {
  const lastOver =
    state.oversHistory && state.oversHistory.length > 0
      ? state.oversHistory[state.oversHistory.length - 1]
      : null;

  return (
    <div className={`event-overlay ${active ? 'active' : ''}`} style={{ flexDirection: 'column' }}>
      <div
        className="graph-title"
        style={{ fontSize: '80px', textShadow: '0 0 30px #00E676', marginBottom: '20px' }}
      >
        END OF OVER <span>{lastOver ? lastOver.over : ''}</span>
      </div>
      <div
        style={{
          fontSize: '50px',
          color: 'white',
          fontWeight: 'bold',
          background: 'rgba(0,0,0,0.5)',
          padding: '15px 40px',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        BOWLER:&nbsp;
        {getPlayerImageHtml(state.bowler?.name, state.playerImages)}
        <span style={{ color: '#00E676' }}>{state.bowler?.name || ''}</span>
      </div>
      <div style={{ display: 'flex', gap: '60px', marginTop: '40px' }}>
        <div className="over-summary-stat over-summary-runs">
          RUNS: <span>{lastOver ? lastOver.runs : 0}</span>
        </div>
        <div className="over-summary-stat over-summary-wickets">
          WICKETS: <span>{lastOver ? lastOver.wickets : 0}</span>
        </div>
      </div>
    </div>
  );
}

export default memo(OverSummaryOverlay);
