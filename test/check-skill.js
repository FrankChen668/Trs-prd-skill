// npm test: package integrity only; generated document quality needs actual trials.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
const skill = read(path.join(root, 'SKILL.md'));
assert.match(skill, /^---\nname: trs-prd-writer\ndescription: .+\n---\n/);
const current = ['SKILL.md', ...fs.readdirSync(path.join(root, 'references')).map(f => `references/${f}`)];
let links = 0;
for (const file of current) {
  const text = read(path.join(root, file));
  assert.notEqual(text.charCodeAt(0), 0xfeff, `${file}: BOM`);
  assert.doesNotMatch(text, /[A-Z]:[\\/]|aicoding|workspace\/project\.json|\bmp-/, `${file}: project dependency`);
  for (const match of text.matchAll(/\]\(([^)]+)\)/g)) {
    if (/^\w+:\/\//.test(match[1])) continue;
    const [relative, anchor] = match[1].split('#');
    const target = relative ? path.resolve(root, path.dirname(file), relative) : path.join(root, file);
    assert.ok(target.startsWith(root + path.sep), `${file}: link leaves package`);
    assert.ok(fs.existsSync(target), `${file}: missing ${match[1]}`);
    if (anchor) {
      const headings = [...read(target).matchAll(/^#{1,6}\s+(.+)$/gm)].map(m => m[1].toLowerCase().replace(/[^\p{L}\p{N}_\-\s]/gu, '').replace(/ /g, '-'));
      assert.ok(headings.includes(anchor), `${file}: missing anchor ${anchor}`);
    }
    links++;
  }
}
const evals = JSON.parse(read(path.join(root, 'evals/evals.json'))).evals;
assert.ok(evals.length >= 3);
for (const item of evals) {
  assert.ok(item.prompt && item.assertions.length, `eval ${item.id}: empty task`);
  for (const file of item.files) {
    const target = path.resolve(root, file);
    assert.ok(target.startsWith(root + path.sep) && fs.existsSync(target), `eval ${item.id}: missing local input`);
  }
}
console.log(`PASS: ${current.length} instruction files, ${links} local links, ${evals.length} cases; independent package`);
