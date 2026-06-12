const fs = require('fs');

let lines = fs.readFileSync('d:/box_cricket/admin.js', 'utf8').split('\n');

// Find the index of the second "const socket = io('http://localhost:3000');"
let firstFound = false;
let startIndex = 0;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("const socket = io('http://localhost:3000');")) {
        if (!firstFound) {
            firstFound = true;
        } else {
            // Second time found, this is the start of the actual file
            startIndex = i;
            break;
        }
    }
}

if (startIndex > 0) {
    lines = lines.slice(startIndex);
    fs.writeFileSync('d:/box_cricket/admin.js', lines.join('\n'));
    console.log('Successfully trimmed garbage header!');
} else {
    console.log('Could not find duplicate header');
}
