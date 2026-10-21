import { describe, it, expect, afterEach } from 'vitest';
import { render, act, cleanup } from '@testing-library/react';
import {
  CommentScrollbar,
  computeCommentRange,
  ratioFromScroll,
  scrollFromRatio,
} from '../CommentScrollbar';
import layout from '../../../../layouts/_user_base.json';

/** 다음 애니메이션 프레임까지 기다린다 (컴포넌트는 rAF 안에서 잰다) */
const nextFrame = () => act(() => new Promise<void>((r) => requestAnimationFrame(() => r())));

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
});

describe('CommentScrollbar 구간 계산', () => {
  it('0% 는 첫 댓글이 헤더 아래에, 100% 는 마지막 댓글 아래 끝이 화면 아래에 오는 위치다', () => {
    const range = computeCommentRange(2000, 5000, 800, 10000, 80);
    expect(range).toEqual({ start: 1920, end: 4200 });
  });

  it('문서가 내려갈 수 있는 끝(maxScroll)을 넘지 않는다', () => {
    const range = computeCommentRange(2000, 5000, 800, 3000, 80);
    expect(range).toEqual({ start: 1920, end: 3000 });
  });

  it('댓글이 화면 하나에 다 들어가면 구간 길이가 0 이다', () => {
    const range = computeCommentRange(1000, 1300, 800, 10000, 80);
    expect(range.end).toBe(range.start);
    expect(ratioFromScroll(range.start - 1, range)).toBe(0);
    expect(ratioFromScroll(range.start, range)).toBe(1);
  });

  it('비율과 스크롤 위치는 서로 되돌릴 수 있고 0~1 로 자른다', () => {
    const range = { start: 1000, end: 3000 };
    expect(ratioFromScroll(2000, range)).toBe(0.5);
    expect(scrollFromRatio(0.5, range)).toBe(2000);
    expect(ratioFromScroll(0, range)).toBe(0);
    expect(ratioFromScroll(9999, range)).toBe(1);
    expect(scrollFromRatio(-1, range)).toBe(1000);
    expect(scrollFromRatio(2, range)).toBe(3000);
  });
});

describe('CommentScrollbar 렌더', () => {
  it('그려진 댓글 행이 없으면 아무것도 그리지 않는다', async () => {
    document.body.innerHTML = '<div id="post_comments"></div>';
    const { container } = render(<CommentScrollbar aria-label="댓글" />);
    await nextFrame();
    expect(container.querySelector('[data-testid="floating-comment-scrollbar"]')).toBeNull();
  });

  it('댓글 행이 있으면 트랙과 손잡이만 그린다(글자 없음)', async () => {
    document.body.innerHTML =
      '<div id="post_comments"><div data-g7-anchor="comment-row"></div><div data-g7-anchor="comment-row"></div></div>';
    const { container } = render(<CommentScrollbar aria-label="댓글" />);
    await nextFrame();
    const bar = container.querySelector('[data-testid="floating-comment-scrollbar"]');
    expect(bar).not.toBeNull();
    expect(bar!.querySelector('[role="scrollbar"]')).not.toBeNull();
    expect(bar!.querySelector('[data-testid="floating-comment-scrollbar-thumb"]')).not.toBeNull();
    expect(bar!.textContent).toBe('');
  });

  it('댓글 영역 밖의 같은 표식은 세지 않는다', async () => {
    document.body.innerHTML = '<div><div data-g7-anchor="comment-row"></div></div><div id="post_comments"></div>';
    const { container } = render(<CommentScrollbar />);
    await nextFrame();
    expect(container.querySelector('[data-testid="floating-comment-scrollbar"]')).toBeNull();
  });
});

describe('플로팅 버튼 줄 레이아웃 (_user_base.json)', () => {
  const findById = (nodes: any[], id: string): any => {
    for (const n of nodes ?? []) {
      if (n?.id === id) return n;
      const hit = findById(n?.children ?? [], id) ?? (n?.slots ? findById(Object.values(n.slots).flat() as any[], id) : null);
      if (hit) return hit;
    }
    return null;
  };
  const root = findById((layout as any).components, 'floating_buttons');
  const children: any[] = root?.children ?? [];
  const testIds = children.map((c) => c?.props?.['data-testid'] ?? c?.name);

  it('홈에서도 줄이 그려진다(경로가 있으면)', () => {
    expect(root).not.toBeNull();
    expect(root.if).toBe('{{!!route?.path}}');
  });

  it('맨 위로 버튼은 조건 없이 보이고, 홈 버튼은 홈에서 숨는다', () => {
    const top = children.find((c) => c?.props?.['data-testid'] === 'floating-top');
    const home = children.find((c) => c?.props?.['data-testid'] === 'floating-home');
    expect(top.if).toBeUndefined();
    expect(home.if).toBe("{{route.path !== '/'}}");
  });

  it('댓글 스크롤바는 댓글 버튼 바로 아래에 있고 댓글 버튼과 같은 조건을 쓴다', () => {
    const i = testIds.indexOf('floating-comments');
    expect(testIds[i + 1]).toBe('CommentScrollbar');
    expect(children[i + 1].if).toBe(children[i].if);
  });
});
