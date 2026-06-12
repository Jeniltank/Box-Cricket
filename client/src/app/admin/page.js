'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useMatchState } from '@/hooks/useMatchState';
import { useValidation } from '@/hooks/useValidation';
import { useSocket } from '@/context/SocketContext';
import MatchConfigCard from '@/components/admin/MatchConfigCard';
import PlayersOnFieldCard from '@/components/admin/PlayersOnFieldCard';
import ScoringPad from '@/components/admin/ScoringPad';
import BatsmanModal from '@/components/admin/BatsmanModal';
import BowlerModal from '@/components/admin/BowlerModal';
import EventOverlay from '@/components/broadcast/EventOverlay';
import OverSummaryOverlay from '@/components/broadcast/OverSummaryOverlay';
import GraphOverlay from '@/components/broadcast/GraphOverlay';
import BatterSummaryOverlay from '@/components/broadcast/BatterSummaryOverlay';
import ScorecardOverlay from '@/components/broadcast/ScorecardOverlay';
import BowlingScorecardOverlay from '@/components/broadcast/BowlingScorecardOverlay';
import SquadsOverlay from '@/components/broadcast/SquadsOverlay';

export default function AdminPage() {
  const {
    state,
    config,
    activeEvent,
    overlays,
    showBatsmanModal,
    showBowlerModal,
    addRuns,
    addExtra,
    addWicket,
    undoLastBall,
    saveSettings,
    resetMatch,
    startSecondInnings,
    saveNewBatsman,
    retireBatsman,
    saveNewBowler,
    setFreeHit,
    toggleOverlay,
    hideOverlay,
    showNotOut,
  } = useMatchState();

  const { socket, connected } = useSocket();
  const { errors, validateTournament, validateTotalOvers, validateTarget, validateStrikerNotSame } =
    useValidation();

  const [localConfig, setLocalConfig] = useState(null);
  const [localTarget, setLocalTarget] = useState(null);
  const [striker, setStriker] = useState('');
  const [nonStriker, setNonStriker] = useState('');
  const [bowler, setBowler] = useState('');

  const effectiveConfig = localConfig || config;
  const effectiveTarget = localTarget !== null ? localTarget : state.target;

  const currentStriker = striker || state.batsmen?.[0]?.name || '';
  const currentNonStriker = nonStriker || state.batsmen?.[1]?.name || '';
  const currentBowler = bowler || state.bowler?.name || '';

  const handleConfigChange = useCallback(
    (field, value) => {
      if (field === 'category') {
        const nextConfig = { ...config, category: value };
        if (socket) socket.emit('updateConfig', nextConfig);
        setLocalConfig(null);
      } else {
        setLocalConfig((prev) => ({ ...(prev || config), [field]: value }));
      }
    },
    [config, socket]
  );

  const handleStateChange = useCallback((field, value) => {
    if (field === 'target') setLocalTarget(value);
  }, []);

  const handleValidate = useCallback(
    (field, value) => {
      if (field === 'tournament') validateTournament(value);
      if (field === 'totalOvers') validateTotalOvers(value);
      if (field === 'target') validateTarget(value);
    },
    [validateTournament, validateTotalOvers, validateTarget]
  );

  const handleSave = useCallback(() => {
    const validationError = validateStrikerNotSame(currentStriker, currentNonStriker);
    if (validationError) {
      alert(`Validation Error: ${validationError}`);
      return;
    }

    if (Object.keys(errors).length > 0) {
      alert('Validation Error: Please resolve all errors before syncing.');
      return;
    }

    const c = localConfig || config;
    const s = { ...state };
    s.batsmen[0].name = currentStriker;
    s.batsmen[1].name = currentNonStriker;
    s.bowler.name = currentBowler;
    s.target = effectiveTarget;
    saveSettings(c, s);
    alert('Settings Saved & Synced!');
  }, [localConfig, config, effectiveTarget, state, currentStriker, currentNonStriker, currentBowler, errors, validateStrikerNotSame, saveSettings]);

  const handleReset = useCallback(() => {
    if (!confirm('Are you sure you want to reset the match to 0-0?')) return;
    resetMatch(currentStriker, currentNonStriker, currentBowler);
    setLocalConfig(null);
    setLocalTarget(null);
    alert('Match Reset! Now in 1st Innings.');
  }, [resetMatch, currentStriker, currentNonStriker, currentBowler]);

  const handleStartSecondInnings = useCallback(() => {
    if (!confirm('Start 2nd Innings? This will set the target, clear current score, and reset scorecards. Team names will be swapped!')) return;
    const target = startSecondInnings(currentStriker, currentNonStriker, currentBowler);
    setLocalConfig(null);
    setLocalTarget(null);
    alert('2nd Innings Started! Target is ' + target);
  }, [startSecondInnings, currentStriker, currentNonStriker, currentBowler]);

  const battingSquad = useMemo(() => {
    if (state.allTeamsPlayers && state.allTeamsPlayers[effectiveConfig.teamA]) {
      return state.allTeamsPlayers[effectiveConfig.teamA];
    }
    if (state.teamAPlayers && state.teamAPlayers.length > 0) return state.teamAPlayers;
    return ['Player 1', 'Player 2'];
  }, [state, effectiveConfig.teamA]);

  const bowlingSquad = useMemo(() => {
    if (state.allTeamsPlayers && state.allTeamsPlayers[effectiveConfig.teamB]) {
      return state.allTeamsPlayers[effectiveConfig.teamB];
    }
    if (state.teamBPlayers && state.teamBPlayers.length > 0) return state.teamBPlayers;
    return ['Bowler 1'];
  }, [state, effectiveConfig.teamB]);

  // Synchronize local states with active state players whenever state updates from backend
  useEffect(() => {
    if (state.batsmen?.[0]?.name) {
      setStriker(state.batsmen[0].name);
    }
    if (state.batsmen?.[1]?.name) {
      setNonStriker(state.batsmen[1].name);
    }
  }, [state.batsmen]);

  useEffect(() => {
    if (state.bowler?.name) {
      setBowler(state.bowler.name);
    }
  }, [state.bowler]);

  // Align striker and nonStriker with the battingSquad if the squad changes and selected players are not in the new squad
  useEffect(() => {
    if (battingSquad && battingSquad.length > 0) {
      if (striker && !battingSquad.includes(striker)) {
        setStriker(battingSquad[0] || '');
      }
      if (nonStriker && !battingSquad.includes(nonStriker)) {
        setNonStriker(battingSquad[1] || battingSquad[0] || '');
      }
    }
  }, [battingSquad, striker, nonStriker]);

  // Align bowler with the bowlingSquad if the squad changes and selected bowler is not in the new squad
  useEffect(() => {
    if (bowlingSquad && bowlingSquad.length > 0) {
      if (bowler && !bowlingSquad.includes(bowler)) {
        setBowler(bowlingSquad[0] || '');
      }
    }
  }, [bowlingSquad, bowler]);

  return (
    <div className="admin-page">
      <EventOverlay activeEvent={activeEvent} />
      <OverSummaryOverlay active={activeEvent === 'OVERSUMMARY'} state={state} />
      <GraphOverlay active={overlays.graph} state={state} onClick={() => hideOverlay('graph')} />
      <BatterSummaryOverlay active={overlays.batterSummary} state={state} onClick={() => hideOverlay('batterSummary')} />
      <ScorecardOverlay active={overlays.scorecard} state={state} onClick={() => hideOverlay('scorecard')} />
      <BowlingScorecardOverlay active={overlays.bowlingScorecard} state={state} onClick={() => hideOverlay('bowlingScorecard')} />
      <SquadsOverlay active={overlays.squads} state={state} config={effectiveConfig} onClick={() => hideOverlay('squads')} />

      <BatsmanModal show={showBatsmanModal} battingSquad={battingSquad} onSave={saveNewBatsman} />
      <BowlerModal show={showBowlerModal} bowlingSquad={bowlingSquad} onSave={saveNewBowler} />

      <div className="admin-header">
        <div style={{ flex: 1 }}>
          <div className={`connection-badge ${connected ? 'connected' : 'disconnected'}`}>
            <span className="connection-dot" />
            {connected ? 'Connected' : 'Reconnecting...'}
          </div>
        </div>
        <div style={{ flex: 2, textAlign: 'center' }}>
          BOX CRICKET <span>ADMIN DASHBOARD</span>
        </div>
        <div style={{ flex: 1, textAlign: 'right' }}>
          <a href="/teams" className="btn-manage-teams">MANAGE TEAMS & PLAYERS</a>
        </div>
      </div>

      <div className="dashboard-container">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <MatchConfigCard
            config={effectiveConfig}
            state={{ ...state, target: effectiveTarget }}
            errors={errors}
            onConfigChange={handleConfigChange}
            onStateChange={handleStateChange}
            onValidate={handleValidate}
          />
          <PlayersOnFieldCard
            config={effectiveConfig}
            state={state}
            errors={errors}
            striker={currentStriker}
            nonStriker={currentNonStriker}
            bowler={currentBowler}
            onStrikerChange={setStriker}
            onNonStrikerChange={setNonStriker}
            onBowlerChange={setBowler}
            onSave={handleSave}
            onReset={handleReset}
            onStartSecondInnings={handleStartSecondInnings}
            onValidate={validateStrikerNotSame}
          />
        </div>

        <ScoringPad
          freeHit={state.freeHit}
          onAddRuns={addRuns}
          onAddExtra={addExtra}
          onAddWicket={addWicket}
          onRetire={retireBatsman}
          onUndo={undoLastBall}
          onShowNotOut={showNotOut}
          onToggleGraph={() => toggleOverlay('graph')}
          onHideGraph={() => hideOverlay('graph')}
          onToggleBatterSummary={() => toggleOverlay('batterSummary')}
          onHideBatterSummary={() => hideOverlay('batterSummary')}
          onToggleScorecard={() => toggleOverlay('scorecard')}
          onHideScorecard={() => hideOverlay('scorecard')}
          onToggleBowlingScorecard={() => toggleOverlay('bowlingScorecard')}
          onHideBowlingScorecard={() => hideOverlay('bowlingScorecard')}
          onToggleSquads={() => toggleOverlay('squads')}
          onHideSquads={() => hideOverlay('squads')}
          onFreeHitChange={setFreeHit}
        />
      </div>
    </div>
  );
}
