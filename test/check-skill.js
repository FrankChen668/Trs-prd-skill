/**
 * SKILL.md 结构自检 —— `npm test`
 *
 * 2026-09-21 重写。旧版是为手搓 V4.0（1347 行 / 8 个 H1）写的，
 * 投影改为脚本生成后断言全部失效；且**旧版不验 frontmatter** ——
 * 一个没有 frontmatter 的 SKILL.md 不可被 skill 加载器识别，
 * 却是旧门禁永久看不见的盲区（第三方审查 N4）。新版第一条即补此检查。
 *
 * 任一检查失败即退出码 1，用于 CI 在 push / publish 前拦截。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SKILL = path.join(ROOT, 'SKILL.md');
// SSOT 侧回灌文件的实际落点（用于确认回灌内容在源头存在，而非只在投影里）
const SKILLS_REF = 'C:/Users/1/.workbuddy-ai/skills/trs-prd-writer';

let failed = 0;
function check(label, ok, detail) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`);
  if (!ok) failed++;
}

const text = fs.readFileSync(SKILL, 'utf8');
const lines = text.split('\n');

// 1. 可加载性（旧门禁缺失，第三方审查 N4）
check('首行为 YAML frontmatter（否则不可被加载）', lines[0].trim() === '---');
const fmEnd = lines.indexOf('---', 1);
check('frontmatter 闭合', fmEnd > 0, fmEnd > 0 ? `结束于第 ${fmEnd + 1} 行` : '未闭合');
const fm = fmEnd > 0 ? lines.slice(1, fmEnd).join('\n') : '';
check('frontmatter 含 name', /^name:\s*\S/m.test(fm));
check('frontmatter 含 description', /^description:/m.test(fm));
check('frontmatter 含 version', /^version:/m.test(fm));

// 2. 投影身份声明（防止投影被误当权威）
check('声明为发布投影、非权威', text.includes('发布投影，不是权威'));
check('声明禁止手改（防二次分叉）', text.includes('禁止手改'));
check('指向 SSOT 本地分层体系', text.includes('trs-spec-style') && text.includes('trs-evidence'));

// 3. 体量（脚本生成版，区间合理即可）
check('行数 200–2000', lines.length >= 200 && lines.length <= 2000, `${lines.length} 行`);

// 4. 关键规范锚点（回灌后必须常驻，防再次丢失）
const anchors = {
  '交付模式双视图 INTERNAL/CLIENT-FINAL': text.includes('INTERNAL') && text.includes('CLIENT-FINAL'),
  '减法清单': text.includes('减法清单'),
  '减法清单含「为什么有害」列': text.includes('为什么有害'),
  '新开发功能五条': text.includes('新开发功能五条'),
  '新开发五条含「反例（禁）」列': text.includes('反例（禁）'),
  '数据项 12 列': text.includes('报错文案') && text.includes('变更记录'),
  '字段类型中文命名': text.includes('长文本') && text.includes('下拉单选'),
  '取证口径 · 死组件三判据': text.includes('死组件'),
};

// 输出目标三选一 + 写作纪律（L1/L2/L4 回灌落点，防再次丢失）
const requiredRefs = [
  ['reference/output-targets.md', '输出目标三选一'],
  ['reference/writing-discipline.md', '写作纪律（Iron Law / Bottom Line）'],
];
requiredRefs.forEach(([rel, label]) => {
  const exists = fs.existsSync(path.join(SKILLS_REF, rel));
  check(`回灌文件存在：${label}`, exists, rel);
  check(`主干引用：${label}`, text.includes(label) || text.includes(rel.split('/').pop()));
});
Object.entries(anchors).forEach(([k, ok]) => check(`锚点：${k}`, ok));

// 5. 矛盾/卫生：旧版本戳不得残留
check('无 v1.2 版本戳残留', !text.includes('**Skill版本：** 1.2'));
check('无自指权威声明残留', !text.includes('本文件为唯一权威'));

// 6. 结构卫生
const emptyH2 = lines.filter((l) => /^#{2,6}\s*$/.test(l)).length;
check('无空标题', emptyH2 === 0, `${emptyH2} 处`);

// 7. 引用文件存在性
['reference/document-structure.md', 'reference/templates.md', 'reference/examples.md',
 'reference/prototype-driven.md', 'reference/requirements-discovery.md',
 'reference/spec.md', 'reference/output-targets.md', 'reference/writing-discipline.md',
 'testing/pressure-scenarios.md', 'CHANGELOG.md', 'README.md',
].forEach((rel) => check(`发布包文件存在：${rel}`, fs.existsSync(path.join(ROOT, rel))));

console.log(failed === 0 ? '\n全部通过' : `\n${failed} 项失败`);
process.exit(failed === 0 ? 0 : 1);
