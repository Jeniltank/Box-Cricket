'use client';

import { memo, useEffect, useState } from 'react';

function Header({ config }) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () =>
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const categoryText = config.category ? ` [${config.category}]` : '';

  return (
    <header className="header-section glass-panel neon-border">
      <div className="header-left">
        <span className="tournament-name">
          {config.tournament}
          {categoryText}
        </span>
      </div>
      <div className="header-center">
        <h1 className="teams">
          <span id="team-a-name">{config.teamA}</span>{' '}
          <span className="vs">VS</span>{' '}
          <span id="team-b-name">{config.teamB}</span>
        </h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div className="match-status live-indicator">
            <span className="pulse"></span> LIVE
          </div>
          {config.freeHit && (
            <div className="free-hit-badge-header">FREE HIT</div>
          )}
        </div>
      </div>
      <div className="header-right">
        <span className="innings-info">
          {config.innings === 1 ? '1ST INNINGS' : '2ND INNINGS'}
        </span>
        <span className="venue">| BALMADIR -KUKAMA BHUJ</span>
        <span className="date">{time}</span>
      </div>
    </header>
  );
}

export default memo(Header);
