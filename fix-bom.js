const fs = require('fs');
const { execSync } = require('child_process');

const files = execSync('dir /s /b package.json', { encoding: 'utf8' })
  .trim().split('\r\n')
  .filter(f => !f.includes('node_modules'));

files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  if (c.charCodeAt(0) === 0xFEFF) {
    fs.writeFileSync(f, c.slice(1), 'utf8');
    console.log('fixed:', f);
  }
});
console.log('done');