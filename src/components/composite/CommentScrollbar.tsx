import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Div } from '../basic/Div';

export interface CommentScrollbarProps {
  /** 댓글 영역 선택자 (글 보기 types/basic/show.json 의 댓글 섹션) */
  containerSelector?: string;
  /** 댓글 행 선택자 (_comment_item.json 루트의 앵커 표식) */
  itemSelector?: string;
  /** 0% 위치에서 첫 댓글 위에 남길 여백(px) — 고정 헤더(h-14)와 댓글 섹션의 scroll-mt-20 에 맞춘다 */
  topOffset?: number;
  /** 스크린리더용 이름 (화면에는 글자를 그리지 않는다) */
  'aria-label'?: string;
  className?: string;
}

/** 페이지 스크롤 위치(y) 기준 댓글 구간 — start 에서 0%, end 에서 100% */
export interface CommentRange {
  start: number;
  end: number;
}

/**
 * 댓글 행들의 문서 좌표로 스크롤 구간을 만든다.
 *
 * - 0%: 첫 댓글 위 끝이 헤더 바로 아래(topOffset)에 오는 스크롤 위치
 * - 100%: 마지막 댓글 아래 끝이 화면 아래 끝에 오는 스크롤 위치
 * 둘 다 문서가 실제로 내려갈 수 있는 최대 위치(maxScroll)로 자른다. 댓글이 화면 하나에
 * 다 들어가 끝이 시작보다 앞이면 끝을 시작에 맞춘다(구간 길이 0).
 */
export function computeCommentRange(
  firstTop: number,
  lastBottom: number,
  viewportHeight: number,
  maxScroll: number,
  topOffset: number,
): CommentRange {
  const clampScroll = (y: number) => Math.min(Math.max(y, 0), Math.max(maxScroll, 0));
  const start = clampScroll(firstTop - topOffset);
  const end = Math.max(start, clampScroll(lastBottom - viewportHeight));
  return { start, end };
}

/** 스크롤 위치 → 0~1 비율 */
export function ratioFromScroll(scrollY: number, range: CommentRange): number {
  const span = range.end - range.start;
  if (span <= 0) return scrollY >= range.start ? 1 : 0;
  return Math.min(Math.max((scrollY - range.start) / span, 0), 1);
}

/** 0~1 비율 → 스크롤 위치 */
export function scrollFromRatio(ratio: number, range: CommentRange): number {
  const r = Math.min(Math.max(ratio, 0), 1);
  return range.start + r * (range.end - range.start);
}

/** 손잡이 높이(px) — 트랙 h-24(96px) 안에서 움직인다 */
const THUMB_PX = 24;

/**
 * CommentScrollbar — 플로팅 버튼 줄의 댓글 스크롤바 (2026-10-21)
 *
 * 글 보기 화면에서 지금 그려진 댓글 영역(첫 댓글 위 끝 ~ 마지막 댓글 아래 끝)을 0~100% 로 보고,
 * 손잡이를 끌거나 트랙을 누르면 그 비율 위치로 바로 스크롤한다. 페이지를 스크롤하면 손잡이가 따라
 * 움직인다. 표시 요소는 트랙과 손잡이뿐이다(글자·숫자 없음).
 *
 * - 댓글이 하나도 그려져 있지 않으면 아무것도 그리지 않는다.
 * - 댓글 페이지 나눔·지연 로드는 다루지 않는다. 화면에 있는 댓글 행만 센다.
 * - 스크롤·크기 변화·DOM 변화는 requestAnimationFrame 한 번으로 묶어 처리하고, 손잡이 위치는
 *   React 상태가 아니라 style 로 직접 바꾼다(스크롤마다 다시 그리지 않는다).
 * - 끄는 동안의 이동은 `behavior: 'instant'` — 문서의 `scroll-behavior: smooth` 가 끌기를
 *   늦추지 않게 한다.
 * - 봇(SSR) 화면에서는 그리지 않는다(seo-config skip).
 *
 * @example
 * { "type": "composite", "name": "CommentScrollbar", "props": { "aria-label": "$t:board.comments" } }
 */
