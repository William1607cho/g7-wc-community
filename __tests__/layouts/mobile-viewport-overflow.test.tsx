/**
 * @file mobile-viewport-overflow.test.tsx
 * @description 390px(iPhone) 모바일 뷰포트 가로 오버플로/압착 회귀 차단
 *
 * 배경 (Chrome DevTools 390x844x3, mobile UA 실측):
 * - 헤더 우측 그룹에 언어(71px)+통화(91px)가 있어 26개 라우트 중 24개에서
 *   document.scrollWidth = 401px (뷰포트 390px 대비 +11px). 320px(iPhone SE)에서는
 *   햄버거 버튼이 화면 밖으로 밀려 내비게이션 자체가 불가능했다.
 *   → (wc-community) 헤더·드로어의 언어 선택을 숨기고 통화 선택은 이커머스와 함께 뺐다
 * - 비회원 댓글폼: 아바타 76px 들여쓰기 + flex-1 입력 2개 → 문서 +81px 초과
 * - 비회원 글쓰기폼: grid-cols-2 → 각 입력 147px 로 압착, placeholder 잘림
 * - 게시글 상단 네비: 게시판명이 길수록 좌우 버튼을 압착 (390px 실측 — 5자 '이전글' 87px,
 *   11자 73px, 21자 62px 로 chevron 과 텍스트가 겹침). docOverflow 는 0 이라 오버플로
 *   검사로는 잡히지 않는다.
 *
 * 이 파일은 위 좌표들이 되돌아가지 않도록 레이아웃 JSON 구조를 직접 단언한다.
 * (원본 Basic 의 상품상세 쿠폰 칩·부분환불 모달·해외 배송지 단언은 그 레이아웃을 이 템플릿에서
 *  지웠으므로 뺐다. Modal 여백 단언은 지운 주문 모달 3개 대신 현재 있는 모든 Modal 레이아웃에 건다.)
 *
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const layoutsDir = path.resolve(__dirname, '../../layouts');

/**
 * 레이아웃 JSON 을 로드합니다.
 *
 * @param relativePath layouts/ 기준 상대 경로
 * @return 파싱된 레이아웃 객체
 */
function loadLayout(relativePath: string): any {
  return JSON.parse(fs.readFileSync(path.join(layoutsDir, relativePath), 'utf-8'));
}

/**
 * 술어를 만족하는 첫 노드를 찾습니다.
 *
 * @param node 탐색 시작 노드/배열
 * @param predicate 판정 함수
 * @return 찾은 노드 (없으면 null)
 */
function findNode(node: any, predicate: (n: any) => boolean): any {
  if (!node || typeof node !== 'object') return null;
  if (Array.isArray(node)) {
    for (const n of node) {
      const r = findNode(n, predicate);
      if (r) return r;
    }
    return null;
  }
  if (predicate(node)) return node;
  for (const k of ['children', 'components']) {
    if (node[k]) {
      const r = findNode(node[k], predicate);
      if (r) return r;
    }
  }
  return null;
}

/**
 * 술어를 만족하는 모든 노드를 찾습니다.
 *
 * @param node 탐색 시작 노드/배열
 * @param predicate 판정 함수
 * @param acc 누적 배열 (재귀 내부용)
 * @return 찾은 노드 배열
 */
function findAllNodes(node: any, predicate: (n: any) => boolean, acc: any[] = []): any[] {
  if (!node || typeof node !== 'object') return acc;
  if (Array.isArray(node)) {
    for (const n of node) findAllNodes(n, predicate, acc);
    return acc;
  }
  if (predicate(node)) acc.push(node);
  for (const k of ['children', 'components']) {
    if (node[k]) findAllNodes(node[k], predicate, acc);
  }
  return acc;
}

describe('게시판 비회원 입력 행 — 좁은 화면에서 세로 스택', () => {
  it('댓글 입력폼의 이름/비밀번호 행이 flex-col sm:flex-row 다 (+81px 오버플로 회귀)', () => {
    const layout = loadLayout('partials/board/show/_comment_input.json');
    const guestRow = findNode(
      layout,
      (n) => typeof n.if === 'string' && n.if.includes('!_global.currentUser?.uuid')
    );
    expect(guestRow).toBeTruthy();

    const cls: string = guestRow.props?.className ?? '';
    expect(cls).toContain('flex-col');
    expect(cls).toContain('sm:flex-row');
  });

  it('글쓰기폼의 이름/비밀번호 행이 grid-cols-1 sm:grid-cols-2 다 (147px 압착 회귀)', () => {
    const layout = loadLayout('partials/board/form/_post_form.json');
    const guestRow = findNode(
      layout,
      (n) =>
        typeof n.if === 'string' &&
        n.if.includes('!_global.currentUser?.uuid') &&
        n.if.includes('!route.id')
    );
    expect(guestRow).toBeTruthy();

    const cls: string = guestRow.props?.className ?? '';
    expect(cls).toContain('grid-cols-1');
    expect(cls).toContain('sm:grid-cols-2');
    // 무접두 grid-cols-2 는 모바일에서 그대로 2열이 된다
    expect(cls).not.toMatch(/(^|\s)grid-cols-2(\s|$)/);
  });
});

/**
 * layouts/ 아래에서 루트가 Modal 인 레이아웃 파일(상대 경로)을 모두 찾습니다.
 *
 * @return layouts/ 기준 상대 경로 배열
 */
