const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));

let patchedCount = 0;

files.forEach(file => {
    const fullPath = path.join(pagesDir, file);
    let content = fs.readFileSync(fullPath, 'utf8');

    // If the file uses AuthContext but doesn't import it
    if (content.includes('AuthContext') && !content.includes('import AuthContext') && !content.includes('import { AuthContext }')) {
        // Find the last import statement
        const importMatches = [...content.matchAll(/^import .*?;?\s*$/gm)];
        if (importMatches.length > 0) {
            const lastImport = importMatches[importMatches.length - 1];
            const insertIndex = lastImport.index + lastImport[0].length;
            const insertStr = `\nimport AuthContext from '../context/AuthContext';`;
            content = content.slice(0, insertIndex) + insertStr + content.slice(insertIndex);
            fs.writeFileSync(fullPath, content, 'utf8');
            console.log(`Patched missing AuthContext import in ${file}`);
            patchedCount++;
        }
    }
});

console.log(`Finished patching. Total files fixed: ${patchedCount}`);
