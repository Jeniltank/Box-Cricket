'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '@/context/SocketContext';
import { useValidation } from '@/hooks/useValidation';

export default function TeamsPage() {
  const { socket } = useSocket();
  const { errors, validateTeamName, validatePlayerName, clearError } = useValidation();

  const [state, setState] = useState({ singleTeamPlayers: [], playerImages: {}, teamsWithPlayers: [] });
  const [config, setConfig] = useState({});
  const [teamName, setTeamName] = useState('TEAM 1');
  const [playerInput, setPlayerInput] = useState('');
  const [category, setCategory] = useState('MAN');
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [editingTeamId, setEditingTeamId] = useState(null);
  const fileInputRef = useRef(null);
  const currentPlayerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const backendUrl = typeof window !== 'undefined' ? `http://${window.location.hostname}:3000` : 'http://localhost:3000';
    fetch(`${backendUrl}/api/state`)
      .then((res) => res.json())
      .then((data) => {
        if (data.state_data && Object.keys(data.state_data).length > 0) {
          const s = data.state_data;
          if (!s.singleTeamPlayers) s.singleTeamPlayers = [];
          if (!s.playerImages) s.playerImages = {};
          setState(s);
        }
        if (data.config_data && Object.keys(data.config_data).length > 0) {
          setConfig(data.config_data);
          if (data.config_data.category) setCategory(data.config_data.category);
        }
      })
      .catch((err) => console.error('Error loading state:', err));
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleState = (data) => {
      if (!data.singleTeamPlayers) data.singleTeamPlayers = [];
      if (!data.playerImages) data.playerImages = {};
      setState(data);
    };
    const handleConfig = (data) => {
      setConfig(data);
      if (data.category) setCategory(data.category);
    };
    socket.on('stateUpdated', handleState);
    socket.on('configUpdated', handleConfig);
    return () => {
      socket.off('stateUpdated', handleState);
      socket.off('configUpdated', handleConfig);
    };
  }, [socket]);

  const saveState = useCallback(
    (s) => {
      if (socket) socket.emit('updateState', s);
    },
    [socket]
  );

  const addPlayer = useCallback(() => {
    const name = playerInput.trim();
    if (!name) return;
    const err = validatePlayerName(name, state.singleTeamPlayers);
    if (err) return;

    const newState = {
      ...state,
      singleTeamPlayers: [...state.singleTeamPlayers, name],
    };
    setState(newState);
    saveState(newState);
    setPlayerInput('');
    clearError('playerName');
  }, [playerInput, state, validatePlayerName, saveState, clearError]);

  const removePlayer = useCallback(
    (index) => {
      const newPlayers = [...state.singleTeamPlayers];
      newPlayers.splice(index, 1);
      const newState = { ...state, singleTeamPlayers: newPlayers };
      setState(newState);
      saveState(newState);
    },
    [state, saveState]
  );

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === 'Enter') addPlayer();
    },
    [addPlayer]
  );

  const triggerUpload = useCallback((playerName) => {
    currentPlayerRef.current = playerName;
    fileInputRef.current?.click();
  }, []);

  const handleImageUpload = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (!file || !currentPlayerRef.current) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const ctx = canvas.getContext('2d');
          const maxSize = 150;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxSize) { height *= maxSize / width; width = maxSize; }
          } else {
            if (height > maxSize) { width *= maxSize / height; height = maxSize; }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);

          const newState = {
            ...state,
            playerImages: { ...(state.playerImages || {}), [currentPlayerRef.current]: dataUrl },
          };
          setState(newState);
          saveState(newState);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    },
    [state, saveState]
  );

  const handleCategoryChange = useCallback(
    (val) => {
      setCategory(val);
      const c = { ...config, category: val };
      setConfig(c);
      if (socket) socket.emit('updateConfig', c);
    },
    [config, socket]
  );

  const startEditing = useCallback((team) => {
    setEditingTeamId(team.id);
    setTeamName(team.name);
    setCategory(team.category || 'MAN');
    
    // Set players and their images
    const playerNames = team.players.map(p => p.name);
    const images = {};
    team.players.forEach(p => {
      if (p.image) {
        images[p.name] = p.image;
      }
    });
    
    const newState = {
      ...state,
      singleTeamPlayers: playerNames,
      playerImages: { ...state.playerImages, ...images }
    };
    setState(newState);
    saveState(newState);
  }, [state, saveState]);

  const cancelEditing = useCallback(() => {
    setEditingTeamId(null);
    setTeamName('TEAM 1');
    const newState = {
      ...state,
      singleTeamPlayers: [],
      playerImages: {}
    };
    setState(newState);
    saveState(newState);
  }, [state, saveState]);

  const deleteTeam = useCallback(async (teamId, name) => {
    if (!confirm(`Are you sure you want to delete the team "${name}" from the database?`)) return;

    try {
      const backendUrl = typeof window !== 'undefined' ? `http://${window.location.hostname}:3000` : 'http://localhost:3000';
      const response = await fetch(`${backendUrl}/api/delete-team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId }),
      });

      const result = await response.json();
      if (result.success) {
        if (editingTeamId === teamId) {
          setEditingTeamId(null);
          setTeamName('TEAM 1');
          setState(prev => ({ ...prev, singleTeamPlayers: [], playerImages: {} }));
        }

        const freshData = await fetch(`${backendUrl}/api/state`).then((r) => r.json());
        if (freshData.state_data) {
          const s = freshData.state_data;
          if (!s.singleTeamPlayers) s.singleTeamPlayers = [];
          if (!s.playerImages) s.playerImages = {};
          setState(s);
        }
        if (freshData.config_data) {
          setConfig(freshData.config_data);
          if (socket) socket.emit('updateConfig', freshData.config_data);
        }
        alert('Team deleted successfully!');
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error(err);
      alert(`Failed to delete team: ${err.message}`);
    }
  }, [socket, editingTeamId]);

  const saveSingleTeam = useCallback(async () => {
    const err = validateTeamName(teamName);
    if (err) return;
    if (state.singleTeamPlayers.length === 0) {
      alert('Please add at least one player!');
      return;
    }

    setSaving(true);
    setSaveStatus('');

    try {
      const backendUrl = typeof window !== 'undefined' ? `http://${window.location.hostname}:3000` : 'http://localhost:3000';
      const endpoint = editingTeamId ? '/api/update-team' : '/api/add-team';
      const body = {
        teamName: teamName.trim() || 'NEW TEAM',
        players: state.singleTeamPlayers,
        playerImages: state.playerImages,
        category: category,
      };
      if (editingTeamId) {
        body.teamId = editingTeamId;
      }

      const response = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (result.success) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus(''), 2000);

        setEditingTeamId(null);
        const newState = { ...state, singleTeamPlayers: [], playerImages: {} };
        setState(newState);
        setTeamName('TEAM 1');
        if (socket) socket.emit('updateState', newState);

        const freshData = await fetch(`${backendUrl}/api/state`).then((r) => r.json());
        if (freshData.state_data) {
          const s = freshData.state_data;
          if (!s.singleTeamPlayers) s.singleTeamPlayers = [];
          if (!s.playerImages) s.playerImages = {};
          setState(s);
        }
        if (freshData.config_data) {
          setConfig(freshData.config_data);
          if (socket) socket.emit('updateConfig', freshData.config_data);
        }
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(''), 2000);
      alert('Failed to save team to database!');
    } finally {
      setSaving(false);
    }
  }, [teamName, state, socket, validateTeamName, editingTeamId, category]);

  const getPlayerAvatar = (name) => {
    if (state.playerImages && state.playerImages[name]) {
      return <img src={state.playerImages[name]} alt={name} className="player-avatar" />;
    }
    return <div className="player-avatar-placeholder">👤</div>;
  };

  return (
    <div className="teams-page">
      <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div className="admin-header">
        <div style={{ flex: 1, textAlign: 'left' }}>
          <a href="/admin" className="btn-back">⬅ BACK TO DASHBOARD</a>
        </div>
        <div style={{ flex: 2, textAlign: 'center' }}>
          BOX CRICKET <span>{editingTeamId ? 'EDIT TEAM' : 'ADD NEW TEAM'}</span>
        </div>
        <div style={{ flex: 1, textAlign: 'right', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          {editingTeamId && (
            <button
              className="btn-save-teams"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}
              onClick={cancelEditing}
            >
              CANCEL
            </button>
          )}
          <button
            className={`btn-save-teams ${saveStatus === 'success' ? 'saved' : ''}`}
            onClick={saveSingleTeam}
            disabled={saving}
          >
            {saving ? 'SAVING...' : saveStatus === 'success' ? '✓ SAVED!' : saveStatus === 'error' ? 'ERROR' : editingTeamId ? 'UPDATE TEAM' : 'SAVE TEAM TO DATABASE'}
          </button>
        </div>
      </div>

      <div className="category-select">
        <label>CATEGORY:</label>
        <select value={category} onChange={(e) => handleCategoryChange(e.target.value)}>
          <option value="MAN">MAN</option>
          <option value="WOMAN">WOMAN</option>
          <option value="COUPAL">COUPAL</option>
        </select>
      </div>

      <div className="teams-container" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', maxWidth: '1200px' }}>
        <div className="team-card team-a-card">
          <div className="team-card-header">
            <input
              type="text"
              className="team-name-input team-a-title"
              value={teamName}
              onChange={(e) => {
                setTeamName(e.target.value);
                validateTeamName(e.target.value);
              }}
            />
            <span className="roster-label">ROSTER</span>
          </div>
          {errors?.teamName && <span className="error-text" style={{ marginBottom: '10px', display: 'block' }}>{errors.teamName}</span>}

          <div className="input-group-row">
            <input
              type="text"
              value={playerInput}
              onChange={(e) => {
                setPlayerInput(e.target.value);
                if (errors?.playerName) clearError('playerName');
              }}
              placeholder="Enter Player Name..."
              onKeyDown={handleKeyPress}
              className={errors?.playerName ? 'input-error' : ''}
            />
            <button className="btn-add btn-team-a" onClick={addPlayer}>ADD</button>
          </div>
          {errors?.playerName && <span className="error-text">{errors.playerName}</span>}

          <ul className="player-list">
            {state.singleTeamPlayers.map((p, index) => (
              <li key={index}>
                <div className="player-info">
                  {getPlayerAvatar(p)}
                  {p}
                </div>
                <div>
                  <button className="btn-remove btn-upload" onClick={() => triggerUpload(p)} title="Upload Photo">🖼️</button>
                  <button className="btn-remove" onClick={() => removePlayer(index)}>✖</button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Existing Teams Roster Card */}
        <div className="team-card" style={{ borderColor: '#00E5FF', minHeight: '500px' }}>
          <div className="team-card-header" style={{ borderBottomColor: 'rgba(0, 229, 255, 0.2)' }}>
            <span className="roster-label" style={{ color: '#00E5FF', marginLeft: 0 }}>SAVED TEAMS IN DATABASE</span>
          </div>
          <div className="existing-teams-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '500px', overflowY: 'auto', paddingRight: '5px' }}>
            {state.teamsWithPlayers && state.teamsWithPlayers.length > 0 ? (
              state.teamsWithPlayers.map((team) => (
                <div key={team.id} style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '15px 20px', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ color: '#00E5FF', fontSize: '18px', fontWeight: '800', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
                      {team.name} <span style={{ fontSize: '12px', color: '#aaa', fontWeight: 'normal', textTransform: 'none', marginLeft: '5px' }}>({team.category})</span>
                    </h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => startEditing(team)}
                        style={{
                          background: 'rgba(0, 229, 255, 0.1)',
                          border: '1px solid #00E5FF',
                          color: '#00E5FF',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                        }}
                      >
                        ✏️ EDIT
                      </button>
                      <button
                        onClick={() => deleteTeam(team.id, team.name)}
                        style={{
                          background: 'rgba(255, 23, 68, 0.1)',
                          border: '1px solid #FF1744',
                          color: '#FF1744',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                        }}
                      >
                        🗑️ DELETE
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {team.players.map((player, pIdx) => (
                      <span key={player.id || pIdx} style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '6px 12px', borderRadius: '20px', color: '#ccc', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        {player.image ? (
                          <img src={player.image} alt={player.name} style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          '👤'
                        )}
                        <span>{player.name}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))
            ) : state.allTeamsPlayers && Object.keys(state.allTeamsPlayers).length > 0 ? (
              Object.keys(state.allTeamsPlayers).map((name) => (
                <div key={name} style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '15px 20px', borderRadius: '8px' }}>
                  <h3 style={{ color: '#00E5FF', fontSize: '18px', fontWeight: '800', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>{name}</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {state.allTeamsPlayers[name].map((player, pIdx) => (
                      <span key={pIdx} style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '6px 12px', borderRadius: '20px', color: '#ccc', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        👤 {player}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: '#888', fontStyle: 'italic', textAlign: 'center', marginTop: '50px' }}>No teams saved yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