export const CommentScrollbar: React.FC<CommentScrollbarProps> = ({
  containerSelector = '#post_comments',
  itemSelector = '[data-g7-anchor="comment-row"]',
  topOffset = 80,
  'aria-label': ariaLabel,
  className = '',
}) => {
  const [hasComments, setHasComments] = useState(false);
  const [dragging, setDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const thumbRef = useRef<HTMLDivElement | null>(null);
  const rangeRef = useRef<CommentRange | null>(null);
  const frameRef = useRef<number | null>(null);

  /** 댓글 행을 다시 재고 손잡이 위치를 맞춘다 (rAF 안에서만 부른다) */
  const measure = useCallback(() => {
    frameRef.current = null;
    const container = document.querySelector(containerSelector);
    const rows = container ? container.querySelectorAll<HTMLElement>(itemSelector) : null;
    if (!rows || rows.length === 0) {
      rangeRef.current = null;
      setHasComments(false);
      return;
    }
    const scrollY = window.scrollY;
    const doc = document.documentElement;
    const range = computeCommentRange(
      rows[0].getBoundingClientRect().top + scrollY,
      rows[rows.length - 1].getBoundingClientRect().bottom + scrollY,
      window.innerHeight,
      doc.scrollHeight - window.innerHeight,
      topOffset,
    );
    rangeRef.current = range;
    setHasComments(true);

    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (track && thumb) {
      const ratio = ratioFromScroll(scrollY, range);
      const travel = Math.max(track.clientHeight - THUMB_PX, 0);
      thumb.style.transform = `translateY(${Math.round(ratio * travel)}px)`;
      track.setAttribute('aria-valuenow', String(Math.round(ratio * 100)));
    }
  }, [containerSelector, itemSelector, topOffset]);

  const schedule = useCallback(() => {
    if (frameRef.current === null) {
      frameRef.current = window.requestAnimationFrame(measure);
    }
  }, [measure]);

  useEffect(() => {
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    // 댓글은 글 데이터가 온 뒤·댓글을 쓰거나 지운 뒤 다시 그려진다 — DOM 변화도 같은 프레임 묶음으로 잰다
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      observer.disconnect();
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [schedule]);

  // 손잡이가 처음 나타난 프레임에도 위치를 맞춘다
  useEffect(() => {
    if (hasComments) schedule();
  }, [hasComments, schedule]);

  /** 트랙 안의 세로 좌표(clientY)로 스크롤한다 — 손잡이 가운데가 그 점에 오도록 */
  const scrollToPointer = (clientY: number) => {
    const track = trackRef.current;
    const range = rangeRef.current;
    if (!track || !range) return;
    const rect = track.getBoundingClientRect();
    const travel = Math.max(rect.height - THUMB_PX, 1);
    const ratio = (clientY - rect.top - THUMB_PX / 2) / travel;
    window.scrollTo({ top: scrollFromRatio(ratio, range), behavior: 'instant' as ScrollBehavior });
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDragging(true);
    scrollToPointer(e.clientY);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    e.preventDefault();
    scrollToPointer(e.clientY);
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    setDragging(false);
  };

  if (!hasComments) return null;

  return (
    <Div
      className={`w-10 h-24 flex justify-center cursor-pointer select-none touch-none transition-opacity duration-150 ${
        dragging ? 'opacity-80' : 'opacity-50 hover:opacity-80'
      } ${className}`}
      data-testid="floating-comment-scrollbar"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <Div
        ref={trackRef}
        role="scrollbar"
        aria-label={ariaLabel}
        aria-controls={containerSelector.startsWith('#') ? containerSelector.slice(1) : undefined}
        aria-orientation="vertical"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
        className="relative w-1.5 h-full rounded-full bg-gray-300/80 dark:bg-gray-600/80 shadow-sm"
      >
        <Div
          ref={thumbRef}
          data-testid="floating-comment-scrollbar-thumb"
          className="absolute left-1/2 top-0 -ml-1.5 w-3 h-6 rounded-full bg-primary-600 dark:bg-primary-500 shadow-md"
        />
      </Div>
    </Div>
  );
};

export default CommentScrollbar;
