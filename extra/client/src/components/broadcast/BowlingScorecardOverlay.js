'use client';

import { memo } from 'react';
import { getEconomy } from '@/utils/cricket';

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

function BowlingScorecardOverlay({ active, state, onClick }) {
  return (
    <div
      className={`graph-overlay ${active ? 'active' : ''}`}
      onClick={onClick}
      style={{ alignItems: 'center', justifyContent: 'flex-start', paddingTop: '50px' }}
    >
      <div className="graph-title" style={{ color: '#00E5FF', textShadow: '0 0 20px rgba(0, 229, 255, 0.5)', fontSize: '70px' }}>
        BOWLING SCORECARD
      </div>
      <div className="scorecard-table-wrapper" style={{ borderColor: '#00E5FF', boxShadow: '0 0 40px rgba(0, 229, 255, 0.3)' }}>
        <table className="scorecard-table" style={{ color: 'white' }}>
          <thead>
            <tr style={{ color: '#00E5FF' }}>
              <th style={{ width: '45%' }}>BOWLER</th>
              <th>O</th>
              <th>M</th>
              <th>R</th>
              <th>W</th>
              <th>ECON</th>
            </tr>
          </thead>
          <tbody>
            {(state.allBowlers || []).map((b, i) => {
              const oversFormatted = `${b.overs}.${b.ballsInCurrentOver}`;
              const totalBalls = b.overs * 6 + b.ballsInCurrentOver;
              const econ = getEconomy(b.runs, totalBalls);
              return (
                <tr key={i}>
                  <td style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                    {getPlayerImageHtml(b.name, state.playerImages)}
                    <span>{b.name}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>{oversFormatted}</td>
                  <td style={{ textAlign: 'center' }}>{b.maidens}</td>
                  <td style={{ textAlign: 'center', color: '#FF5252', fontWeight: 'bold' }}>{b.runs}</td>
                  <td style={{ textAlign: 'center', color: '#00E676', fontWeight: 'bold' }}>{b.wickets}</td>
                  <td style={{ textAlign: 'center' }}>{econ}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default memo(BowlingScorecardOverlay);
