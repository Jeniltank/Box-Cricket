'use client';

import { memo, useState } from 'react';

function MatchConfigCard({ config, state, errors, onConfigChange, onStateChange, onValidate }) {
  const allTeams =
    config.allTeams && config.allTeams.length > 0
      ? config.allTeams
      : [config.teamA, config.teamB].filter(Boolean);

  return (
    <div className="dashboard-card">
      <h2 className="card-title">1. Match Configuration</h2>
      <div className="form-grid">
        <div className="input-group" style={{ gridColumn: '1 / -1' }}>
          <label>Tournament Name</label>
          <input
            type="text"
            value={config.tournament || ''}
            onChange={(e) => {
              onConfigChange('tournament', e.target.value);
              onValidate?.('tournament', e.target.value);
            }}
            className={errors?.tournament ? 'input-error' : ''}
          />
          {errors?.tournament && <span className="error-text">{errors.tournament}</span>}
        </div>

        <div className="input-group" style={{ gridColumn: '1 / -1' }}>
          <label>Tournament Category</label>
          <select
            value={config.category || 'MAN'}
            onChange={(e) => onConfigChange('category', e.target.value)}
          >
            <option value="MAN">MAN</option>
            <option value="WOMAN">WOMAN</option>
            <option value="COUPAL">COUPAL</option>
          </select>
        </div>

        <div className="input-group">
          <label>Batting Team</label>
          <select
            value={config.teamA || ''}
            onChange={(e) => onConfigChange('teamA', e.target.value)}
          >
            {allTeams.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="input-group">
          <label>Bowling Team</label>
          <select
            value={config.teamB || ''}
            onChange={(e) => onConfigChange('teamB', e.target.value)}
          >
            {allTeams.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label>Current Innings</label>
          <select
            value={config.innings || 2}
            onChange={(e) => onConfigChange('innings', parseInt(e.target.value))}
          >
            <option value={1}>1st Innings</option>
            <option value={2}>2nd Innings</option>
          </select>
        </div>
        <div className="input-group">
          <label>Total Overs</label>
          <input
            type="number"
            value={config.totalOvers || 6}
            onChange={(e) => {
              onConfigChange('totalOvers', parseInt(e.target.value) || 6);
              onValidate?.('totalOvers', e.target.value);
            }}
            className={errors?.totalOvers ? 'input-error' : ''}
          />
          {errors?.totalOvers && <span className="error-text">{errors.totalOvers}</span>}
        </div>
        <div className="input-group" style={{ gridColumn: '1 / -1' }}>
          <label>Target Score</label>
          <input
            type="number"
            value={state.target || 0}
            onChange={(e) => {
              onStateChange('target', parseInt(e.target.value) || 0);
              onValidate?.('target', e.target.value);
            }}
            className={errors?.target ? 'input-error' : ''}
          />
          {errors?.target && <span className="error-text">{errors.target}</span>}
        </div>
      </div>
    </div>
  );
}

export default memo(MatchConfigCard);
