'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '@/context/SocketContext';
import { DEFAULT_CONFIG, DEFAULT_STATE } from '@/utils/cricket';

export function useMatchState() {
  const { socket } = useSocket();
  const [state, setState] = useState(DEFAULT_STATE);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [activeEvent, setActiveEvent] = useState(null);
  const [showBatsmanModal, setShowBatsmanModal] = useState(false);
  const [showBowlerModal, setShowBowlerModal] = useState(false);
  const [overlays, setOverlays] = useState({
    graph: false,
    batterSummary: false,
    scorecard: false,
    bowlingScorecard: false,
    squads: false,
  });

  const undoStackRef = useRef([]);
  const eventTimeoutRef = useRef(null);
  const graphTimeoutRef = useRef(null);
  const batterSummaryTimeoutRef = useRef(null);
  const scorecardTimeoutRef = useRef(null);
  const bowlingScorecardTimeoutRef = useRef(null);
  const squadsTimeoutRef = useRef(null);
  const loadedRef = useRef(false);

  // Load initial state from server
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    const backendUrl = typeof window !== 'undefined' ? `http://${window.location.hostname}:3000` : 'http://localhost:3000';
    fetch(`${backendUrl}/api/state`)
      .then((res) => res.json())
      .then((data) => {
        if (data.state_data && Object.keys(data.state_data).length > 0) {
          const s = data.state_data;
          if (!s.allBatsmen) {
            s.allBatsmen = s.batsmen.map((b) => ({ ...b, status: 'not out' }));
          }
          if (s.bowler && s.bowler.id === undefined) s.bowler.id = 0;
          if (!s.allBowlers) s.allBowlers = [{ ...s.bowler }];
          if (!s.oversHistory) s.oversHistory = [];
          if (s.currentOverRuns === undefined) s.currentOverRuns = 0;
          if (s.currentOverWickets === undefined) s.currentOverWickets = 0;
          setState(s);
        }
        if (data.config_data && Object.keys(data.config_data).length > 0) {
          setConfig(data.config_data);
        }
      })
      .catch((err) => console.error('Error loading state:', err));
  }, []);

  // Listen for socket updates
  useEffect(() => {
    if (!socket) return;

    const handleStateUpdate = (data) => setState(data);
    const handleConfigUpdate = (data) => setConfig(data);
    const handleShowEvent = (type) => {
      if (type === 'GRAPH_TOGGLE') {
        setOverlays((p) => {
          const nextVal = !p.graph;
          if (graphTimeoutRef.current) clearTimeout(graphTimeoutRef.current);
          if (nextVal) {
            graphTimeoutRef.current = setTimeout(() => {
              setOverlays((curr) => ({ ...curr, graph: false }));
            }, 3000);
          }
          return { ...p, graph: nextVal };
        });
      } else if (type === 'GRAPH_HIDE') {
        if (graphTimeoutRef.current) clearTimeout(graphTimeoutRef.current);
        setOverlays((p) => ({ ...p, graph: false }));
      } else if (type === 'BATTER_SUMMARY_TOGGLE') {
        setOverlays((p) => {
          const nextVal = !p.batterSummary;
          if (batterSummaryTimeoutRef.current) clearTimeout(batterSummaryTimeoutRef.current);
          if (nextVal) {
            batterSummaryTimeoutRef.current = setTimeout(() => {
              setOverlays((curr) => ({ ...curr, batterSummary: false }));
            }, 3000);
          }
          return { ...p, batterSummary: nextVal };
        });
      } else if (type === 'BATTER_SUMMARY_HIDE') {
        if (batterSummaryTimeoutRef.current) clearTimeout(batterSummaryTimeoutRef.current);
        setOverlays((p) => ({ ...p, batterSummary: false }));
      } else if (type === 'SCORECARD_TOGGLE') {
        setOverlays((p) => {
          const nextVal = !p.scorecard;
          if (scorecardTimeoutRef.current) clearTimeout(scorecardTimeoutRef.current);
          if (nextVal) {
            scorecardTimeoutRef.current = setTimeout(() => {
              setOverlays((curr) => ({ ...curr, scorecard: false }));
            }, 3000);
          }
          return { ...p, scorecard: nextVal };
        });
      } else if (type === 'SCORECARD_HIDE') {
        if (scorecardTimeoutRef.current) clearTimeout(scorecardTimeoutRef.current);
        setOverlays((p) => ({ ...p, scorecard: false }));
      } else if (type === 'BOWLING_SCORECARD_TOGGLE') {
        setOverlays((p) => {
          const nextVal = !p.bowlingScorecard;
          if (bowlingScorecardTimeoutRef.current) clearTimeout(bowlingScorecardTimeoutRef.current);
          if (nextVal) {
            bowlingScorecardTimeoutRef.current = setTimeout(() => {
              setOverlays((curr) => ({ ...curr, bowlingScorecard: false }));
            }, 3000);
          }
          return { ...p, bowlingScorecard: nextVal };
        });
      } else if (type === 'BOWLING_SCORECARD_HIDE') {
        if (bowlingScorecardTimeoutRef.current) clearTimeout(bowlingScorecardTimeoutRef.current);
        setOverlays((p) => ({ ...p, bowlingScorecard: false }));
      } else if (type === 'SQUADS_TOGGLE') {
        setOverlays((p) => {
          const nextVal = !p.squads;
          if (squadsTimeoutRef.current) clearTimeout(squadsTimeoutRef.current);
          if (nextVal) {
            squadsTimeoutRef.current = setTimeout(() => {
              setOverlays((curr) => ({ ...curr, squads: false }));
            }, 5000);
          }
          return { ...p, squads: nextVal };
        });
      } else if (type === 'SQUADS_HIDE') {
        if (squadsTimeoutRef.current) clearTimeout(squadsTimeoutRef.current);
        setOverlays((p) => ({ ...p, squads: false }));
      } else {
        triggerEventAnimation(type);
      }
    };

    socket.on('stateUpdated', handleStateUpdate);
    socket.on('configUpdated', handleConfigUpdate);
    socket.on('showEvent', handleShowEvent);

    return () => {
      socket.off('stateUpdated', handleStateUpdate);
      socket.off('configUpdated', handleConfigUpdate);
      socket.off('showEvent', handleShowEvent);
      if (graphTimeoutRef.current) clearTimeout(graphTimeoutRef.current);
      if (batterSummaryTimeoutRef.current) clearTimeout(batterSummaryTimeoutRef.current);
      if (scorecardTimeoutRef.current) clearTimeout(scorecardTimeoutRef.current);
      if (bowlingScorecardTimeoutRef.current) clearTimeout(bowlingScorecardTimeoutRef.current);
      if (squadsTimeoutRef.current) clearTimeout(squadsTimeoutRef.current);
    };
  }, [socket]);

  const triggerEventAnimation = useCallback((type) => {
    setActiveEvent(type);
    if (eventTimeoutRef.current) clearTimeout(eventTimeoutRef.current);
    const duration = 3000;
    eventTimeoutRef.current = setTimeout(() => setActiveEvent(null), duration);
  }, []);

  // Sync helpers
  const syncAllBatsmen = useCallback((s) => {
    if (!s.allBatsmen) return;
    for (let i = 0; i < 2; i++) {
      const striker = s.batsmen[i];
      const ab = s.allBatsmen.find((b) => b.id === striker.id);
      if (ab) {
        ab.runs = striker.runs;
        ab.balls = striker.balls;
        ab.fours = striker.fours;
        ab.sixes = striker.sixes;
        ab.name = striker.name;
      }
    }
  }, []);

  const syncAllBowlers = useCallback((s) => {
    if (!s.allBowlers) return;
    const ab = s.allBowlers.find((b) => b.id === s.bowler.id);
    if (ab) {
      ab.overs = s.bowler.overs;
      ab.ballsInCurrentOver = s.bowler.ballsInCurrentOver;
      ab.runs = s.bowler.runs;
      ab.maidens = s.bowler.maidens;
      ab.wickets = s.bowler.wickets;
      ab.name = s.bowler.name;
    }
  }, []);

  const broadcastUpdate = useCallback(
    (newState, newConfig) => {
      const s = newState || state;
      const c = newConfig || config;
      syncAllBatsmen(s);
      syncAllBowlers(s);
      if (socket) {
        socket.emit('updateState', s);
        socket.emit('updateConfig', c);
      }
    },
    [socket, state, config, syncAllBatsmen, syncAllBowlers]
  );

  const triggerAnimation = useCallback(
    (type) => {
      if (socket) socket.emit('triggerEvent', type);
      triggerEventAnimation(type);
    },
    [socket, triggerEventAnimation]
  );

  const saveState = useCallback(() => {
    undoStackRef.current.push(JSON.parse(JSON.stringify(state)));
    if (undoStackRef.current.length > 10) undoStackRef.current.shift();
  }, [state]);

  // --- Scoring Actions ---

  const addRuns = useCallback(
    (runs) => {
      setState((prev) => {
        const s = JSON.parse(JSON.stringify(prev));
        undoStackRef.current.push(JSON.parse(JSON.stringify(prev)));
        if (undoStackRef.current.length > 10) undoStackRef.current.shift();

        const isLastBallOfOver = (s.bowler.ballsInCurrentOver + 1 === 6);
        const actualRuns = isLastBallOfOver ? (runs * 2) : runs;

        s.teamRuns += actualRuns;
        s.totalBalls += 1;
        s.partnerRuns += actualRuns;
        s.partnerBalls += 1;
        s.currentOverRuns += actualRuns;

        const striker = s.batsmen[s.strikerIndex];
        striker.runs += actualRuns;
        striker.balls += 1;
        if (runs === 4) striker.fours += 1;
        if (runs === 6) striker.sixes += 1;

        s.bowler.runs += actualRuns;
        s.bowler.ballsInCurrentOver += 1;

        s.lastBalls.push(actualRuns.toString());
        if (s.lastBalls.length > 6) s.lastBalls.shift();

        if (s.freeHit) s.freeHit = false;
        if (runs % 2 !== 0) s.strikerIndex = s.strikerIndex === 0 ? 1 : 0;

        // Check over complete
        if (s.bowler.ballsInCurrentOver === 6) {
          s.oversHistory.push({
            over: s.oversHistory.length + 1,
            runs: s.currentOverRuns,
            wickets: s.currentOverWickets,
          });
          s.currentOverRuns = 0;
          s.currentOverWickets = 0;
          s.bowler.overs += 1;
          s.bowler.ballsInCurrentOver = 0;
          s.strikerIndex = s.strikerIndex === 0 ? 1 : 0;
          // We'll handle the bowler modal after setState
        }

        syncAllBatsmen(s);
        syncAllBowlers(s);
        if (socket) {
          socket.emit('updateState', s);
          socket.emit('updateConfig', config);
        }
        return s;
      });

      if (runs === 4) triggerAnimation('FOUR');
      if (runs === 6) triggerAnimation('SIX');

      // Check if over is complete after state update
      setState((prev) => {
        if (prev.bowler.ballsInCurrentOver === 0 && prev.bowler.overs > 0) {
          if (prev.bowler.overs === config.totalOvers) {
            triggerAnimation('OVERSUMMARY');
            if (config.innings === 1) {
              setTimeout(() => {
                triggerAnimation('INNINGS_COMPLETE');
              }, 6000);
              setTimeout(() => {
                if (socket) socket.emit('triggerEvent', 'SCORECARD_TOGGLE');
                setOverlays((p) => ({ ...p, scorecard: true }));
              }, 9500);
            }
          } else {
            triggerAnimation('OVERSUMMARY');
            setShowBowlerModal(true);
          }
        }
        return prev;
      });
    },
    [socket, config, syncAllBatsmen, syncAllBowlers, triggerAnimation]
  );

  const addExtra = useCallback(
    (type) => {
      setState((prev) => {
        const s = JSON.parse(JSON.stringify(prev));
        undoStackRef.current.push(JSON.parse(JSON.stringify(prev)));
        if (undoStackRef.current.length > 10) undoStackRef.current.shift();

        if (type === 'WIDE') {
          s.teamRuns += 1;
          s.currentOverRuns += 1;
          s.bowler.runs += 1;
          s.lastBalls.push('WD');
          if (s.lastBalls.length > 6) s.lastBalls.shift();
        } else if (type === 'NB') {
          s.teamRuns += 1;
          s.currentOverRuns += 1;
          s.bowler.runs += 1;
          s.freeHit = true;
          s.lastBalls.push('NB');
          if (s.lastBalls.length > 6) s.lastBalls.shift();
        } else if (type === 'LB' || type === 'B') {
          const isLastBallOfOver = (s.bowler.ballsInCurrentOver + 1 === 6);
          const extraRuns = isLastBallOfOver ? 2 : 1;

          s.teamRuns += extraRuns;
          s.currentOverRuns += extraRuns;
          s.totalBalls += 1;
          s.partnerRuns += extraRuns;
          s.partnerBalls += 1;
          s.batsmen[s.strikerIndex].balls += 1;
          s.bowler.ballsInCurrentOver += 1;
          s.lastBalls.push(isLastBallOfOver ? `2${type}` : type);
          if (s.lastBalls.length > 6) s.lastBalls.shift();
          s.strikerIndex = s.strikerIndex === 0 ? 1 : 0;

          if (s.bowler.ballsInCurrentOver === 6) {
            s.oversHistory.push({
              over: s.oversHistory.length + 1,
              runs: s.currentOverRuns,
              wickets: s.currentOverWickets,
            });
            s.currentOverRuns = 0;
            s.currentOverWickets = 0;
            s.bowler.overs += 1;
            s.bowler.ballsInCurrentOver = 0;
            s.strikerIndex = s.strikerIndex === 0 ? 1 : 0;
          }
        }

        syncAllBatsmen(s);
        syncAllBowlers(s);
        if (socket) {
          socket.emit('updateState', s);
          socket.emit('updateConfig', config);
        }
        return s;
      });

      if (type === 'WIDE') triggerAnimation('WIDE');
      if (type === 'NB') triggerAnimation('NOBALL');

      // Check if over is complete after state update
      setState((prev) => {
        if (prev.bowler.ballsInCurrentOver === 0 && prev.bowler.overs > 0) {
          if (prev.bowler.overs === config.totalOvers) {
            triggerAnimation('OVERSUMMARY');
            if (config.innings === 1) {
              setTimeout(() => {
                triggerAnimation('INNINGS_COMPLETE');
              }, 6000);
              setTimeout(() => {
                if (socket) socket.emit('triggerEvent', 'SCORECARD_TOGGLE');
                setOverlays((p) => ({ ...p, scorecard: true }));
              }, 9500);
            }
          } else {
            triggerAnimation('OVERSUMMARY');
            setShowBowlerModal(true);
          }
        }
        return prev;
      });
    },
    [socket, config, syncAllBatsmen, syncAllBowlers, triggerAnimation]
  );

  const addWicket = useCallback(() => {
    setState((prev) => {
      const s = JSON.parse(JSON.stringify(prev));
      undoStackRef.current.push(JSON.parse(JSON.stringify(prev)));
      if (undoStackRef.current.length > 10) undoStackRef.current.shift();

      if (s.freeHit) {
        alert('Cannot take wicket on a Free Hit (unless run out).');
        s.freeHit = false;
        s.totalBalls += 1;
        s.bowler.ballsInCurrentOver += 1;
        s.batsmen[s.strikerIndex].balls += 1;
        s.lastBalls.push('0');
        if (s.lastBalls.length > 6) s.lastBalls.shift();

        if (s.bowler.ballsInCurrentOver === 6) {
          s.oversHistory.push({
            over: s.oversHistory.length + 1,
            runs: s.currentOverRuns,
            wickets: s.currentOverWickets,
          });
          s.currentOverRuns = 0;
          s.currentOverWickets = 0;
          s.bowler.overs += 1;
          s.bowler.ballsInCurrentOver = 0;
          s.strikerIndex = s.strikerIndex === 0 ? 1 : 0;
        }

        syncAllBatsmen(s);
        syncAllBowlers(s);
        if (socket) {
          socket.emit('updateState', s);
          socket.emit('updateConfig', config);
        }
        return s;
      }

      const isLastBallOfOver = (s.bowler.ballsInCurrentOver + 1 === 6);

      s.teamWickets += 1;
      s.currentOverWickets += 1;
      s.totalBalls += 1;
      s.bowler.ballsInCurrentOver += 1;
      s.bowler.wickets += 1;
      s.batsmen[s.strikerIndex].balls += 1;

      if (isLastBallOfOver) {
        s.teamRuns -= 5;
        s.currentOverRuns -= 5;
        s.lastBalls.push('W(-5)');
      } else {
        s.lastBalls.push('W');
      }
      if (s.lastBalls.length > 6) s.lastBalls.shift();

      s.partnerRuns = 0;
      s.partnerBalls = 0;

      const striker = s.batsmen[s.strikerIndex];
      if (s.allBatsmen) {
        const ab = s.allBatsmen.find((b) => b.id === striker.id);
        if (ab) ab.status = 'out';
      }

      striker.id = s.allBatsmen ? s.allBatsmen.length : Date.now();
      striker.runs = 0;
      striker.balls = 0;
      striker.fours = 0;
      striker.sixes = 0;

      syncAllBatsmen(s);
      syncAllBowlers(s);
      if (socket) {
        socket.emit('updateState', s);
        socket.emit('updateConfig', config);
      }
      return s;
    });

    triggerAnimation('WICKET');
    setShowBatsmanModal(true);

    // Check if over is complete after state update
    setState((prev) => {
      if (prev.bowler.ballsInCurrentOver === 0 && prev.bowler.overs > 0) {
        if (prev.bowler.overs === config.totalOvers) {
          triggerAnimation('OVERSUMMARY');
          if (config.innings === 1) {
            setTimeout(() => {
              triggerAnimation('INNINGS_COMPLETE');
            }, 6000);
            setTimeout(() => {
              if (socket) socket.emit('triggerEvent', 'SCORECARD_TOGGLE');
              setOverlays((p) => ({ ...p, scorecard: true }));
            }, 9500);
          }
        } else {
          triggerAnimation('OVERSUMMARY');
          setShowBowlerModal(true);
        }
      }
      return prev;
    });
  },
  [socket, config, syncAllBatsmen, syncAllBowlers, triggerAnimation]);

  const undoLastBall = useCallback(() => {
    if (undoStackRef.current.length === 0) {
      alert('No more actions to undo.');
      return;
    }
    const prev = undoStackRef.current.pop();
    setState(prev);
    if (socket) {
      socket.emit('updateState', prev);
      socket.emit('updateConfig', config);
    }
  }, [socket, config]);

  const saveSettings = useCallback(
    (newConfig, newState) => {
      const c = { ...config, ...newConfig };
      const s = { ...state, ...newState };
      setConfig(c);
      setState(s);
      syncAllBatsmen(s);
      syncAllBowlers(s);
      if (socket) {
        socket.emit('updateState', s);
        socket.emit('updateConfig', c);
      }
    },
    [socket, state, config, syncAllBatsmen, syncAllBowlers]
  );

  const resetMatch = useCallback(
    (strikerName, nonStrikerName, bowlerName) => {
      const s = {
        ...state,
        teamRuns: 0,
        teamWickets: 0,
        totalBalls: 0,
        lastBalls: [],
        partnerRuns: 0,
        partnerBalls: 0,
        strikerIndex: 0,
        target: 0,
        currentOverRuns: 0,
        currentOverWickets: 0,
        oversHistory: [],
        freeHit: false,
        allBatsmen: [
          { id: 0, name: strikerName || 'Batsman 1', runs: 0, balls: 0, fours: 0, sixes: 0, status: 'not out' },
          { id: 1, name: nonStrikerName || 'Batsman 2', runs: 0, balls: 0, fours: 0, sixes: 0, status: 'not out' },
        ],
        batsmen: [
          { id: 0, name: strikerName || 'Batsman 1', runs: 0, balls: 0, fours: 0, sixes: 0 },
          { id: 1, name: nonStrikerName || 'Batsman 2', runs: 0, balls: 0, fours: 0, sixes: 0 },
        ],
        allBowlers: [
          { id: 0, name: bowlerName || 'Bowler', overs: 0, ballsInCurrentOver: 0, runs: 0, maidens: 0, wickets: 0 },
        ],
        bowler: { id: 0, name: bowlerName || 'Bowler', overs: 0, ballsInCurrentOver: 0, runs: 0, maidens: 0, wickets: 0 },
      };
      const c = { ...config, innings: 1 };
      setState(s);
      setConfig(c);
      undoStackRef.current = [];
      if (socket) {
        socket.emit('updateState', s);
        socket.emit('updateConfig', c);
      }
    },
    [socket, state, config]
  );

  const startSecondInnings = useCallback(
    (strikerName, nonStrikerName, bowlerName) => {
      const target = state.teamRuns + 1;
      const c = { ...config, innings: 2, teamA: config.teamB, teamB: config.teamA };
      const s = {
        ...state,
        target,
        teamRuns: 0,
        teamWickets: 0,
        totalBalls: 0,
        lastBalls: [],
        partnerRuns: 0,
        partnerBalls: 0,
        strikerIndex: 0,
        currentOverRuns: 0,
        currentOverWickets: 0,
        oversHistory: [],
        freeHit: false,
        allBatsmen: [
          { id: 0, name: strikerName || 'Batsman 1', runs: 0, balls: 0, fours: 0, sixes: 0, status: 'not out' },
          { id: 1, name: nonStrikerName || 'Batsman 2', runs: 0, balls: 0, fours: 0, sixes: 0, status: 'not out' },
        ],
        batsmen: [
          { id: 0, name: strikerName || 'Batsman 1', runs: 0, balls: 0, fours: 0, sixes: 0 },
          { id: 1, name: nonStrikerName || 'Batsman 2', runs: 0, balls: 0, fours: 0, sixes: 0 },
        ],
        allBowlers: [
          { id: 0, name: bowlerName || 'Bowler', overs: 0, ballsInCurrentOver: 0, runs: 0, maidens: 0, wickets: 0 },
        ],
        bowler: { id: 0, name: bowlerName || 'Bowler', overs: 0, ballsInCurrentOver: 0, runs: 0, maidens: 0, wickets: 0 },
      };
      setState(s);
      setConfig(c);
      undoStackRef.current = [];
      if (socket) {
        socket.emit('updateState', s);
        socket.emit('updateConfig', c);
      }
      return target;
    },
    [socket, state, config]
  );

  const retireBatsman = useCallback(() => {
    setState((prev) => {
      const s = JSON.parse(JSON.stringify(prev));
      undoStackRef.current.push(JSON.parse(JSON.stringify(prev)));
      if (undoStackRef.current.length > 10) undoStackRef.current.shift();

      const striker = s.batsmen[s.strikerIndex];
      if (s.allBatsmen) {
        const ab = s.allBatsmen.find((b) => b.id === striker.id);
        if (ab) ab.status = 'retired';
      }

      striker.id = s.allBatsmen ? s.allBatsmen.length : Date.now();
      striker.runs = 0;
      striker.balls = 0;
      striker.fours = 0;
      striker.sixes = 0;

      syncAllBatsmen(s);
      syncAllBowlers(s);
      if (socket) {
        socket.emit('updateState', s);
        socket.emit('updateConfig', config);
      }
      return s;
    });
    setShowBatsmanModal(true);
  }, [socket, config, syncAllBatsmen, syncAllBowlers]);

  const saveNewBatsman = useCallback(
    (name) => {
      setState((prev) => {
        const s = JSON.parse(JSON.stringify(prev));
        const striker = s.batsmen[s.strikerIndex];
        
        let existing = null;
        if (s.allBatsmen) {
          existing = s.allBatsmen.find((b) => b.name === name);
        }
        
        if (existing) {
          striker.id = existing.id;
          striker.name = existing.name;
          striker.runs = existing.runs;
          striker.balls = existing.balls;
          striker.fours = existing.fours;
          striker.sixes = existing.sixes;
          existing.status = 'not out';
        } else {
          striker.name = name || 'New Batsman';
          if (s.allBatsmen) {
            s.allBatsmen.push({
              id: striker.id,
              name: striker.name,
              runs: 0,
              balls: 0,
              fours: 0,
              sixes: 0,
              status: 'not out',
            });
          }
        }
        if (s.bowler.ballsInCurrentOver === 6) {
          s.oversHistory.push({
            over: s.oversHistory.length + 1,
            runs: s.currentOverRuns,
            wickets: s.currentOverWickets,
          });
          s.currentOverRuns = 0;
          s.currentOverWickets = 0;
          s.bowler.overs += 1;
          s.bowler.ballsInCurrentOver = 0;
          s.strikerIndex = s.strikerIndex === 0 ? 1 : 0;
        }
        syncAllBatsmen(s);
        syncAllBowlers(s);
        if (socket) {
          socket.emit('updateState', s);
          socket.emit('updateConfig', config);
        }
        return s;
      });
      setShowBatsmanModal(false);

      setState((prev) => {
        if (prev.bowler.ballsInCurrentOver === 0 && prev.bowler.overs > 0) {
          if (prev.bowler.overs === config.totalOvers) {
            triggerAnimation('OVERSUMMARY');
            if (config.innings === 1) {
              setTimeout(() => {
                triggerAnimation('INNINGS_COMPLETE');
              }, 6000);
              setTimeout(() => {
                if (socket) socket.emit('triggerEvent', 'SCORECARD_TOGGLE');
                setOverlays((p) => ({ ...p, scorecard: true }));
              }, 9500);
            }
          } else {
            triggerAnimation('OVERSUMMARY');
            setShowBowlerModal(true);
          }
        }
        return prev;
      });
    },
    [socket, config, syncAllBatsmen, syncAllBowlers, triggerAnimation]
  );

  const saveNewBowler = useCallback(
    (name) => {
      setState((prev) => {
        const s = JSON.parse(JSON.stringify(prev));
        let existing = null;
        if (s.allBowlers) {
          existing = s.allBowlers.find((b) => b.name.toLowerCase() === (name || '').toLowerCase());
        }
        if (existing) {
          s.bowler = { ...existing };
        } else {
          const newId = s.allBowlers ? s.allBowlers.length : Date.now();
          s.bowler = { id: newId, name: name || 'New Bowler', overs: 0, ballsInCurrentOver: 0, runs: 0, maidens: 0, wickets: 0 };
          if (s.allBowlers) {
            s.allBowlers.push({ ...s.bowler });
          }
        }
        syncAllBatsmen(s);
        syncAllBowlers(s);
        if (socket) {
          socket.emit('updateState', s);
          socket.emit('updateConfig', config);
        }
        return s;
      });
      setShowBowlerModal(false);
    },
    [socket, config, syncAllBatsmen, syncAllBowlers]
  );

  const setFreeHit = useCallback(
    (val) => {
      setState((prev) => {
        const s = { ...prev, freeHit: val };
        if (socket) {
          socket.emit('updateState', s);
          socket.emit('updateConfig', config);
        }
        return s;
      });
    },
    [socket, config]
  );

  // Overlay toggles
  const toggleOverlay = useCallback(
    (name) => {
      const eventMap = {
        graph: 'GRAPH_TOGGLE',
        batterSummary: 'BATTER_SUMMARY_TOGGLE',
        scorecard: 'SCORECARD_TOGGLE',
        bowlingScorecard: 'BOWLING_SCORECARD_TOGGLE',
        squads: 'SQUADS_TOGGLE',
      };
      if (socket) socket.emit('triggerEvent', eventMap[name]);
      setOverlays((p) => ({ ...p, [name]: !p[name] }));
    },
    [socket]
  );

  const hideOverlay = useCallback(
    (name) => {
      const eventMap = {
        graph: 'GRAPH_HIDE',
        batterSummary: 'BATTER_SUMMARY_HIDE',
        scorecard: 'SCORECARD_HIDE',
        bowlingScorecard: 'BOWLING_SCORECARD_HIDE',
        squads: 'SQUADS_HIDE',
      };
      if (socket) socket.emit('triggerEvent', eventMap[name]);
      setOverlays((p) => ({ ...p, [name]: false }));
    },
    [socket]
  );

  const showNotOut = useCallback(() => {
    triggerAnimation('NOTOUT');
  }, [triggerAnimation]);

  return {
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
    triggerAnimation,
    setShowBatsmanModal,
    setShowBowlerModal,
  };
}
