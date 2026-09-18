import { default as React } from 'react';
import { NotificationItem } from './NotificationCenter';
/** 상단 메뉴 항목 — g7-easy-topmenu 공개 API 응답 (최대 2단) */
interface TopMenuItem {
    id: number;
    name: string;
    /** 아이콘 — Font Awesome 이름(예: "house"), 없으면 null */
    icon?: string | null;
    /** 링크 주소 — null 이면 링크 없는 그룹 (하위 메뉴만 펼침) */
    url: string | null;
    /** http(s) 외부 주소 여부 — 새 탭으로 연다 */
    is_external?: boolean;
    children?: TopMenuItem[];
}
interface User {
    uuid: string;
    name: string;
    avatar?: string;
    is_admin?: boolean;
}
interface HeaderProps {
    /** 사이트 로고 URL */
    logo?: string;
    /** 사이트 이름 */
    siteName?: string;
    /** 현재 로그인된 사용자 */
    user?: User | null;
    /** 읽지 않은 알림 수 */
    notificationCount?: number;
    /** 상단 메뉴 트리 (g7-easy-topmenu `GET /api/plugins/g7-easy-topmenu/menu-items`) */
    menuItems?: TopMenuItem[];
    /** 모바일 메뉴 열기 콜백 */
    onMobileMenuOpen?: () => void;
    /** 사용 가능한 언어 목록 */
    availableLocales?: string[];
    /** 현재 언어 */
    currentLocale?: string;
    /** 추가 CSS 클래스 */
    className?: string;
    /** 레이아웃 편집기 식별 속성(data-editor-*) — 시각적 루트에 spread */
    editorAttrs?: Record<string, unknown>;
    /** 알림 목록 (NotificationCenter에 전달) */
    notifications?: NotificationItem[];
    /** 더 불러올 페이지 존재 여부 */
    notificationHasMore?: boolean;
    /** 알림 로딩 상태 */
    notificationLoading?: boolean;
    /** "안 읽은 알림만" 필터 상태 */
    notificationUnreadOnly?: boolean;
    /** 알림 드롭다운 제목 */
    notificationTitleText?: string;
    /** 알림 없음 텍스트 */
    notificationEmptyText?: string;
    /** "모두 읽음" 텍스트 */
    notificationMarkAllReadText?: string;
    /** "모두 삭제" 텍스트 */
    notificationDeleteAllText?: string;
    /** "안 읽은 알림만" 체크박스 텍스트 */
    notificationUnreadOnlyText?: string;
    /** 알림 드롭다운 닫힐 때 (뷰포트에 보인 미읽음 ID 배열 전달) */
    onNotificationClose?: (visibleUnreadIds: (string | number)[]) => void;
    /** 개별 알림 클릭 */
    onNotificationClick?: (notification: NotificationItem) => void;
    /** 무한 스크롤: 추가 로드 */
    onNotificationLoadMore?: () => void;
    /** "모두 읽음" 처리 */
    onNotificationMarkAllRead?: () => void;
    /** "모두 삭제" 요청 (모달 오픈) */
    onNotificationDeleteAll?: () => void;
    /** 개별 알림 삭제 */
    onNotificationDelete?: (notification: NotificationItem) => void;
    /** "안 읽은 알림만" 체크박스 토글 */
    onNotificationUnreadOnlyToggle?: (checked: boolean) => void;
}
/**
 * 사이트 헤더 컴포넌트
 *
 * @example
 * ```json
 * // 레이아웃 JSON에서 사용
 * {
 *   "type": "composite",
 *   "name": "Header",
 *   "props": {
 *     "logo": "{{_global.settings.site_logo}}",
 *     "siteName": "{{_global.settings.site_name}}",
 *     "user": "{{_global.currentUser}}",
 *     "notificationCount": "{{_global.notificationCount}}",
 *     "menuItems": "{{topMenu.data}}"
 *   }
 * }
 * ```
 */
declare const Header: React.FC<HeaderProps>;
export default Header;
