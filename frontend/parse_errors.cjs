const fs = require('fs');
const data = JSON.parse(fs.readFileSync('errors.json', 'utf16le').replace(/^\uFEFF/, ''));
let count = 0;
data.forEach(file => {
    const fatalOrParse = file.messages.filter(m => m.fatal || m.message.includes('Parsing error') || m.message.includes('Unexpected token') || m.ruleId === null);
    if (fatalOrParse.length > 0) {
        console.log(`\n--- ${file.filePath} ---`);
        fatalOrParse.forEach(m => {
            console.log(`Line ${m.line}:${m.column} - ${m.message}`);
        });
        count++;
    }
});
console.log(`\nTotal files with parse errors: ${count}`);
