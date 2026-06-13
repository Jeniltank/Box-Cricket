'use client';

import { memo, useState } from 'react';

function BowlerModal({ show, bowlingSquad, onSave, onClose }) {
  const [selected, setSelected] = useState('');

  if (!show) return null;

  return (
    <div className="modal-overlay" style={{ display: 'flex' }}>
      <div className="modal-content glass-panel neon-border">
        <h2>NEW BOWLER</h2>
        <div className="input-group">
          <label>Select Bowler</label>
          <select value={selected} onChange={(e) => setSelected(e.target.value)}>
            <option value="">-- Select --</option>
            {bowlingSquad.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="modal-actions">
          <button
            className="btn-save"
            onClick={() => {
              onSave(selected || bowlingSquad[0] || 'New Bowler');
              setSelected('');
            }}
          >
            START OVER
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(BowlerModal);
