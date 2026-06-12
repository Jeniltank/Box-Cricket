'use client';

import { memo } from 'react';
import { getStrikeRate, getEconomy } from '@/utils/cricket';

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
        }}
      />
    );
  }
  return null;
}

function CenterPanel({ state }) {
  const b0 = state.batsmen[0];
  const b1 = state.batsmen[1];
  const bowler = state.bowler;
  const totalBowlerBalls = bowler.overs * 6 + bowler.ballsInCurrentOver;

  return (
    <section className="center-panel">
      {/* Batsmen Section */}
      <div className="batsmen-section glass-panel neon-border">
        <div className="table-header">
          <span className="col-name">BATTERS</span>
          <span className="col-r">R</span>
          <span className="col-b">B</span>
          <span className="col-4s">4s</span>
          <span className="col-6s">6s</span>
          <span className="col-sr">SR</span>
        </div>
        <div className={`player-row ${state.strikerIndex === 0 ? 'active-striker' : ''}`}>
          <span className="col-name player-name">
            {getPlayerImageHtml(b0.name, state.playerImages)}
            {b0.name}{' '}
            <span className="striker-indicator" style={{ opacity: state.strikerIndex === 0 ? 1 : 0 }}>
              ▶
            </span>
          </span>
          <span className="col-r highlight-text">{b0.runs}</span>
          <span className="col-b">{b0.balls}</span>
          <span className="col-4s">{b0.fours}</span>
          <span className="col-6s">{b0.sixes}</span>
          <span className="col-sr">{getStrikeRate(b0.runs, b0.balls)}</span>
        </div>
        <div className={`player-row ${state.strikerIndex === 1 ? 'active-striker' : ''}`}>
          <span className="col-name player-name">
            {getPlayerImageHtml(b1.name, state.playerImages)}
            {b1.name}{' '}
            <span className="striker-indicator" style={{ opacity: state.strikerIndex === 1 ? 1 : 0 }}>
              ▶
            </span>
          </span>
          <span className="col-r highlight-text">{b1.runs}</span>
          <span className="col-b">{b1.balls}</span>
          <span className="col-4s">{b1.fours}</span>
          <span className="col-6s">{b1.sixes}</span>
          <span className="col-sr">{getStrikeRate(b1.runs, b1.balls)}</span>
        </div>
      </div>

      {/* Bowler Section */}
      <div className="bowler-section glass-panel neon-border">
        <div className="table-header bowler-header">
          <span className="col-name">BOWLER</span>
          <span className="col-o">O</span>
          <span className="col-m">M</span>
          <span className="col-r">R</span>
          <span className="col-w">W</span>
          <span className="col-eco">ECO</span>
        </div>
        <div className="player-row">
          <span className="col-name player-name">
            {getPlayerImageHtml(bowler.name, state.playerImages)}
            {bowler.name}
          </span>
          <span className="col-o">{`${bowler.overs}.${bowler.ballsInCurrentOver}`}</span>
          <span className="col-m">{bowler.maidens}</span>
          <span className="col-r highlight-text">{bowler.runs}</span>
          <span className="col-w highlight-text">{bowler.wickets}</span>
          <span className="col-eco">{getEconomy(bowler.runs, totalBowlerBalls)}</span>
        </div>
      </div>
    </section>
  );
}

export default memo(CenterPanel);
