'use client';

import { memo, useMemo } from 'react';

function GraphOverlay({ active, state, onClick }) {
  const allOvers = useMemo(() => {
    const overs = [...(state.oversHistory || [])];
    if (
      state.bowler.ballsInCurrentOver > 0 ||
      (state.currentOverRuns || 0) > 0 ||
      (state.currentOverWickets || 0) > 0
    ) {
      overs.push({
        over: (state.oversHistory || []).length + 1,
        runs: state.currentOverRuns || 0,
        wickets: state.currentOverWickets || 0,
      });
    }
    return overs;
  }, [state.oversHistory, state.bowler, state.currentOverRuns, state.currentOverWickets]);

  const maxRuns = useMemo(
    () => Math.max(...allOvers.map((o) => o.runs), 10),
    [allOvers]
  );

  return (
    <div className={`graph-overlay ${active ? 'active' : ''}`} onClick={onClick}>
      <div className="graph-title">OVER-BY-OVER ANALYSIS</div>
      <div className="chart-container">
        {allOvers.map((o, i) => {
          const heightPct = (o.runs / maxRuns) * 100;
          return (
            <div key={i} className="bar-wrapper">
              {(o.runs > 0 || o.wickets > 0) && (
                <div className="bar-runs">{o.runs}</div>
              )}
              <div
                className="bar"
                style={{ height: `${Math.max(5, heightPct)}%` }}
              >
                {Array.from({ length: o.wickets }).map((_, wi) => (
                  <div key={wi} className="wicket-dot" />
                ))}
              </div>
              <div className="bar-label">Ov {o.over}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(GraphOverlay);
