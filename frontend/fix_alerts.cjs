const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\LENOVO\\Desktop\\Taxi-new-ui\\frontend\\src\\pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

const toastImport = `import { useToast } from '../context/ToastContext';`;
const toastHook = `    const toast = useToast();`;

let count = 0;

files.forEach(file => {
    const fullPath = path.join(dir, file);
    let content = fs.readFileSync(fullPath, 'utf8');

    const originalContent = content;

    // 1. Clean up the injected powershell script blocks
    content = content.replace(/[ \t]*param\(\$m\)\r?\n[ \t]*\$m\.Value \+ \$toastImport \+ "`n"[ \t]*\r?\n/g, '');
    content = content.replace(/[ \t]*param\(\$m\)\r?\n[ \t]*\$m\.Value \+ "`n" \+ \$toastHook[ \t]*\r?\n/g, '');

    // 2. Add import if not exists
    if (!content.includes('useToast')) {
        // Find last import
        const imports = content.match(/^import .*$/gm);
        if (imports && imports.length > 0) {
            const lastImport = imports[imports.length - 1];
            content = content.replace(lastImport, lastImport + '\n' + toastImport);
        } else {
            content = toastImport + '\n' + content;
        }
    }

    // 3. Add hook inside the component
    if (!content.includes('const toast = useToast();')) {
        // Match function Component() { or const Component = () => {
        content = content.replace(/(export default function \w+\([^)]*\)\s*\{|const \w+\s*=\s*\([^)]*\)\s*=>\s*\{|function \w+\([^)]*\)\s*\{)/, `$1\n${toastHook}`);
    }

    // 4. Replace alert(...) with toast(...) and toast(..., 'error'/'warning')
    content = content.replace(/alert\((['"`])([^'"`]+)\1\)/g, (match, quote, msg) => {
        const lower = msg.toLowerCase();
        if (lower.includes('fail') || lower.includes('error') || lower.includes('not found') || lower.includes('invalid') || lower.includes('could not')) {
            return `toast(${quote}${msg}${quote}, 'error')`;
        } else if (lower.includes('warn') || lower.includes('please enter') || lower.includes('required')) {
            return `toast(${quote}${msg}${quote}, 'warning')`;
        } else {
            return `toast(${quote}${msg}${quote})`;
        }
    });

    // Also handle alert(variable) or alert(`msg ${var}`)
    content = content.replace(/alert\(([^)]+)\)/g, (match, inner) => {
        // if it already starts with toast, ignore
        if (inner.startsWith('toast')) return match;

        const lower = inner.toLowerCase();
        if (lower.includes('fail') || lower.includes('error') || lower.includes('message')) {
            return `toast(${inner}, 'error')`;
        } else if (lower.includes('success')) {
            return `toast(${inner})`;
        } else {
            // Fallback default error for variables just in case
            if (inner.includes('msg') || inner.includes('message')) {
                return `toast(${inner}, 'error')`;
            }
            return `toast(${inner})`;
        }
    });


    if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Fixed:', file);
        count++;
    }
});

console.log(`Processed ${count} files.`);
