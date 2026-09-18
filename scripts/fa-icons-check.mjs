/**
 * 저장소가 쓰는 아이콘이 서브셋 목록 안에 있는지 대조한다.
 *
 * 동봉 Font Awesome 은 `scripts/fa-icons.json` 의 목록만 담은 서브셋이다. 목록에 없는
 * 아이콘을 레이아웃이나 컴포넌트가 쓰면 그 자리는 **빈 칸**이 된다 — 콘솔 오류도 404 도
 * 나지 않고, 화면만 봐서는 폰트 문제라는 것을 알 수 없다. 그래서 목록 밖 사용은 배포 전에
 * 여기서 잡는다.
 *
 * 검사 두 가지:
 *   1. 저장소 소스(레이아웃 JSON · TSX · editor-spec · seo-config 등)가 쓰는 아이콘 이름이
 *      모두 `scripts/fa-icons.json` 안에 있는가
 *   2. 레이아웃 편집기의 아이콘 선택기 목록(`editor-spec/controls.json` 의 `iconName.icons`)이
 *      `scripts/fa-icons.json` 과 같은 집합인가 (`scripts/fa-controls-sync.mjs --check`)
 *
 * 한 방향 검사인 점을 밝혀 둔다: 목록에는 저장소에 없는 이름도 들어 있다. 상단 메뉴 아이콘은
 * 사이트 DB(g7-easy-topmenu 항목)에 저장되고, 그 선택지 64종은 플러그인이 갖고 있다. 저장소만
 * 봐서는 확인할 수 없으므로 목록 쪽이 더 넓은 것은 정상이며, 여기서는 "쓰는데 목록에 없는"
 * 경우만 실패로 본다.
 *
 * 사용:
 *   node scripts/fa-icons-check.mjs [--list]
 *
 * `--list` 는 수집한 이름과 출처를 전부 출력한다(목록을 손볼 때 쓴다).
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const listMode = process.argv.includes('--list');

/** 아이콘 이름이 아니라 수식어·크기인 `fa-` 토큰 */
const MODIFIERS = new Set([
    'solid', 'regular', 'light', 'thin', 'duotone', 'brands', 'sharp', 'classic',
    'fw', 'ul', 'li', 'border', 'inverse', 'stack', 'stack-1x', 'stack-2x', 'layers',
    'pull-left', 'pull-right', 'sr-only', 'sr-only-focusable',
    'spin', 'spin-pulse', 'spin-reverse', 'pulse', 'beat', 'fade', 'beat-fade', 'flip', 'shake',
    'flip-horizontal', 'flip-vertical', 'flip-both', 'rotate-by',
    'rotate-90', 'rotate-180', 'rotate-270',
    '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl',
    '1x', '2x', '3x', '4x', '5x', '6x', '7x', '8x', '9x', '10x',
]);

/** 훑지 않는 경로 (테스트·빌드 산출물·의존성) */
const SKIP_DIRECTORIES = new Set(['node_modules', 'dist', 'coverage', '__tests__', 'tests', '.git']);
const SKIP_FILE_RE = /\.(test|spec)\.[jt]sx?$/;

/** 훑을 대상 */
const SCAN_TARGETS = ['layouts', 'src', 'extensions', 'editor-spec', 'lang', 'seo-config.json', 'routes.json', 'template.json', 'components.json'];

const found = new Map(); // 이름 → 출처 Set

/**
 * 수집한 아이콘 이름 하나를 기록합니다.
 *
 * @param {string} raw 원본 토큰 (`fa-` 접두사가 있을 수 있음)
 * @param {string} source `파일:설명` 형태의 출처
 * @returns {void}
 */
function record(raw, source) {
    if (typeof raw !== 'string') {
        return;
    }

    const token = raw.trim().replace(/^fa-/, '');

    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(token) || MODIFIERS.has(token)) {
        return;
    }

    const name = iconNameMap.get(token) ?? token;

    if (!found.has(name)) {
        found.set(name, new Set());
    }

    found.get(name).add(source);
}

/**
 * 디렉토리를 재귀로 훑어 파일 경로를 모읍니다.
 *
 * @param {string} target 저장소 기준 상대 경로
 * @returns {string[]} 파일 경로 목록
 */
