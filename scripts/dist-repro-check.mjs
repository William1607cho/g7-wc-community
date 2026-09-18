/**
 * 커밋된 `dist/` 가 이 소스에서 다시 나오는지 확인한다.
 *
 * 이 저장소는 `dist/` 를 커밋한다. 동봉 폰트(서브셋 Font Awesome · Pretendard)가 빌드로는
 * 재현되지 않는데, 템플릿 업데이트는 활성 디렉토리를 통째로 갈아끼우기 때문이다 —
 * zip 에 빠져 있으면 사이트에서 폰트가 사라진다. 그 대신 커밋된 산출물이 정말 이 소스에서
 * 나온 것인지 아무도 모르는 상태가 되므로, 여기서 임시 경로에 다시 빌드해 해시로 대조한다.
 *
 * 대조 범위:
 *   - 빌드 산출물(`dist/` 에서 `vendor/` 를 뺀 전부): 재빌드 결과와 sha256 이 같아야 한다.
 *   - 동봉 자산(`dist/vendor/`): 빌드가 만들지 않으므로 `scripts/vendor-manifest.json` 에
 *     적어 둔 sha256 과 대조한다.
 *   - `.map` 은 대조에서 뺀다. 배포 빌드는 `G7_BUILD_SOURCEMAP=0` 이라 애초에 만들지 않는다.
 *
 * 재빌드는 이 스크립트를 **돌리고 있는 Node 자체**로 한다. 그래서 이 스크립트는 릴리스 빌드와
 * 같은 컨테이너(같은 이미지 다이제스트)에서 돌려야 의미가 있다 — README 의 절차를 따르면
 * 그렇게 된다. 확인용으로 실행 중인 Node 버전을 함께 출력한다.
 *
 * 사용:
 *   node scripts/dist-repro-check.mjs
 *
 * 네트워크가 필요하다(`npm ci`). 종료 코드 0 = 일치.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import process from 'node:process';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const distDir = path.join(repoRoot, 'dist');

/** 재빌드 소스에서 뺄 경로 (의존성·산출물·저장소 메타) */
const EXCLUDED = new Set(['node_modules', 'dist', 'coverage', '.git']);

/**
 * 파일의 sha256 을 돌려줍니다.
 *
 * @param {string} filePath 파일 경로
 * @returns {string} 해시 문자열
 */
