
const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        if (file === 'node_modules' || file === '.next' || file === '.git' || file === '.vercel' || file === 'public') return;
        file = path.resolve(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            // only process some extensions
            if (/\.(ts|tsx|md|json|js)$/i.test(file)) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('c:/Users/Jakub/malenaklejki');
let changed = 0;
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('-')) {
        content = content.replace(/-/g, '-');
        fs.writeFileSync(file, content, 'utf8');
        console.log('Modified: ' + file);
        changed++;
    }
});
console.log('Total files modified: ' + changed);