function collectFiles(target) {
    const absolute = path.join(repoRoot, target);

    if (!fs.existsSync(absolute)) {
        return [];
    }

    if (fs.statSync(absolute).isFile()) {
        return [target];
    }

    const files = [];

    for (const entry of fs.readdirSync(absolute, { withFileTypes: true })) {
        if (entry.isDirectory()) {
            if (SKIP_DIRECTORIES.has(entry.name)) {
                continue;
            }

            files.push(...collectFiles(path.join(target, entry.name)));
            continue;
        }

        if (SKIP_FILE_RE.test(entry.name)) {
            continue;
        }

        files.push(path.join(target, entry.name));
    }

    return files;
}

// ── 이름 변환표: IconName enum 과 iconNameMap ────────────────────────────────
// 레이아웃은 Lucide 계열 이름('settings' · 'x')을 쓰기도 한다. Icon 컴포넌트가 iconNameMap 으로
// Font Awesome 이름으로 바꾸므로, 대조도 같은 변환을 거쳐야 실제로 그려지는 이름을 본다.
const iconTypesPath = path.join(repoRoot, 'src', 'components', 'basic', 'IconTypes.ts');
const iconTypesSource = fs.readFileSync(iconTypesPath, 'utf8');

const enumMembers = new Map();
for (const match of iconTypesSource.matchAll(/^\s+([A-Za-z0-9_]+)\s*=\s*'(fa-[a-z0-9-]+)',/gm)) {
    enumMembers.set(match[1], match[2].replace(/^fa-/, ''));
}

const iconNameMap = new Map();
for (const match of iconTypesSource.matchAll(/^\s+'([^']+)':\s*IconName\.([A-Za-z0-9_]+),/gm)) {
    const target = enumMembers.get(match[2]);

    if (target) {
        iconNameMap.set(match[1], target);
    }
}

if (enumMembers.size === 0 || iconNameMap.size === 0) {
    console.error('[fa-icons-check] IconTypes.ts 에서 IconName / iconNameMap 을 읽지 못했습니다. 파일 형식이 바뀌었는지 확인하세요.');
    process.exit(1);
}

// ── 레이아웃·설정 JSON ──────────────────────────────────────────────────────
/**
 * 표현식(`{{ … ? 'a' : 'b' }}`) 안에서 **결과로 쓰이는** 따옴표 리터럴만 모읍니다.
 *
 * 값 전체를 훑으면 비교 대상까지 걸린다 —
 * `{{notification.type === 'order' ? 'shopping-cart' : … }}` 의 `'order'` 는 알림 종류이지
 * 아이콘 이름이 아니다. 그런 토큰이 섞이면 목록에 없는 이름으로 잡혀 대조가 거짓으로 실패하고,
 * 그것을 넘기려고 목록에 넣으면 쓰지도 않는 글리프가 서브셋에 들어간다. 그래서 `?` · `:` · `??`
 * **바로 뒤**에 오는 리터럴, 즉 실제로 아이콘 이름이 되는 자리만 본다.
 *
 * @param {string} value 속성 값
 * @param {string} source 출처
 * @returns {void}
 */
function recordExpressionLiterals(value, source) {
    if (!value.includes('{{')) {
        record(value, source);

        return;
    }

    for (const match of value.matchAll(/(?:\?\??|:)\s*'([a-z0-9-]+)'/g)) {
        record(match[1], `${source} (표현식)`);
    }
}

/**
 * JSON 값을 훑으며 아이콘 이름을 모읍니다.
 *
 * @param {unknown} node JSON 노드
 * @param {string} file 파일 경로
 * @returns {void}
 */
function walkJson(node, file) {
    if (Array.isArray(node)) {
        for (const item of node) {
            walkJson(item, file);
        }

        return;
    }

    if (!node || typeof node !== 'object') {
        return;
    }

    const props = node.props;

    if (props && typeof props === 'object') {
        if (node.name === 'Icon' && typeof props.name === 'string') {
            recordExpressionLiterals(props.name, `${file} Icon props.name`);
        }

        for (const key of ['icon', 'iconName', 'leftIcon', 'rightIcon', 'prefixIcon', 'suffixIcon']) {
            if (typeof props[key] === 'string') {
                recordExpressionLiterals(props[key], `${file} props.${key}`);
            }
        }
    }

    // editor-spec 팔레트 등 props 밖에 놓인 아이콘 표기
    for (const key of ['icon', 'iconName']) {
        if (typeof node[key] === 'string' && node[key].startsWith('fa-')) {
            record(node[key], `${file} ${key}`);
        }
    }

    for (const value of Object.values(node)) {
        walkJson(value, file);
    }
}

