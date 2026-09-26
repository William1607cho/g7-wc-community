import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * 전체 게시판(/boards) — 최근활동순 정렬 (2026-09-26 2차)
 *
 * 게시판 목록 API 는 게시판 생성일순으로 준다. `?limit=1` 을 주면 게시판마다 최근 원글 1건
 * (`recent_posts[0].created_at`, 답글·삭제·미게시 제외, 공지 포함)이 붙으므로 레이아웃 반복
 * source 에서 그 값으로 정렬한다.
 *
 * 규칙: 최근 원글 작성 시각 내림차순 / 글 없는 게시판은 맨 뒤 / 같은 시각은 게시판 id 내림차순.
 * 원본 배열은 `.slice()` 로 복사한 뒤 정렬한다(데이터소스 값을 제자리에서 바꾸지 않는다).
 * 비교는 삼항(1/-1/0) — 봇용 PHP 평가기가 localeCompare 를 지원하지 않는다.
 * (그래도 봇용 서버 렌더링은 이 정렬을 적용하지 못해 봇에게는 생성일순이 나간다 — 2026-09-26 실측.
 *  이 테스트는 브라우저 표현식의 계약만 본다.)
 */
describe('/boards 최근활동순 정렬', () => {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
  const layout = JSON.parse(readFileSync(resolve(root, 'layouts/board/boards.json'), 'utf8'));

  const findIteration = (node: unknown): { source: string } | null => {
    if (Array.isArray(node)) {
      for (const n of node) {
        const r = findIteration(n);
        if (r) return r;
      }
      return null;
    }
    if (node && typeof node === 'object') {
      const o = node as Record<string, unknown>;
      if (o.iteration && typeof (o.iteration as any).source === 'string' && (o.iteration as any).source.includes('boardList')) {
        return o.iteration as { source: string };
      }
      for (const v of Object.values(o)) {
        const r = findIteration(v);
        if (r) return r;
      }
    }
    return null;
  };

  const iteration = findIteration(layout.slots);
  const source = iteration?.source ?? '';
  const expr = source.replace(/^\{\{/, '').replace(/\}\}$/, '');
  // 레이아웃 표현식은 JS 부분집합이라 테스트에서는 그대로 함수로 평가한다
  const evaluate = (data: unknown[] | undefined) =>
    // eslint-disable-next-line no-new-func
    new Function('boardList', `return (${expr});`)({ data });

  const board = (id: number, createdAt?: string) => ({
    id,
    slug: `b${id}`,
    recent_posts: createdAt ? [{ id: id * 100, created_at: createdAt }] : [],
  });

  it('데이터소스가 게시판마다 최근 글 1건을 받는다 (params.limit === 1)', () => {
    const ds = (layout.data_sources ?? []).find((d: any) => d.id === 'boardList');
    expect(ds).toBeDefined();
    expect(ds.endpoint).toBe('/api/modules/sirsoft-board/boards');
    expect(ds.params?.limit).toBe(1);
  });

  it('반복 source 는 복사 후 정렬하고 localeCompare 를 쓰지 않는다', () => {
    expect(iteration).not.toBeNull();
    expect(source).toMatch(/\.slice\(\)\.sort\(/);
    expect(source).not.toContain('localeCompare');
    expect(source).toContain('recent_posts?.[0]?.created_at');
  });

  it('최근 원글 시각 내림차순, 글 없는 게시판은 맨 뒤, 동률은 id 내림차순', () => {
    const data = [
      board(1, '2026-09-16 16:21:46'),
      board(2),
      board(3, '2026-09-25 07:32:23'),
      board(4, '2026-09-21 05:36:06'),
      board(5, '2026-09-21 05:36:06'),
      board(6),
      board(7, '2026-09-24 03:08:31'),
    ];
    const ids = evaluate(data).map((b: { id: number }) => b.id);
    expect(ids).toEqual([3, 7, 5, 4, 1, 6, 2]);
  });

  it('원본 배열 순서를 바꾸지 않는다', () => {
    const data = [board(1, '2026-09-01 00:00:00'), board(2, '2026-09-02 00:00:00')];
    const before = data.map((b) => b.id);
    const sorted = evaluate(data);
    expect(sorted).not.toBe(data);
    expect(data.map((b) => b.id)).toEqual(before);
    expect(sorted.map((b: { id: number }) => b.id)).toEqual([2, 1]);
  });

  it('데이터가 없으면 빈 배열', () => {
    expect(evaluate(undefined)).toEqual([]);
  });

  it('카드에는 최근 글 정보를 표시하지 않는다', () => {
    const card = readFileSync(resolve(root, 'layouts/partials/board/boards/_board_card.json'), 'utf8');
    expect(card).not.toContain('recent_posts');
  });
});
