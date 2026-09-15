/**
 * NoticeTicker 컴포넌트 테스트
 *
 * @description 홈 공지 티커의 렌더링 조건·롤링·정지·동작줄이기·타이머 정리를 테스트합니다.
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../basic/Icon', () => ({
  Icon: ({ name, ...props }: any) => <i data-testid={`icon-${name}`} {...props} />,
}));

import { NoticeTicker } from '../NoticeTicker';

const makeItems = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    board_slug: 'notice',
    title: `공지 ${i + 1}`,
    created_at: '2026-09-15 10:00:00',
    created_at_formatted: '방금 전',
  }));

const setReducedMotion = (reduce: boolean) => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reduce && query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as any;
};

const trackIndex = () => screen.getByTestId('notice-ticker-track').getAttribute('data-index');

describe('NoticeTicker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setReducedMotion(false);
    (window as any).G7Core = { dispatch: vi.fn() };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('0건·null·배열 아님이면 아무것도 렌더링하지 않는다', () => {
    const { container, rerender } = render(<NoticeTicker items={[]} label="공지" />);
    expect(container.firstChild).toBeNull();
    rerender(<NoticeTicker items={null} label="공지" />);
    expect(container.firstChild).toBeNull();
    rerender(<NoticeTicker items={{} as any} label="공지" />);
    expect(container.firstChild).toBeNull();
  });

  it('라벨·메가폰 아이콘·제목·작성일을 표시한다', () => {
    render(<NoticeTicker items={makeItems(1)} label="공지" />);
    expect(screen.getByTestId('icon-bullhorn')).toBeInTheDocument();
    expect(screen.getByText('공지')).toBeInTheDocument();
    expect(screen.getByText('공지 1')).toBeInTheDocument();
    expect(screen.getByText('방금 전')).toBeInTheDocument();
  });

  it('1건이면 타이머를 기동하지 않고 고정 표시한다', () => {
    render(<NoticeTicker items={makeItems(1)} label="공지" />);
    expect(vi.getTimerCount()).toBe(0);
    act(() => { vi.advanceTimersByTime(12000); });
    expect(trackIndex()).toBe('0');
  });

  it('여러 건이면 4초 간격으로 다음 건으로 넘어가고 마지막 뒤에는 처음으로 돌아온다', () => {
    render(<NoticeTicker items={makeItems(2)} label="공지" />);
    expect(trackIndex()).toBe('0');
    act(() => { vi.advanceTimersByTime(4000); });
    expect(trackIndex()).toBe('1');
    act(() => { vi.advanceTimersByTime(4000); });
    expect(trackIndex()).toBe('2'); // 첫 건 복제 행
    act(() => { vi.advanceTimersByTime(500); });
    expect(trackIndex()).toBe('0');
  });

  it('마우스를 올리면 정지하고 떼면 다시 롤링한다', () => {
    render(<NoticeTicker items={makeItems(3)} label="공지" />);
    const root = screen.getByTestId('notice-ticker');
    fireEvent.mouseEnter(root);
    act(() => { vi.advanceTimersByTime(12000); });
    expect(trackIndex()).toBe('0');
    fireEvent.mouseLeave(root);
    act(() => { vi.advanceTimersByTime(4000); });
    expect(trackIndex()).toBe('1');
  });

  it('prefers-reduced-motion 이면 타이머 없이 첫 건만 표시한다', () => {
    setReducedMotion(true);
    const { container } = render(<NoticeTicker items={makeItems(3)} label="공지" />);
    expect(vi.getTimerCount()).toBe(0);
    act(() => { vi.advanceTimersByTime(12000); });
    expect(trackIndex()).toBe('0');
    // 복제 행 없음 — 비활성 행은 aria-hidden 이라 role 조회에서 빠지므로 DOM 으로 센다
    expect(container.querySelectorAll('li')).toHaveLength(3);
  });

  it('언마운트 시 타이머를 정리한다', () => {
    const { unmount } = render(<NoticeTicker items={makeItems(3)} label="공지" />);
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('제목 클릭 시 G7Core navigate 로 해당 글로 이동한다', () => {
    render(<NoticeTicker items={makeItems(1)} label="공지" />);
    fireEvent.click(screen.getByText('공지 1'));
    expect((window as any).G7Core.dispatch).toHaveBeenCalledWith({
      handler: 'navigate',
      params: { path: '/board/notice/1' },
    });
  });
});
