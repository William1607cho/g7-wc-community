import React, { useEffect, useState } from 'react';
import { Icon } from '../basic/Icon';
import type { EditorAttrs } from '../../types';

// G7Core.dispatch() navigate 헬퍼
const navigate = (path: string) => {
  (window as any).G7Core?.dispatch?.({
    handler: 'navigate',
    params: { path },
  });
};

/** 한 줄 높이(rem) — 행 클래스 h-6 과 반드시 일치 */
const ROW_HEIGHT_REM = 1.5;

/** 세로 전환 애니메이션 시간(ms) — 클래스 duration-500 과 반드시 일치 */
const TRANSITION_MS = 500;

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export interface NoticeTickerItem {
  id: number | string;
  board_slug: string;
  title: string;
  created_at?: string;
  created_at_formatted?: string;
}

export interface NoticeTickerProps {
  /**
   * 공지 목록 (g7-home-widgets notice-posts 응답의 data)
   */
  items?: NoticeTickerItem[] | null;

  /**
   * 좌측 라벨 텍스트 (예: "공지")
   */
  label?: string;

  /**
   * 영역 접근성 라벨 (미지정 시 label 사용)
   */
  ariaLabel?: string;

  /**
   * 롤링 간격 (ms)
   * @default 4000
   */
  intervalMs?: number;

  /**
   * 사용자 정의 클래스
   */
  className?: string;

  /**
   * DOM id 속성 (레이아웃 편집기 코어 일괄 ID)
   */
  id?: string;

  /**
   * 레이아웃 편집기 주입 속성 (편집 모드 전용, 루트에 spread)
   */
  editorAttrs?: EditorAttrs;
}

/**
 * 사용자 환경의 "동작 줄이기" 설정을 구독합니다.
 */
const usePrefersReducedMotion = (): boolean => {
  const getMatch = () =>
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(REDUCED_MOTION_QUERY).matches;

  const [reduced, setReduced] = useState<boolean>(getMatch);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }
    const mql = window.matchMedia(REDUCED_MOTION_QUERY);
    const onChange = () => setReduced(mql.matches);
    onChange();
    mql.addEventListener?.('change', onChange);
    return () => mql.removeEventListener?.('change', onChange);
  }, []);

  return reduced;
};

/**
 * NoticeTicker 컴포넌트
 *
 * 공지 제목을 한 줄로 보여주고, 여러 건이면 intervalMs 간격으로 세로 롤링합니다.
 * - 마우스를 올리거나 키보드 포커스가 들어오면 정지
 * - prefers-reduced-motion 환경에서는 타이머를 기동하지 않고 첫 건만 표시
 * - 1건이면 고정 표시, 0건(또는 목록이 아닌 값)이면 아무것도 렌더링하지 않음
 * - 언마운트 시 타이머 정리
 *
 * 마지막 → 첫 건 전환도 위로 흐르도록 첫 건 복제 행을 끝에 두고, 복제 행 도착 후
 * 애니메이션 없이 0으로 되돌린다.
 *
 * @example
 * {
 *   "type": "composite",
 *   "name": "NoticeTicker",
 *   "props": {
 *     "items": "{{home_notice_posts.data ?? []}}",
 *     "label": "$t:home.notice_ticker.label"
 *   }
 * }
 */
export const NoticeTicker: React.FC<NoticeTickerProps> = ({
  items,
  label = '',
  ariaLabel,
  intervalMs = 4000,
  className = '',
  id,
  editorAttrs,
}) => {
  const list = Array.isArray(items)
    ? items.filter((item) => item && typeof item.title === 'string' && item.title !== '')
    : [];
  const count = list.length;

  const reducedMotion = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);

  const rolling = count > 1 && !reducedMotion;

  // 목록이 바뀌면(재조회 등) 처음부터
  const listKey = list.map((item) => item.id).join(',');
  useEffect(() => {
    setAnimate(false);
    setIndex(0);
  }, [listKey]);

  // 롤링 타이머 — 정지/동작줄이기/1건 이하에서는 기동하지 않는다
  useEffect(() => {
    if (!rolling || paused) {
      return;
    }
    const timer = setInterval(() => {
      setAnimate(true);
      setIndex((i) => (i >= count ? count : i + 1));
    }, intervalMs);
    return () => clearInterval(timer);
  }, [rolling, paused, count, intervalMs]);

  // 복제 행(첫 건과 동일)에 도착하면 애니메이션 없이 0으로 되돌린다
  useEffect(() => {
    if (index < count || count === 0) {
      return;
    }
    const timer = setTimeout(() => {
      setAnimate(false);
      setIndex(0);
    }, TRANSITION_MS);
    return () => clearTimeout(timer);
  }, [index, count]);

  if (count === 0) {
    return null;
  }

  const displayIndex = rolling ? index : 0;
  const rows = rolling ? [...list, list[0]] : list;
  const activeRow = displayIndex >= count ? 0 : displayIndex;

  const pause = () => setPaused(true);
  const resume = () => setPaused(false);

  return (
    <div
      id={id}
      role="region"
      aria-label={ariaLabel || label || undefined}
      data-testid="notice-ticker"
      className={`flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm dark:border-amber-800/60 dark:bg-amber-900/20 sm:px-5 ${className}`.trim()}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          resume();
        }
      }}
      {...editorAttrs}
    >
      <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-amber-700 dark:text-amber-300">
        <Icon name="bullhorn" className="w-4 h-4" aria-hidden="true" />
        {label && <span>{label}</span>}
      </span>
      <span className="h-4 w-px shrink-0 bg-amber-300/70 dark:bg-amber-700/60" aria-hidden="true" />
      <div className="relative h-6 min-w-0 flex-1 overflow-hidden">
        <ul
          className={`m-0 list-none p-0 ${rolling && animate ? 'transition-transform duration-500 ease-in-out' : ''}`}
          style={{ transform: `translateY(-${displayIndex * ROW_HEIGHT_REM}rem)` }}
          data-testid="notice-ticker-track"
          data-index={displayIndex}
        >
          {rows.map((item, i) => {
            const isClone = i >= count;
            const isActive = !isClone && i === activeRow;
            const path = `/board/${item.board_slug}/${item.id}`;
            return (
              <li
                key={isClone ? `clone-${item.id}` : `${item.id}`}
                className="flex h-6 items-center justify-between gap-3"
                aria-hidden={isActive ? undefined : true}
              >
                <a
                  href={path}
                  tabIndex={isActive ? 0 : -1}
                  className="min-w-0 truncate text-sm text-gray-800 hover:underline dark:text-gray-100"
                  title={item.title}
                  onClick={(event) => {
                    event.preventDefault();
                    navigate(path);
                  }}
                >
                  {item.title}
                </a>
                {item.created_at_formatted && (
                  <span
                    className="shrink-0 text-xs text-amber-700/80 dark:text-amber-300/80"
                    title={item.created_at ?? ''}
                  >
                    {item.created_at_formatted}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default NoticeTicker;
