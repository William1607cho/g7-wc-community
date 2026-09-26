import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';

/*
 * 테스트 설정 — 이 저장소만 받아도 돈다.
 *
 * - 셋업(`tests/vitest.setup.ts`)과 DOM 환경(happy-dom)은 이 저장소 안의 것만 쓴다.
 * - 코어 렌더 엔진(`@/core/...`, `@core/...`)을 불러오는 레이아웃 렌더 테스트는 그누보드7 코어 소스와
 *   코어의 npm 의존성(axios 등)이 있어야 돈다. 코어 루트는 G7_ROOT 환경변수, 없으면 상위 디렉터리의
 *   `artisan` 으로 찾는다. 코어를 못 찾거나 코어 의존성이 설치돼 있지 않으면 그 테스트만 제외하고,
 *   무엇을 왜 뺐는지 한 줄로 알린다(README 「테스트」 참고).
 */
function findCoreRoot(startDir: string): string | null {
  const candidates: string[] = [];
  if (process.env.G7_ROOT) candidates.push(path.resolve(process.env.G7_ROOT));
  let dir = startDir;
  while (dir !== path.dirname(dir)) {
    candidates.push(dir);
    dir = path.dirname(dir);
  }
  for (const c of candidates) {
    if (fs.existsSync(path.join(c, 'artisan')) && fs.existsSync(path.join(c, 'resources/js/core'))) return c;
  }
  return null;
}

// 코어 소스가 쓰는 npm 패키지가 코어 쪽에 설치돼 있는가 (코어 package.json 의 dependencies 가 기준)
function coreDepsInstalled(coreRoot: string): boolean {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(coreRoot, 'package.json'), 'utf8'));
    const req = createRequire(path.join(coreRoot, 'package.json'));
    return Object.keys(pkg.dependencies ?? {}).every((name) => {
      try {
        req.resolve(`${name}/package.json`);
        return true;
      } catch {
        return false;
      }
    });
  } catch {
    return false;
  }
}

const TEST_GLOBS = ['src/**/*.{test,spec}.{ts,tsx}', '__tests__/**/*.{test,spec}.{ts,tsx}'];
const CORE_IMPORT = /['"](?:@\/core\/|@core\/)/;

// 코어 렌더 엔진을 불러오는 테스트 파일 목록 (import 문을 읽어 판정)
function coreDependentTests(root: string): string[] {
  const out: string[] = [];
  const walk = (rel: string) => {
    const abs = path.join(root, rel);
    if (!fs.existsSync(abs)) return;
    for (const ent of fs.readdirSync(abs, { withFileTypes: true })) {
      const r = path.join(rel, ent.name);
      if (ent.isDirectory()) {
        if (ent.name !== 'node_modules') walk(r);
      } else if (/\.(test|spec)\.tsx?$/.test(ent.name) && CORE_IMPORT.test(fs.readFileSync(path.join(root, r), 'utf8'))) {
        out.push(r.split(path.sep).join('/'));
      }
    }
  };
  walk('src');
  walk('__tests__');
  return out.sort();
}

const coreRoot = findCoreRoot(__dirname);
const coreReady = coreRoot !== null && coreDepsInstalled(coreRoot);
const coreTests = coreDependentTests(__dirname);
if (!coreReady && coreTests.length > 0) {
  console.warn(
    `[vitest] 코어 의존 테스트 ${coreTests.length}개 제외 — ` +
      (coreRoot ? `코어(${coreRoot})의 npm 의존성이 설치돼 있지 않음` : '그누보드7 코어 루트를 찾지 못함(G7_ROOT 미지정)'),
  );
}

export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      allow: coreRoot ? [__dirname, coreRoot] : [__dirname],
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: [path.resolve(__dirname, 'tests/vitest.setup.ts')],
    include: TEST_GLOBS,
    exclude: ['**/node_modules/**', ...(coreReady ? [] : coreTests)],
  },
  resolve: {
    alias: coreRoot
      ? {
          '@': path.resolve(coreRoot, 'resources/js'),
          '@core': path.resolve(coreRoot, 'resources/js/core'),
        }
      : {},
  },
});
