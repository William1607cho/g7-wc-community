/**
 * 레이아웃 편집기의 아이콘 선택기 목록을 `scripts/fa-icons.json` 에서 다시 만든다.
 *
 * `editor-spec/controls.json` 의 `iconName.icons` 는 편집기가 아이콘 선택기에 뿌리는 목록이다.
 * 동봉 폰트를 서브셋한 뒤에도 이 목록이 Font Awesome 전체(1,390종)로 남아 있으면, 편집자가
 * 고른 아이콘이 화면에서 빈 칸으로 나온다 — 고를 수는 있는데 뜨지는 않는 상태가 되고,
 * 원인이 폰트에 있다는 것은 화면만 봐서는 알 수 없다. 그래서 선택기와 서브셋은 **한 원본**
 * (`scripts/fa-icons.json`)에서 함께 만든다.
 *
 * 항목 형태는 기존 파일의 규칙을 그대로 따른다(전체 1,390종에서 재현 검증함):
 *   keywords = 이름을 `-` 로 나눈 뒤 두 글자 미만 조각을 버린 것,
 *              남은 조각이 2개 미만이면 keywords 를 아예 넣지 않는다.
 * 목록은 이름 오름차순이다.
 *
 * 사용:
 *   node scripts/fa-controls-sync.mjs [--check]
 *
 * `--check` 는 쓰지 않고 대조만 한다(다르면 종료 코드 1). `scripts/fa-icons-check.mjs` 가
 * 이 모드를 쓴다.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const iconsJsonPath = path.join(scriptDir, 'fa-icons.json');
const controlsPath = path.join(repoRoot, 'editor-spec', 'controls.json');

const checkOnly = process.argv.includes('--check');

/**
 * 아이콘 이름에서 선택기 검색어를 만듭니다.
 *
 * @param {string} name 아이콘 이름
 * @returns {string[]|null} 검색어 목록, 넣지 않을 때는 null
 */
function keywordsFor(name) {
    const parts = name.split('-').filter((part) => part.length >= 2);

    return parts.length >= 2 ? parts : null;
}

const icons = JSON.parse(fs.readFileSync(iconsJsonPath, 'utf8')).icons;
const names = Object.keys(icons).sort();

const entries = names.map((name) => {
    const keywords = keywordsFor(name);

    return keywords ? { value: name, keywords } : { value: name };
});

const controls = JSON.parse(fs.readFileSync(controlsPath, 'utf8'));

if (!controls.iconName || !Array.isArray(controls.iconName.icons)) {
    console.error('[fa-controls-sync] editor-spec/controls.json 에 iconName.icons 가 없습니다.');
    process.exit(1);
}

const before = controls.iconName.icons;
const same = JSON.stringify(before) === JSON.stringify(entries);

if (checkOnly) {
    if (same) {
        console.log(`[fa-controls-sync] 선택기 목록 일치 (${entries.length}종)`);
        process.exit(0);
    }

    const beforeNames = new Set(before.map((entry) => entry.value));
    const afterNames = new Set(names);
    const extra = [...beforeNames].filter((name) => !afterNames.has(name));
    const missing = names.filter((name) => !beforeNames.has(name));

    console.error('[fa-controls-sync] 선택기 목록이 scripts/fa-icons.json 과 다릅니다.');
    console.error(`  선택기에만 있음 ${extra.length}개${extra.length ? `: ${extra.slice(0, 10).join(', ')}${extra.length > 10 ? ' …' : ''}` : ''}`);
    console.error(`  목록에만 있음  ${missing.length}개${missing.length ? `: ${missing.slice(0, 10).join(', ')}${missing.length > 10 ? ' …' : ''}` : ''}`);
    if (!extra.length && !missing.length) {
        console.error('  이름 집합은 같고 순서 또는 검색어가 다릅니다.');
    }
    console.error('  `node scripts/fa-controls-sync.mjs` 로 다시 만드세요.');
    process.exit(1);
}

if (same) {
    console.log(`[fa-controls-sync] 변경 없음 (${entries.length}종)`);
    process.exit(0);
}

controls.iconName.icons = entries;

// 원본 파일의 들여쓰기(공백 2칸)와 끝 개행을 그대로 유지한다
const original = fs.readFileSync(controlsPath, 'utf8');
const trailingNewline = original.endsWith('\n') ? '\n' : '';
fs.writeFileSync(controlsPath, `${JSON.stringify(controls, null, 2)}${trailingNewline}`);

console.log(`[fa-controls-sync] editor-spec/controls.json 갱신: ${before.length} → ${entries.length}종`);