function findModalLayouts(): string[] {
  const out: string[] = [];
  const walk = (rel: string) => {
    for (const ent of fs.readdirSync(path.join(layoutsDir, rel), { withFileTypes: true })) {
      const r = rel ? `${rel}/${ent.name}` : ent.name;
      if (ent.isDirectory()) walk(r);
      else if (ent.name.endsWith('.json') && loadLayout(r)?.name === 'Modal') out.push(r);
    }
  };
  walk('');
  return out.sort();
}

describe('Modal 좌우 여백 — max-w-full 이 clamp 를 이기지 못하게', () => {
  /**
   * Modal.tsx 는 `max-w-[calc(100vw-2rem)]` 로 화면 좌우 16px 여백을 보장한다.
   * 그런데 그 뒤에 `${className}` 이 붙으므로, 레이아웃이 `max-w-full`(=100%)을 주면
   * CSS 우선순위상 100% 가 이겨 모달이 화면에 딱 붙는다(390px 실측: left=0, right=390).
   *
   * Modal 이 스스로 clamp 하므로 `max-w-full` 은 불필요하며 해롭다.
   */
  const modalFiles = findModalLayouts();

  it('검사할 Modal 레이아웃이 실제로 있다 (0개면 아래 단언은 아무것도 증명하지 못한다)', () => {
    expect(modalFiles.length).toBeGreaterThan(0);
  });

  for (const file of modalFiles) {
    it(`${file} 의 Modal props.className 에 max-w-full 이 없다`, () => {
      const layout = loadLayout(file);
      expect(layout.name).toBe('Modal');
      const cls: string = layout.props?.className ?? '';
      expect(cls.split(/\s+/)).not.toContain('max-w-full');
    });
  }

  it('Modal.tsx 패널이 max-w-[calc(100vw-2rem)] 로 화면 폭을 clamp 한다', () => {
    const tsx = fs.readFileSync(
      path.resolve(__dirname, '../../src/components/composite/Modal.tsx'),
      'utf-8'
    );
    expect(tsx).toContain('max-w-[calc(100vw-2rem)]');
  });
});

describe('게시글 상단 네비 — 긴 게시판명이 좌우 버튼을 압착하지 않는다', () => {
  const layout = loadLayout('partials/board/show/_navigation.json');

  it('컨테이너가 모바일에서 줄바꿈한다 (flex-wrap)', () => {
    // 셋을 한 줄에 두면 게시판명이 남은 폭을 먹고 형제를 눌러버린다.
    // 390px 실측: '이전글' 버튼 폭이 5자 87px → 11자 73px → 21자 62px 로 줄었다.
    expect(layout.props.className).toContain('justify-between');

    // portable(0~1023) 이 아니라 mobile(0~767). 버튼 3개 고정폭 261px + 21자 제목 자연폭
    // 323px = 584px 이므로 태블릿(콘텐츠 735px)은 한 줄로 충분하다.
    expect(layout.responsive?.portable).toBeUndefined();
    const mobile: string = layout.responsive?.mobile?.props?.className ?? '';
    expect(mobile).toContain('flex-wrap');
    expect(mobile).toContain('justify-between');
    // 줄바꿈 시 두 행이 붙지 않도록 세로 gap 이 필요하다
    expect(mobile).toMatch(/\bgap-y-\d/);
  });

  it('게시판명이 모바일에서 자기 줄을 차지한다 (order-first w-full)', () => {
    const title = findNode(
      layout,
      (n) => n.name === 'Span' && typeof n.text === 'string' && n.text.includes('board?.name')
    );
    expect(title).toBeTruthy();

    const mobile: string = title.responsive?.mobile?.props?.className ?? '';
    const tokens = mobile.split(/\s+/);
    expect(tokens).toContain('order-first');
    expect(tokens).toContain('w-full');
  });

  it('목록 버튼과 이전/다음 그룹은 shrink-0 이라 눌리지 않는다', () => {
    // 2026-09-26 아이콘화: 버튼 글자는 자식 text 가 아니라 title/aria-label 로 옮겨졌다.
    const backBtn = findNode(
      layout,
      (n) => n.name === 'Button' && n.props?.title === '$t:board.back_to_list' && !n.if?.includes('wiki?.front_post_id')
    );
    expect(backBtn).toBeTruthy();
    expect(backBtn.props.className.split(/\s+/)).toContain('shrink-0');

    // 이전글·다음글(+관리자 링크) 오른쪽 묶음 — 이전·다음 버튼을 직계 자식으로 가진 Div.
    const isBtn = (c: any, key: string) => c.name === 'Button' && c.props?.title === key;
    const prevNextGroup = findNode(
      layout,
      (n) =>
        n.name === 'Div' &&
        Array.isArray(n.children) &&
        n.children.some((c: any) => isBtn(c, '$t:board.prev')) &&
        n.children.some((c: any) => isBtn(c, '$t:board.next'))
    );
    expect(prevNextGroup).toBeTruthy();
    expect(prevNextGroup.props.className.split(/\s+/)).toContain('shrink-0');
    // 묶음 안 버튼도 각자 shrink-0 이라 390px 에서 폭이 줄지 않는다
    for (const c of prevNextGroup.children) {
      expect((c.props?.className ?? '').split(/\s+/)).toContain('shrink-0');
    }
  });
});
