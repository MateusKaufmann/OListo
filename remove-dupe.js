const fs = require('fs');
const path = 'views/dashboard.ejs';
const lines = fs.readFileSync(path, 'utf8').split('\n');
const start = lines.findIndex(l => l.includes('_DUMMY_TO_REMOVE_'));
if (start === -1) {
  console.log('Marker not found');
  process.exit(1);
}
let end = -1;
for (let i = start + 1; i < lines.length; i++) {
  const t = lines[i].trim();
  if (t === '</div>' && i + 1 < lines.length && lines[i + 1].trim() === '' && i + 2 < lines.length && lines[i + 2].trim() === '</div>' && lines[i + 2].indexOf('        </div>') >= 0) {
    end = i;
    break;
  }
}
if (end === -1) {
  console.log('End not found. Searching for main-view-slider close...');
  for (let i = lines.length - 1; i > start; i--) {
    if (lines[i].indexOf('        </div>') >= 0 && lines[i].trim() === '</div>') {
      end = i - 2;
      break;
    }
  }
}
if (end === -1) {
  console.log('End not found');
  process.exit(1);
}
const out = lines.slice(0, start).concat(lines.slice(end + 1));
fs.writeFileSync(path, out.join('\n'));
console.log('Removed lines', start + 1, 'to', end + 1);
