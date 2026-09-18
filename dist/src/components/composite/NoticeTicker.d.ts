import { default as React } from 'react';
import { EditorAttrs } from '../../types';
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
export declare const NoticeTicker: React.FC<NoticeTickerProps>;
export default NoticeTicker;
