'use client';

import { memo } from 'react';

function ScoringPad({
  freeHit,
  onAddRuns,
  onAddExtra,
  onAddWicket,
  onRetire,
  onUndo,
  onShowNotOut,
  onToggleGraph,
  onHideGraph,
  onToggleBatterSummary,
  onHideBatterSummary,
  onToggleScorecard,
  onHideScorecard,
  onToggleBowlingScorecard,
  onHideBowlingScorecard,
  onToggleSquads,
  onHideSquads,
  onFreeHitChange,
}) {
  return (
    <div className="dashboard-card scorer-controls" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h2 className="card-title">3. Scoring Pad</h2>

      <div className="controls-grid" style={{ flexGrow: 1 }}>
        <button className="btn-run" onClick={() => onAddRuns(0)}>0</button>
        <button className="btn-run" onClick={() => onAddRuns(1)}>1</button>
        <button className="btn-run" onClick={() => onAddRuns(2)}>2</button>
        <button className="btn-run" onClick={() => onAddRuns(3)}>3</button>
        <button className="btn-run btn-four" onClick={() => onAddRuns(4)}>4</button>
        <button className="btn-run btn-six" onClick={() => onAddRuns(6)}>6</button>

        <button className="btn-extra" onClick={() => onAddExtra('WIDE')}>WD</button>
        <button className="btn-extra" onClick={() => onAddExtra('NB')}>NB</button>
        <button className="btn-extra" onClick={() => onAddExtra('LB')}>LB</button>
        <button className="btn-extra" onClick={() => onAddExtra('B')}>B</button>

        <button className="btn-wicket" onClick={onAddWicket}>WICKET</button>
        <button className="btn-wicket" onClick={onRetire} style={{ background: '#FF9800', color: 'white' }}>RETIRE</button>
        <button className="btn-undo" onClick={onUndo}>UNDO</button>

        <button className="btn-overlay-toggle btn-notout-btn" onClick={onShowNotOut}>
          SHOW &quot;NOT OUT&quot;
        </button>

        <button className="btn-overlay-toggle btn-graph-toggle" onClick={onToggleGraph}>
          📊 TOGGLE GRAPH
        </button>
        <button className="btn-overlay-toggle btn-cancel" onClick={onHideGraph}>
          ❌ CANCEL GRAPH
        </button>

        <button className="btn-overlay-toggle btn-batter-toggle" onClick={onToggleBatterSummary}>
          🏏 BATTERS SUMMARY
        </button>
        <button className="btn-overlay-toggle btn-cancel" onClick={onHideBatterSummary}>
          ❌ CANCEL SUMMARY
        </button>

        <button className="btn-overlay-toggle btn-scorecard-toggle" onClick={onToggleScorecard}>
          📋 SHOW SCORECARD
        </button>
        <button className="btn-overlay-toggle btn-cancel" onClick={onHideScorecard}>
          ❌ HIDE SCORECARD
        </button>

        <button className="btn-overlay-toggle btn-bowling-toggle" onClick={onToggleBowlingScorecard}>
          ⚾ SHOW BOWLING
        </button>
        <button className="btn-overlay-toggle btn-cancel" onClick={onHideBowlingScorecard}>
          ❌ HIDE BOWLING
        </button>

        <button className="btn-overlay-toggle btn-squads-toggle" onClick={onToggleSquads} style={{ background: 'rgba(103, 58, 183, 0.1)', border: '1px solid #673AB7', color: '#B39DDB' }}>
          👥 SHOW SQUADS
        </button>
        <button className="btn-overlay-toggle btn-cancel" onClick={onHideSquads}>
          ❌ HIDE SQUADS
        </button>
      </div>

      <div className="free-hit-container">
        <label className="free-hit-toggle">
          <input
            type="checkbox"
            checked={freeHit || false}
            onChange={(e) => onFreeHitChange(e.target.checked)}
          />
          {' '}FREE HIT ACTIVE
        </label>
      </div>
    </div>
  );
}

export default memo(ScoringPad);
