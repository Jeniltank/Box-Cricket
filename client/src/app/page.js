'use client';

import { useMatchState } from '@/hooks/useMatchState';
import Header from '@/components/broadcast/Header';
import LeftScorePanel from '@/components/broadcast/LeftScorePanel';
import CenterPanel from '@/components/broadcast/CenterPanel';
import RightStatsPanel from '@/components/broadcast/RightStatsPanel';
import EventOverlay from '@/components/broadcast/EventOverlay';
import OverSummaryOverlay from '@/components/broadcast/OverSummaryOverlay';
import GraphOverlay from '@/components/broadcast/GraphOverlay';
import BatterSummaryOverlay from '@/components/broadcast/BatterSummaryOverlay';
import ScorecardOverlay from '@/components/broadcast/ScorecardOverlay';
import BowlingScorecardOverlay from '@/components/broadcast/BowlingScorecardOverlay';
import SquadsOverlay from '@/components/broadcast/SquadsOverlay';

export default function BroadcastPage() {
  const { state, config, activeEvent, overlays } = useMatchState();

  return (
    <>
      {/* Background Layer */}
      <div className="bg-layer" />

      {/* Event Animation Overlay */}
      <EventOverlay activeEvent={activeEvent} />

      {/* Over Summary Overlay */}
      <OverSummaryOverlay active={activeEvent === 'OVERSUMMARY'} state={state} />

      {/* Analysis Graph Overlay */}
      <GraphOverlay active={overlays.graph} state={state} />

      {/* Batter Summary Overlay */}
      <BatterSummaryOverlay active={overlays.batterSummary} state={state} />

      {/* Scorecard Overlay */}
      <ScorecardOverlay active={overlays.scorecard} state={state} />

      {/* Bowling Scorecard Overlay */}
      <BowlingScorecardOverlay active={overlays.bowlingScorecard} state={state} />

      {/* Squads Overlay */}
      <SquadsOverlay active={overlays.squads} state={state} config={config} />

      <div className="broadcast-container">
        <Header config={{ ...config, freeHit: state.freeHit }} />
        <main className="main-overlay">
          <LeftScorePanel state={state} config={config} />
          <CenterPanel state={state} />
          <RightStatsPanel state={state} config={config} />
        </main>
      </div>
    </>
  );
}
