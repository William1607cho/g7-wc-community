/**
 * 단계 E — 게이트 본체 노출 페이지 상태 계약 테스트
 *
 * 편집기 캔버스는 정적 시뮬레이션이라 사용자가 토글·탭을 클릭해 if/_local/_global 분기를
 * 켤 수 없다(원 계획서 Q10, 메모리
 * feedback_editor_gated_body_needs_page_state_not_click). 따라서 토글/탭/route 게이트 뒤
 * 콘텐츠 본체는 페이지 상태 initialState 패치로 ON 상태를 시뮬레이션해야 캔버스에 렌더된다.
 *
 * 본 테스트는 단계 E 가 신설한 게이트 상태가
 *  (1) 게이트가 읽는 정확한 상태 경로를 패치하는가 (상태 패치 가드)
 *  (2) 그 게이트가 구동하는 본체가 소비하는 샘플 데이터가 thin/stub 이 아닌가 (본체 실재 가드)
 * 를 검증한다.
 *
 * 게이트 SSoT(소비 레이아웃):
 *  - /mypage/board my-comments 서브탭   : partials/mypage/board/_list.json, _my_comments.json
 *  - /search posts/pages 탭             : partials/search/_search_results.json (+ section partials)
 *
 * wc-community(2026-09-26): 이 템플릿 자신의 editor-spec 을 읽는다(예전에는 코어의
 * templates/_bundled/sirsoft-basic 과 modules/_bundled/sirsoft-ecommerce 스펙을 읽어 저장소 단독
 * 실행에서 불러오기부터 실패했다). 이커머스와 함께 지운 상품상세 리뷰/문의 탭·주문서/장바구니
 * 금액 상세 토글 단언은 뺐고, 통합검색은 상품 탭이 빠진 게시글/페이지 두 탭을 기대한다.
 */
import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

const specDir = path.resolve(__dirname, '../../editor-spec');
const basicSample = JSON.parse(fs.readFileSync(path.join(specDir, 'sampleData.json'), 'utf-8'));
const basicStates = JSON.parse(fs.readFileSync(path.join(specDir, 'states.json'), 'utf-8'));

const byId = basicSample.byDataSourceId as Record<string, any>;

function basicGroup(match: string): any {
  return basicStates.groups.find((g: any) => g.scope?.match === match);
}
function item(group: any, id: string): any {
  return group?.items?.find((s: any) => s.id === id);
}

describe('단계 E — 마이게시판 내댓글 서브탭 게이트 상태', () => {
  const g = basicGroup('/mypage/board');

  it('/mypage/board 상태 그룹이 신설되어 있다', () => {
    expect(g).toBeTruthy();
    expect(item(g, 'my_posts')).toBeTruthy();
    expect(item(g, 'my_comments')).toBeTruthy();
  });

  it('my_comments 는 _global.boardActivitySubTab="my-comments" 를 패치한다 (게이트 경로 일치)', () => {
    expect(item(g, 'my_comments').initialState?.global?.boardActivitySubTab).toBe('my-comments');
  });

  it('내댓글 본체가 소비하는 myComments 샘플이 thin 이 아니다 (≥3 행, 정확한 shape)', () => {
    const rows = byId.myComments?.data?.data;
    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBeGreaterThanOrEqual(3);
    for (const r of rows) {
      expect(r.post_title).toBeTruthy();
      expect(r.board_slug).toBeTruthy();
      expect(r.board_name).toBeTruthy();
      expect(r.content).toBeTruthy();
      expect(r.created_at_formatted).toBeTruthy();
    }
  });
});

describe('단계 E — 통합검색 서브탭 게이트 상태 + posts/pages 본체', () => {
  const g = basicGroup('/search');

  it('posts/pages 서브탭 상태가 신설되어 있고 상품 탭 상태는 없다', () => {
    for (const id of ['tab_posts', 'tab_pages']) {
      expect(item(g, id)).toBeTruthy();
    }
    expect(item(g, 'tab_products')).toBeUndefined();
  });

  // 탭의 SSoT 가 전역 상태(`_global.searchActiveTab`)에서 URL 쿼리(`query.type`)로 바뀌었다(#519).
  // 편집기 상태 패치도 같은 경로로 줘야 캔버스에서 서브탭이 실제로 갈린다 — 옛 경로로 두면
  // 세 변종이 모두 'all' 탭으로 렌더되고, 그 사실이 화면상 오류 없이 조용히 지나간다.
  it('각 서브탭 상태는 query.q + query.type 을 패치한다 (게이트 경로)', () => {
    const map: Record<string, string> = { tab_posts: 'posts', tab_pages: 'pages' };
    for (const [id, tab] of Object.entries(map)) {
      const init = item(g, id).initialState;
      expect(init?.query?.q).toBeTruthy();
      expect(init?.query?.type).toBe(tab);
      // 옛 경로가 남아 있으면 SSoT 가 둘이 된다.
      expect(init?.global?.searchActiveTab).toBeUndefined();
    }
  });

  it('all 탭 posts/pages 섹션 본체가 소비하는 searchResults.data.{posts,pages}.items 가 채워져 있다', () => {
    const d = byId.searchResults?.data;
    // Stage A 사각: posts_count/pages_count 만 있고 items 배열이 없어 all 탭 섹션이 비었음 → 보강
    expect(Array.isArray(d.posts?.items)).toBe(true);
    expect(d.posts.items.length).toBeGreaterThanOrEqual(3);
    for (const p of d.posts.items) {
      expect(p.title).toBeTruthy();
      expect(p.board_name).toBeTruthy();
      expect(p.author_name).toBeTruthy();
      expect(p.url).toBeTruthy();
    }
    expect(Array.isArray(d.pages?.items)).toBe(true);
    expect(d.pages.items.length).toBeGreaterThanOrEqual(2);
    for (const pg of d.pages.items) {
      expect(pg.title).toBeTruthy();
      expect(pg.url).toBeTruthy();
    }
    // 상품 탭 본체는 이커머스와 함께 뺐다 — 샘플에 상품 배열이 남아 있지 않아야 한다
    expect(d.products).toBeUndefined();
    expect(d.products_count).toBeUndefined();
  });
});
