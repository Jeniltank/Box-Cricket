'use client';

import { memo } from 'react';

function PlayersOnFieldCard({
  config,
  state,
  errors,
  striker,
  nonStriker,
  bowler,
  connected,
  onStrikerChange,
  onNonStrikerChange,
  onBowlerChange,
  onSave,
  onReset,
  onStartSecondInnings,
  onValidate,
}) {
  const battingSquad = getBattingSquad(config, state);
  const bowlingSquad = getBowlingSquad(config, state);

  return (
    <div className="dashboard-card">
      <h2 className="card-title">2. Players on Field</h2>
      <div className="form-grid">
        <div className="input-group">
          <label>Striker Batsman</label>
          <select
            value={striker || ''}
            onChange={(e) => {
              onStrikerChange(e.target.value);
              onValidate?.(e.target.value, nonStriker);
            }}
            className={errors?.striker ? 'input-error' : ''}
          >
            {battingSquad.length > 0 ? (
              battingSquad.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))
            ) : (
              <option value="">-- No Players --</option>
            )}
          </select>
          {errors?.striker && <span className="error-text">{errors.striker}</span>}
        </div>
        <div className="input-group">
          <label>Non-Striker Batsman</label>
          <select
            value={nonStriker || ''}
            onChange={(e) => {
              onNonStrikerChange(e.target.value);
              onValidate?.(striker, e.target.value);
            }}
            className={errors?.nonStriker ? 'input-error' : ''}
          >
            {battingSquad.length > 0 ? (
              battingSquad.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))
            ) : (
              <option value="">-- No Players --</option>
            )}
          </select>
          {errors?.nonStriker && <span className="error-text">{errors.nonStriker}</span>}
        </div>
        <div className="input-group" style={{ gridColumn: '1 / -1' }}>
          <label>Opening Bowler</label>
          <select value={bowler || ''} onChange={(e) => onBowlerChange(e.target.value)}>
            {bowlingSquad.length > 0 ? (
              bowlingSquad.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))
            ) : (
              <option value="">-- No Bowlers --</option>
            )}
          </select>
        </div>
      </div>

      <div className="btn-row">
        <button
          className="btn-action save"
          onClick={onSave}
          style={!connected ? { opacity: 0.5, cursor: 'not-allowed', position: 'relative' } : {}}
          title={!connected ? 'Not connected to server' : 'Sync to TV Screen'}
        >
          {connected ? '📡 SYNC TO TV SCREEN' : '❌ NOT CONNECTED'}
        </button>
        <button className="btn-action reset" onClick={onReset}>
          RESET MATCH TO 0-0
        </button>
        <button className="btn-action btn-2nd-innings" onClick={onStartSecondInnings}>
          START 2ND INNINGS
        </button>
      </div>
    </div>
  );
}

function getBattingSquad(config, state) {
  const teamASelected = config.teamA;
  const teamBSelected = config.teamB;

  if (state.allTeamsPlayers) {
    const squad = state.allTeamsPlayers[teamASelected] || [];
    if (squad.length > 0) return squad;
  }

  if (state.teamAPlayers && state.teamAPlayers.length > 0) return state.teamAPlayers;
  return [];
}

function getBowlingSquad(config, state) {
  const teamBSelected = config.teamB;

  if (state.allTeamsPlayers) {
    const squad = state.allTeamsPlayers[teamBSelected] || [];
    if (squad.length > 0) return squad;
  }

  if (state.teamBPlayers && state.teamBPlayers.length > 0) return state.teamBPlayers;
  return [];
}

export default memo(PlayersOnFieldCard);
