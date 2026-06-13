'use client';

import { memo } from 'react';
import { getStrikeRate } from '@/utils/cricket';

function getPlayerImageHtml(name, playerImages, size = '100px') {
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
          border: '3px solid var(--primary-accent)',
          marginBottom: '15px',
          display: 'inline-block',
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: '3px solid rgba(255, 255, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '40px',
        color: 'rgba(255, 255, 255, 0.4)',
        marginBottom: '15px',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}
    >
      👤
    </div>
  );
}

function BatterSummaryOverlay({ active, state, onClick }) {
  return (
    <div className={`graph-overlay ${active ? 'active' : ''}`} onClick={onClick}>
      <div className="graph-title" style={{ color: '#E040FB', textShadow: '0 0 20px rgba(224, 64, 251, 0.5)' }}>
        BATTERS AT CREASE
      </div>
      <div style={{ display: 'flex', gap: '40px', marginTop: '20px' }}>
        {state.batsmen.map((b, i) => {
          const borderColor = i === 0 ? '#E040FB' : '#00B0FF';
          const textColor = i === 0 ? '#E040FB' : '#00B0FF';
          const shadowColor = i === 0 ? 'rgba(224, 64, 251, 0.3)' : 'rgba(0, 176, 255, 0.3)';
          const shadowText = i === 0 ? 'rgba(224, 64, 251, 0.5)' : 'rgba(0, 176, 255, 0.5)';

          return (
            <div
              key={i}
              style={{
                background: 'rgba(0, 15, 40, 0.9)',
                padding: '40px',
                borderRadius: '20px',
                border: `2px solid ${borderColor}`,
                minWidth: '400px',
                textAlign: 'center',
                boxShadow: `0 0 30px ${shadowColor}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {getPlayerImageHtml(b.name, state.playerImages)}
              <div style={{ fontSize: '50px', color: 'white', fontWeight: 'bold', marginBottom: '20px' }}>
                {b.name}
                {state.strikerIndex === i && (
                  <span style={{ color: '#FFEA00', fontSize: '30px', marginLeft: '10px' }}>▶</span>
                )}
              </div>
              <div
                style={{
                  fontSize: '90px',
                  color: textColor,
                  fontWeight: 900,
                  lineHeight: 1,
                  textShadow: `0 0 20px ${shadowText}`,
                }}
              >
                {b.runs}
                <span style={{ fontSize: '40px', color: '#aaa', fontWeight: 'normal', textShadow: 'none' }}>
                  {' '}({b.balls})
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '30px',
                  fontSize: '30px',
                  color: '#ddd',
                  background: 'rgba(0,0,0,0.6)',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <div>4s: <span style={{ color: '#00B0FF', fontWeight: 'bold' }}>{b.fours}</span></div>
                <div>6s: <span style={{ color: '#00B0FF', fontWeight: 'bold' }}>{b.sixes}</span></div>
                <div>SR: <span style={{ color: '#FF9800', fontWeight: 'bold' }}>{getStrikeRate(b.runs, b.balls)}</span></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(BatterSummaryOverlay);
