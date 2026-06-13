'use client';

import { memo, useState } from 'react';

function BatsmanModal({ show, battingSquad, onSave, onClose }) {
  const [selected, setSelected] = useState('');

  if (!show) return null;

  return (
    <div className="modal-overlay" style={{ display: 'flex' }}>
      <div className="modal-content glass-panel neon-border">
        <h2>NEW BATSMAN</h2>
        <div className="input-group">
          <label>Select Batsman</label>
          <select value={selected} onChange={(e) => setSelected(e.target.value)}>
            <option value="">-- Select --</option>
            {battingSquad.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="modal-actions">
          <button
            className="btn-save"
            onClick={() => {
              onSave(selected || battingSquad[0] || 'New Batsman');
              setSelected('');
            }}
          >
            ADD BATSMAN
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(BatsmanModal);
