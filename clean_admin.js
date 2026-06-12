const fs = require('fs');

let content = fs.readFileSync('d:/box_cricket/admin.js', 'utf8');

// The duplicate string starts from "const socket = io('http://localhost:3000');"
// and ends at "// Dropdown setup"
const duplicateStr = "const socket = io('http://localhost:3000');\\n// admin.js - Master State Manager\\n";

// I'll just restore the backup if there is one? No, there isn't.
// Let's use regex to remove the duplicated chunk

// Actually, let me just find the first "const socket = io" and the second "const socket = io"
const parts = content.split("const socket = io('http://localhost:3000');");
if (parts.length > 2) {
    // It's duplicated!
    // parts[0] is empty or whitespace
    // parts[1] is the correct top of the file
    // parts[2] is the mistakenly pasted top of the file
    
    // We want to keep parts[0] + "const socket = io..." + parts[1]
    // But what's after parts[2]? Let's find "// Dropdown setup" in parts[2]
    
    let badChunk = parts[2];
    let goodTail = badChunk.substring(badChunk.indexOf('window.handleTeamSelectionChange'));
    
    let newContent = parts[0] + "const socket = io('http://localhost:3000');" + parts[1] + goodTail;
    fs.writeFileSync('d:/box_cricket/admin.js', newContent);
    console.log("Fixed duplicate!");
} else {
    console.log("No duplicate found, maybe the structure is different");
}
