const backendUrl = typeof window !== 'undefined' ? `http://${window.location.hostname}:3000` : 'http://localhost:3000';
const socket = io(backendUrl);

let state = { singleTeamPlayers: [], playerImages: {} };
let config = {};
let editingTeamId = null;

fetch(`${backendUrl}/api/state`)
    .then(res => res.json())
    .then(data => {
        if(data.state_data && Object.keys(data.state_data).length > 0) state = data.state_data;
        if(data.config_data && Object.keys(data.config_data).length > 0) config = data.config_data;
        
        if (!state.singleTeamPlayers) state.singleTeamPlayers = [];
        if (!state.playerImages) state.playerImages = {};

        if (els.teamCategory && config.category) els.teamCategory.value = config.category;

        renderLists();
    });

const els = {
    singleTeamInput: document.getElementById('input-single-team-player'),
    singleTeamList: document.getElementById('single-team-list'),
    singleTeamName: document.getElementById('single-team-name'),
    teamCategory: document.getElementById('team-category')
};

window.updateTeamNames = function () {
    if (els.teamCategory) config.category = els.teamCategory.value;
    socket.emit('updateConfig', config);
};

function saveState() {
    socket.emit('updateState', state);
}

// Upload logic
let currentPlayerForUpload = null;
window.triggerUpload = function (playerName) {
    currentPlayerForUpload = playerName;
    document.getElementById('image-upload').click();
};

document.getElementById('image-upload').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file || !currentPlayerForUpload) return;

    const reader = new FileReader();
    reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
            const canvas = document.getElementById('image-canvas');
            const ctx = canvas.getContext('2d');

            const maxSize = 150;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxSize) {
                    height *= maxSize / width;
                    width = maxSize;
                }
            } else {
                if (height > maxSize) {
                    width *= maxSize / height;
                    height = maxSize;
                }
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);

            if (!state.playerImages) state.playerImages = {};
            state.playerImages[currentPlayerForUpload] = dataUrl;
            saveState();
            renderLists();
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
});

function getPlayerAvatar(name) {
    if (state.playerImages && state.playerImages[name]) {
        return `<img src="${state.playerImages[name]}" style="width:40px; height:40px; border-radius:50%; object-fit:cover; border:2px solid var(--primary-accent); margin-right:15px; box-shadow: 0 0 10px rgba(0, 123, 255, 0.3);">`;
    }
    return `<div style="width:40px; height:40px; border-radius:50%; background:rgba(255,255,255,0.05); display:flex; justify-content:center; align-items:center; border:2px solid rgba(255,255,255,0.1); margin-right:15px; color:rgba(255,255,255,0.3); font-size:20px;">👤</div>`;
}

