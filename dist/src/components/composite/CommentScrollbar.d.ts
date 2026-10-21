import { default as React } from 'react';
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
export declare function computeCommentRange(firstTop: number, lastBottom: number, viewportHeight: number, maxScroll: number, topOffset: number): CommentRange;
/** 스크롤 위치 → 0~1 비율 */
export declare function ratioFromScroll(scrollY: number, range: CommentRange): number;
/** 0~1 비율 → 스크롤 위치 */
export declare function scrollFromRatio(ratio: number, range: CommentRange): number;
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
export declare const CommentScrollbar: React.FC<CommentScrollbarProps>;
export default CommentScrollbar;