// ── TSX / TS ────────────────────────────────────────────────────────────────
/**
 * 소스 파일에서 아이콘 이름을 모읍니다.
 *
 * @param {string} file 파일 경로
 * @param {string} source 파일 내용
 * @returns {void}
 */
function walkSource(file, source) {
    for (const match of source.matchAll(/<Icon\b[^>]*?\bname=(?:"([^"]+)"|\{'([^']+)'\})/g)) {
        record(match[1] ?? match[2], `${file} <Icon name>`);
    }

    // IconName.X 참조 (enum 선언 자체는 제외 — 표는 쓰임새가 아니다)
    if (path.resolve(repoRoot, file) !== iconTypesPath) {
        for (const match of source.matchAll(/\bIconName\.([A-Za-z0-9_]+)\b/g)) {
            const target = enumMembers.get(match[1]);

            if (target) {
                record(target, `${file} IconName.${match[1]}`);
            }
        }

        for (const match of source.matchAll(/\bicon:\s*'([a-z0-9-]+)'/g)) {
            record(match[1], `${file} icon: 리터럴`);
        }

        for (const match of source.matchAll(/(['"`][^'"`]*?)\bfa-([a-z0-9-]+)/g)) {
            record(match[2], `${file} fa- 클래스`);
        }
    }
}

for (const target of SCAN_TARGETS) {
    for (const file of collectFiles(target)) {
        const absolute = path.join(repoRoot, file);
        const content = fs.readFileSync(absolute, 'utf8');

        if (file.endsWith('.json')) {
            // 선택기 목록은 이 파일 자체가 대조 대상이라 사용처로 세지 않는다
            if (path.resolve(absolute) === path.join(repoRoot, 'editor-spec', 'controls.json')) {
                const parsed = JSON.parse(content);

                delete parsed.iconName;
                walkJson(parsed, file);
                continue;
            }

            walkJson(JSON.parse(content), file);
            continue;
        }

        if (/\.[jt]sx?$/.test(file)) {
            walkSource(file, content);
        }
    }
}

// ── 대조 ────────────────────────────────────────────────────────────────────
const manifest = JSON.parse(fs.readFileSync(path.join(scriptDir, 'fa-icons.json'), 'utf8'));
const allowed = new Set(Object.keys(manifest.icons));

if (listMode) {
    for (const name of [...found.keys()].sort()) {
        const mark = allowed.has(name) ? ' ' : '!';
        console.log(`${mark} ${name}\t${[...found.get(name)].slice(0, 3).join(' | ')}`);
    }
    console.log(`— 수집 ${found.size}종 / 목록 ${allowed.size}종`);
}

const missing = [...found.keys()].filter((name) => !allowed.has(name)).sort();
let failed = false;

if (missing.length) {
    failed = true;
    console.error(`[fa-icons-check] 목록(scripts/fa-icons.json)에 없는 아이콘을 ${missing.length}종 씁니다:`);
    for (const name of missing) {
        console.error(`  - ${name}`);
        for (const source of [...found.get(name)].slice(0, 4)) {
            console.error(`      ${source}`);
        }
    }
    console.error('  서브셋에 없으므로 화면에서 빈 칸이 됩니다. scripts/fa-icons.json 에 추가한 뒤');
    console.error('  README 의 「아이콘 추가 절차」대로 서브셋과 선택기를 다시 만드세요.');
} else {
    console.log(`[fa-icons-check] 저장소 사용 ${found.size}종 — 모두 목록(${allowed.size}종) 안에 있습니다.`);
}

// 선택기 목록 대조는 전용 스크립트에 맡긴다 (생성과 검사가 같은 코드를 쓰도록)
try {
    execFileSync(process.execPath, [path.join(scriptDir, 'fa-controls-sync.mjs'), '--check'], {
        stdio: 'inherit',
    });
} catch {
    failed = true;
}

process.exit(failed ? 1 : 0);
