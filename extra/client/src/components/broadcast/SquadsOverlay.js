'use client';

import { memo } from 'react';

function SquadsOverlay({ active, state, config, onClick }) {
  const teamAPlayers = state.teamsWithPlayers?.find(t => t.name === config.teamA)?.players || [];
  const teamBPlayers = state.teamsWithPlayers?.find(t => t.name === config.teamB)?.players || [];

  const playersA = teamAPlayers.length > 0 ? teamAPlayers : (state.teamAPlayers || []).map(name => ({
    name,
    image: state.playerImages?.[name] || null
  }));
  const playersB = teamBPlayers.length > 0 ? teamBPlayers : (state.teamBPlayers || []).map(name => ({
    name,
    image: state.playerImages?.[name] || null
  }));

  return (
    <div
      className={`graph-overlay ${active ? 'active' : ''}`}
      onClick={onClick}
      style={{
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: '40px',
        overflowY: 'auto',
        paddingBottom: '40px',
      }}
    >
      <div
        className="graph-title"
        style={{
          color: '#00E5FF',
          textShadow: '0 0 20px rgba(0, 229, 255, 0.5)',
          fontSize: '70px',
          marginBottom: '10px',
          textAlign: 'center',
        }}
      >
        PLAYING SQUADS
      </div>
      <div
        style={{
          fontSize: '24px',
          color: '#aaa',
          marginBottom: '40px',
          textTransform: 'uppercase',
          letterSpacing: '3px',
          fontWeight: 'bold',
          textAlign: 'center',
        }}
      >
        {config.teamA} <span style={{ color: '#00E5FF' }}>VS</span> {config.teamB}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '40px',
          width: '90%',
          maxWidth: '1200px',
        }}
      >
        {/* Team A Squad */}
        <div
          style={{
            background: 'rgba(0, 15, 40, 0.9)',
            borderRadius: '20px',
            border: '2px solid #E040FB',
            boxShadow: '0 0 35px rgba(224, 64, 251, 0.25)',
            padding: '30px',
          }}
        >
          <h2
            style={{
              color: '#E040FB',
              fontSize: '32px',
              fontWeight: '900',
              textAlign: 'center',
              marginBottom: '25px',
              borderBottom: '2px solid rgba(224, 64, 251, 0.2)',
              paddingBottom: '15px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            {config.teamA}
          </h2>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
            }}
          >
            {playersA.map((p, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '18px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  padding: '10px 20px',
                  borderRadius: '12px',
                }}
              >
                <span
                  style={{
                    color: '#E040FB',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    width: '24px',
                  }}
                >
                  {idx + 1}
                </span>
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.name}
                    style={{
                      width: '45px',
                      height: '45px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid #E040FB',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '45px',
                      height: '45px',
                      borderRadius: '50%',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      color: 'rgba(255, 255, 255, 0.4)',
                    }}
                  >
                    👤
                  </div>
                )}
                <span
                  style={{
                    color: '#fff',
                    fontSize: '22px',
                    fontWeight: 'bold',
                  }}
                >
                  {p.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Team B Squad */}
        <div
          style={{
            background: 'rgba(0, 15, 40, 0.9)',
            borderRadius: '20px',
            border: '2px solid #00B0FF',
            boxShadow: '0 0 35px rgba(0, 176, 255, 0.25)',
            padding: '30px',
          }}
        >
          <h2
            style={{
              color: '#00B0FF',
              fontSize: '32px',
              fontWeight: '900',
              textAlign: 'center',
              marginBottom: '25px',
              borderBottom: '2px solid rgba(0, 176, 255, 0.2)',
              paddingBottom: '15px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            {config.teamB}
          </h2>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
            }}
          >
            {playersB.map((p, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '18px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  padding: '10px 20px',
                  borderRadius: '12px',
                }}
              >
                <span
                  style={{
                    color: '#00B0FF',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    width: '24px',
                  }}
                >
                  {idx + 1}
                </span>
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.name}
                    style={{
                      width: '45px',
                      height: '45px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid #00B0FF',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '45px',
                      height: '45px',
                      borderRadius: '50%',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      color: 'rgba(255, 255, 255, 0.4)',
                    }}
                  >
                    👤
                  </div>
                )}
                <span
                  style={{
                    color: '#fff',
                    fontSize: '22px',
                    fontWeight: 'bold',
                  }}
                >
                  {p.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(SquadsOverlay);
