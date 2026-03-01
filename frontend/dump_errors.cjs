const fs = require('fs');
const data = JSON.parse(fs.readFileSync('current_errors.json', 'utf16le').replace(/^\uFEFF/, ''));

let report = '';
data.forEach(file => {
    const parseMsgs = file.messages.filter(m => m.fatal || (m.message && m.message.includes('Parsing error')));
    if (parseMsgs.length > 0) {
        report += `### ${file.filePath.split('\\').pop()}\n`;
        parseMsgs.forEach(m => {
            report += `Line ${m.line}: ${m.message}\n`;
        });

        // Let's print the 5 lines around the error to give context
        const lines = fs.readFileSync(file.filePath, 'utf8').split('\n');
        parseMsgs.forEach(m => {
            const l = m.line - 1;
            report += `Context around line ${m.line}:\n`;
            for (let i = Math.max(0, l - 5); i <= Math.min(lines.length - 1, l + 5); i++) {
                report += `${i + 1}: ${lines[i]}\n`;
            }
            report += '\n';
        });
        report += '---\n';
    }
});

fs.writeFileSync('current_context.txt', report, 'utf8');
console.log('Done writing current_context.txt');