function digest(filePath) {
    return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

/**
 * 디렉토리 아래 파일을 상대 경로 → sha256 으로 모읍니다.
 *
 * @param {string} root 기준 디렉토리
 * @param {(relative: string) => boolean} accept 포함 여부 판정
 * @returns {Map<string, string>} 상대 경로 → 해시
 */
function hashTree(root, accept) {
    const result = new Map();

    /**
     * @param {string} relative 상대 경로
     * @returns {void}
     */
    function walk(relative) {
        const absolute = path.join(root, relative);

        for (const entry of fs.readdirSync(absolute, { withFileTypes: true })) {
            const next = relative ? path.join(relative, entry.name) : entry.name;

            if (entry.isDirectory()) {
                walk(next);
                continue;
            }

            if (accept(next)) {
                result.set(next, digest(path.join(root, next)));
            }
        }
    }

    if (fs.existsSync(root)) {
        walk('');
    }

    return result;
}

/**
 * 재빌드용 소스를 임시 경로에 복사합니다.
 *
 * @param {string} destination 대상 디렉토리
 * @returns {void}
 */
function copySource(destination) {
    for (const entry of fs.readdirSync(repoRoot, { withFileTypes: true })) {
        if (EXCLUDED.has(entry.name)) {
            continue;
        }

        fs.cpSync(path.join(repoRoot, entry.name), path.join(destination, entry.name), {
            recursive: true,
            dereference: false,
        });
    }
}

const isBuildOutput = (relative) =>
    !relative.split(path.sep).includes('vendor') && !relative.endsWith('.map');

console.log(`[dist-repro] Node ${process.version} (릴리스 빌드와 같은 컨테이너에서 돌려야 합니다)`);

if (!fs.existsSync(distDir)) {
    console.error('[dist-repro] dist/ 가 없습니다. 먼저 빌드해 커밋하세요.');
    process.exit(1);
}

const committed = hashTree(distDir, isBuildOutput);
const strayMaps = hashTree(distDir, (relative) => relative.endsWith('.map'));

if (strayMaps.size) {
    console.error(`[dist-repro] 커밋된 dist 에 소스맵이 ${strayMaps.size}개 있습니다: ${[...strayMaps.keys()].slice(0, 5).join(', ')}`);
    console.error('  배포 빌드는 G7_BUILD_SOURCEMAP=0 이어야 합니다.');
    process.exit(1);
}

const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wc-community-repro-'));
let failed = false;

try {
    console.log(`[dist-repro] 임시 경로: ${workDir}`);
    copySource(workDir);

    console.log('[dist-repro] npm ci …');
    execFileSync('npm', ['ci'], { cwd: workDir, stdio: 'inherit' });

    console.log('[dist-repro] npm run build (G7_BUILD_SOURCEMAP=0) …');
    execFileSync('npm', ['run', 'build'], {
        cwd: workDir,
        stdio: 'inherit',
        env: { ...process.env, G7_BUILD_SOURCEMAP: '0' },
    });

    const rebuilt = hashTree(path.join(workDir, 'dist'), isBuildOutput);

    const onlyCommitted = [...committed.keys()].filter((name) => !rebuilt.has(name)).sort();
    const onlyRebuilt = [...rebuilt.keys()].filter((name) => !committed.has(name)).sort();
    const different = [...committed.keys()]
        .filter((name) => rebuilt.has(name) && rebuilt.get(name) !== committed.get(name))
        .sort();

    console.log(
        `[dist-repro] 빌드 산출물: 커밋 ${committed.size}개 / 재빌드 ${rebuilt.size}개 — ` +
            `커밋에만 ${onlyCommitted.length}, 재빌드에만 ${onlyRebuilt.length}, 해시 다름 ${different.length}`
    );

    for (const [label, list] of [
        ['커밋에만 있음', onlyCommitted],
        ['재빌드에만 있음', onlyRebuilt],
        ['해시 다름', different],
    ]) {
        if (list.length) {
            failed = true;
            console.error(`  ${label} (${list.length}):`);
            for (const name of list.slice(0, 20)) {
                console.error(`    - ${name}`);
            }
            if (list.length > 20) {
                console.error(`    … 그 밖 ${list.length - 20}개`);
            }
        }
    }
} finally {
    fs.rmSync(workDir, { recursive: true, force: true });
}

// ── 동봉 자산: 빌드가 만들지 않으므로 기록된 해시와 대조 ──────────────────────
const manifestPath = path.join(scriptDir, 'vendor-manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const recorded = new Map(Object.entries(manifest.distVendorFiles));
const actual = hashTree(distDir, (relative) => relative.split(path.sep).includes('vendor'));

const vendorMissing = [...recorded.keys()].filter((name) => !actual.has(name)).sort();
const vendorExtra = [...actual.keys()].filter((name) => !recorded.has(name)).sort();
const vendorDifferent = [...recorded.keys()]
    .filter((name) => actual.has(name) && actual.get(name) !== recorded.get(name))
    .sort();

console.log(
    `[dist-repro] 동봉 자산: 기록 ${recorded.size}개 / 실제 ${actual.size}개 — ` +
        `없음 ${vendorMissing.length}, 기록에 없음 ${vendorExtra.length}, 해시 다름 ${vendorDifferent.length}`
);

for (const [label, list] of [
    ['기록됐는데 없음', vendorMissing],
    ['있는데 기록 없음', vendorExtra],
    ['해시 다름', vendorDifferent],
]) {
    if (list.length) {
        failed = true;
        console.error(`  ${label} (${list.length}):`);
        for (const name of list) {
            console.error(`    - ${name}`);
        }
    }
}

if (failed) {
    console.error('[dist-repro] 불일치. dist/ 를 다시 빌드해 커밋하거나 scripts/vendor-manifest.json 을 갱신하세요.');
    process.exit(1);
}

console.log('[dist-repro] 통과 — 커밋된 dist/ 는 이 소스에서 재현됩니다.');
