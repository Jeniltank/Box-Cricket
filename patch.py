import os
import re

file_path = r'd:\box_cricket\admin.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add socket.io connection at the top
if 'const socket = io(' not in content:
    content = "const socket = io('http://localhost:3000');\n" + content

# 2. Initialization: replace localStorage.getItem with a fetch call wrapping the initial load
# Currently lines 57-75:
# const storedState = localStorage.getItem('boxcricket_state');
# ...
# const storedConfig = localStorage.getItem('boxcricket_config');
# if (storedConfig) config = JSON.parse(storedConfig);

# We need to defer the UI update (els.inpTournament.value = ...; populatePlayerDropdowns(); updateAdminUI();) until fetch is done.
# The easiest way is to wrap everything from `els.inpTournament.value = config.tournament;` downwards in a function `initUI()`.
# Wait, `admin.js` just executes sequentially. If we fetch asynchronously, the rest of the script will execute with default state.
# That's fine because `updateAdminUI()` can be called again after fetch.

fetch_block = """
fetch('http://localhost:3000/api/state')
    .then(res => res.json())
    .then(data => {
        if(data.state_data && Object.keys(data.state_data).length > 0) {
            state = data.state_data;
            if (!state.allBatsmen) {
                state.allBatsmen = [
                    { id: state.batsmen[0].id, name: state.batsmen[0].name, runs: state.batsmen[0].runs, balls: state.batsmen[0].balls, fours: state.batsmen[0].fours, sixes: state.batsmen[0].sixes, status: "not out" },
                    { id: state.batsmen[1].id, name: state.batsmen[1].name, runs: state.batsmen[1].runs, balls: state.batsmen[1].balls, fours: state.batsmen[1].fours, sixes: state.batsmen[1].sixes, status: "not out" }
                ];
            }
            if (state.bowler.id === undefined) {
                state.bowler.id = 0;
            }
            if (!state.allBowlers) {
                state.allBowlers = [{ ...state.bowler }];
            }
        }
        if(data.config_data && Object.keys(data.config_data).length > 0) {
            config = data.config_data;
        }
        
        els.inpTournament.value = config.tournament;
        els.inpTeamA.value = config.teamA;
        els.inpTeamB.value = config.teamB;
        els.inpTarget.value = state.target;
        els.inpInnings.value = config.innings;
        els.inpTotalOvers.value = config.totalOvers;
        
        populatePlayerDropdowns();
        updateAdminUI();
    });

socket.on('configUpdated', (data) => {
    config = data;
    els.inpTournament.value = config.tournament;
    els.inpTeamA.value = config.teamA;
    els.inpTeamB.value = config.teamB;
    els.inpInnings.value = config.innings;
    els.inpTotalOvers.value = config.totalOvers;
    updateAdminUI();
});
"""

# Replace the localStorage block for initialization
content = re.sub(
    r"// Try to load existing.*?if \(storedConfig\) config = JSON\.parse\(storedConfig\);",
    fetch_block,
    content,
    flags=re.DOTALL
)

# 3. broadcastUpdate() -> socket.emit
content = re.sub(
    r"localStorage\.setItem\('boxcricket_state', JSON\.stringify\(state\)\);.*?localStorage\.setItem\('boxcricket_ping', Date\.now\(\)\);",
    r"socket.emit('updateState', state);\n    socket.emit('updateConfig', config);",
    content,
    flags=re.DOTALL
)

# 4. localStorage.setItem('boxcricket_event', type + '_' + Date.now());
content = content.replace(
    "localStorage.setItem('boxcricket_event', type + '_' + Date.now());",
    "socket.emit('triggerEvent', type);"
)

content = content.replace(
    "localStorage.setItem('boxcricket_over_summary_data', JSON.stringify({",
    "// Data is available via state object\n        // localStorage.setItem('boxcricket_over_summary_data', JSON.stringify({"
)

content = re.sub(
    r"localStorage\.setItem\('boxcricket_([a-z_]+)', Date\.now\(\)\);",
    r"socket.emit('triggerEvent', '\1'.toUpperCase());",
    content
)

# Remove the storage listener in admin.js
content = re.sub(
    r"window\.addEventListener\('storage', \(e\) => \{.*?\}\);",
    "",
    content,
    flags=re.DOTALL
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch applied.")