function renderLists() {
    if (els.singleTeamList) {
        els.singleTeamList.innerHTML = state.singleTeamPlayers.map((p, index) =>
            `<li>
                <div style="display:flex; align-items:center;">
                    ${getPlayerAvatar(p)}
                    ${p} 
                </div>
                <div>
                    <button class="btn-remove" style="background:rgba(76, 175, 80, 0.1); color:#4CAF50; border-color:rgba(76, 175, 80, 0.3); display:inline-flex; margin-right:10px;" onclick="triggerUpload('${p}')" title="Upload Photo">🖼️</button>
                    <button class="btn-remove" style="display:inline-flex;" onclick="removePlayerSingle(${index})">✖</button>
                </div>
            </li>`
        ).join('');
    }

    const elExistingList = document.getElementById('existing-teams-list');
    if (elExistingList) {
        if (state.teamsWithPlayers && state.teamsWithPlayers.length > 0) {
            elExistingList.innerHTML = state.teamsWithPlayers.map(team => {
                const players = team.players.map(p => {
                    const avatar = p.image 
                        ? `<img src="${p.image}" style="width:18px; height:18px; border-radius:50%; object-fit:cover;">`
                        : '👤';
                    return `<span style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); padding:6px 12px; border-radius:20px; color:#ccc; font-size:13px; display:inline-flex; align-items:center; gap:5px;">${avatar} ${p.name}</span>`;
                }).join('');
                return `
                    <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.05); padding: 15px 20px; border-radius: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <h3 style="color: #00E5FF; font-size: 18px; font-weight: 800; margin: 0; text-transform: uppercase; letter-spacing: 1px;">
                                ${team.name} <span style="font-size: 12px; color: #aaa; font-weight: normal; text-transform: none; margin-left: 5px;">(${team.category})</span>
                            </h3>
                            <div style="display: flex; gap: 8px;">
                                <button onclick="startEditing(${team.id})" style="background: rgba(0, 229, 255, 0.1); border: 1px solid #00E5FF; color: #00E5FF; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: bold; cursor: pointer;">✏️ EDIT</button>
                                <button onclick="deleteTeam(${team.id}, '${team.name}')" style="background: rgba(255, 23, 68, 0.1); border: 1px solid #FF1744; color: #FF1744; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: bold; cursor: pointer;">🗑️ DELETE</button>
                            </div>
                        </div>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                            ${players}
                        </div>
                    </div>
                `;
            }).join('');
        } else if (state.allTeamsPlayers && Object.keys(state.allTeamsPlayers).length > 0) {
            const allTeamsMap = state.allTeamsPlayers || {};
            const teamNames = Object.keys(allTeamsMap);
            elExistingList.innerHTML = teamNames.map(name => {
                const players = allTeamsMap[name].map(p => 
                    `<span style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); padding:6px 12px; border-radius:20px; color:#ccc; font-size:13px; display:inline-flex; align-items:center; gap:5px;">👤 ${p}</span>`
                ).join('');
                return `
                    <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.05); padding: 15px 20px; border-radius: 8px;">
                        <h3 style="color: #00E5FF; font-size: 18px; font-weight: 800; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">${name}</h3>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                            ${players}
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            elExistingList.innerHTML = `<div style="color: #888; font-style: italic; text-align: center; margin-top: 50px;">No teams saved yet.</div>`;
        }
    }
}

window.addPlayerSingleTeam = function () {
    const name = els.singleTeamInput.value.trim();
    if (name) {
        state.singleTeamPlayers.push(name);
        els.singleTeamInput.value = "";
        saveState();
        renderLists();
    }
};

window.removePlayerSingle = function (index) {
    state.singleTeamPlayers.splice(index, 1);
    saveState();
    renderLists();
};

window.handleEnterSingle = function (e) {
    if (e.key === 'Enter') window.addPlayerSingleTeam();
};

socket.on('stateUpdated', (data) => {
    state = data;
    if (!state.singleTeamPlayers) state.singleTeamPlayers = [];
    renderLists();
});

socket.on('configUpdated', (data) => {
    config = data;
    if (els.teamCategory && config.category) els.teamCategory.value = config.category;
});

window.startEditing = function (teamId) {
    const team = state.teamsWithPlayers.find(t => t.id === teamId);
    if (!team) return;

    editingTeamId = team.id;
    els.singleTeamName.value = team.name;
    if (els.teamCategory) els.teamCategory.value = team.category || 'MAN';

    state.singleTeamPlayers = team.players.map(p => p.name);
    if (!state.playerImages) state.playerImages = {};
    team.players.forEach(p => {
        if (p.image) {
            state.playerImages[p.name] = p.image;
        }
    });

    document.getElementById('btn-cancel-edit').style.display = 'inline-block';
    document.getElementById('btn-save-single').innerText = 'UPDATE TEAM';
    document.getElementById('team-header-action').innerHTML = '<span>EDIT TEAM</span>';

    saveState();
    renderLists();
};

window.cancelEditing = function () {
    editingTeamId = null;
    els.singleTeamName.value = 'TEAM 1';
    state.singleTeamPlayers = [];
    state.playerImages = {};

    document.getElementById('btn-cancel-edit').style.display = 'none';
    document.getElementById('btn-save-single').innerText = 'SAVE TEAM TO DATABASE';
    document.getElementById('team-header-action').innerHTML = '<span>ADD NEW TEAM</span>';

    saveState();
    renderLists();
};

window.deleteTeam = async function (teamId, name) {
    if (!confirm(`Are you sure you want to delete the team "${name}" from the database?`)) return;

    try {
        const response = await fetch(`${backendUrl}/api/delete-team`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teamId })
        });

        const result = await response.json();
        if (result.success) {
            if (editingTeamId === teamId) {
                cancelEditing();
            }
            alert('Team deleted successfully!');
            const freshData = await fetch(`${backendUrl}/api/state`).then(r => r.json());
            if (freshData.state_data) {
                state = freshData.state_data;
                if (!state.singleTeamPlayers) state.singleTeamPlayers = [];
                if (!state.playerImages) state.playerImages = {};
            }
            renderLists();
        } else {
            throw new Error(result.error);
        }
    } catch (err) {
        console.error(err);
        alert(`Failed to delete team: ${err.message}`);
    }
};

window.saveSingleTeam = async function () {
    const btn = document.getElementById('btn-save-single');
    const originalText = btn ? btn.innerText : (editingTeamId ? "UPDATE TEAM" : "SAVE TEAM TO DATABASE");
    if (btn) btn.innerText = "SAVING...";

    const teamName = els.singleTeamName.value.trim() || "NEW TEAM";
    const category = els.teamCategory ? els.teamCategory.value : "MAN";
    
    try {
        const endpoint = editingTeamId ? '/api/update-team' : '/api/add-team';
        const body = { 
            teamName: teamName, 
            players: state.singleTeamPlayers,
            playerImages: state.playerImages,
            category: category
        };
        if (editingTeamId) {
            body.teamId = editingTeamId;
        }

        const response = await fetch(`${backendUrl}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        
        const result = await response.json();
        
        if (result.success) {
            if (btn) {
                btn.innerText = "✓ SAVED!";
                btn.style.background = "#4CAF50";
                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.style.background = "linear-gradient(135deg, var(--primary-accent), #0056b3)";
                }, 2000);
            } else {
                alert("Team Saved Successfully!");
            }
            
            // Clear the form after successful save
            editingTeamId = null;
            state.singleTeamPlayers = [];
            state.playerImages = {};
            if(els.singleTeamName) els.singleTeamName.value = "TEAM 1";
            
            document.getElementById('btn-cancel-edit').style.display = 'none';
            document.getElementById('btn-save-single').innerText = 'SAVE TEAM TO DATABASE';
            document.getElementById('team-header-action').innerHTML = '<span>ADD NEW TEAM</span>';

            // Sync the empty draft state to the server immediately
            socket.emit('updateState', state);
            
            // Re-fetch to get updated allTeamsPlayers, and broadcast to admin
            fetch(`${backendUrl}/api/state`)
                .then(res => res.json())
                .then(data => {
                    if(data.state_data && Object.keys(data.state_data).length > 0) state = data.state_data;
                    if(data.config_data && Object.keys(data.config_data).length > 0) config = data.config_data;
                    
                    if (!state.singleTeamPlayers) state.singleTeamPlayers = [];
                    if (!state.playerImages) state.playerImages = {};

                    renderLists();
                });
            
        } else {
            throw new Error(result.error);
        }
    } catch (e) {
        console.error(e);
        if (btn) {
            btn.innerText = "ERROR SAVING";
            setTimeout(() => {
                btn.innerText = originalText;
            }, 2000);
        }
        alert("Failed to save team to database!");
    }
};
