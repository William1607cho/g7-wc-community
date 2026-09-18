/**
 * Header 컴포넌트
 *
 * 사이트 상단 헤더 컴포넌트입니다.
 * 로고, 검색바, 네비게이션, 사용자 메뉴, 알림을 포함합니다.
 *
 * @see 화면 구성:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ [Logo] [검색바................] [🔔] [👤 닉네임 ▼]              │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ [홈] [🔥인기] [커뮤니티▼] [갤러리] [공지사항▼] ...               │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * 홈·인기 뒤의 메뉴는 g7-easy-topmenu 플러그인이 관리자 설정대로 내려주는 2단 트리다.
 */

import React, { useState, useRef, useEffect } from 'react';

// 기본 컴포넌트 import
import { Div } from '../basic/Div';
import { Button } from '../basic/Button';
import { Input } from '../basic/Input';
import { Span } from '../basic/Span';
import { Img } from '../basic/Img';
import { Icon } from '../basic/Icon';
import { Form } from '../basic/Form';
import { Nav } from '../basic/Nav';
import { Header as HeaderBasic } from '../basic/Header';
import { Hr } from '../basic/Hr';
import { A } from '../basic/A';

// ThemeToggle 컴포넌트 import
import { ThemeToggle } from './ThemeToggle';

// Avatar 컴포넌트 import
import { Avatar } from './Avatar';

// SlotContainer — 헤더 통화 등 모듈 주입 UI 를 떙겨 렌더 (헤더는 주입 모듈을 모름)
import { SlotContainer } from './SlotContainer';

// NotificationCenter 컴포넌트 import
import { NotificationCenter, type NotificationItem } from './NotificationCenter';

// G7Core.t() 번역 함수 참조
const t = (key: string, params?: Record<string, string | number>) =>
  (window as any).G7Core?.t?.(key, params) ?? key;

// G7Core.dispatch() navigate 헬퍼
const navigate = (path: string) => {
  (window as any).G7Core?.dispatch?.({
    handler: 'navigate',
    params: { path },
  });
};

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

  // ===== 알림센터 드롭다운 Props =====
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
const Header: React.FC<HeaderProps> = ({
  logo,
  siteName = '그누보드7',
  user,
  notificationCount = 0,
  menuItems = [],
  onMobileMenuOpen,
  availableLocales = [],
  currentLocale = 'ko',
  className = '',
  editorAttrs,
  // 알림센터
  notifications = [],
  notificationHasMore = false,
  notificationLoading = false,
  notificationUnreadOnly = false,
  notificationTitleText,
  notificationEmptyText,
  notificationMarkAllReadText,
  notificationDeleteAllText,
  notificationUnreadOnlyText,
  onNotificationClose,
  onNotificationClick,
  onNotificationLoadMore,
  onNotificationMarkAllRead,
  onNotificationDeleteAll,
  onNotificationDelete,
  onNotificationUnreadOnlyToggle,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  // 열린 상단 메뉴 드롭다운(1단 항목 id)
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const menuTriggerRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const menuDropdownRef = useRef<HTMLDivElement>(null);
  const menuCloseTimerRef = useRef<number | null>(null);
  // 마지막으로 트리거를 누른 포인터 종류 — 마우스는 hover 로 이미 열렸으므로 클릭이 다시 닫지 않게 한다
  const lastMenuPointerTypeRef = useRef<string>('');
  const langMenuRef = useRef<HTMLDivElement>(null);

  // G7Core.useResponsive를 통해 반응형 상태 구독 (G7 표준 — 위지윅 overrideWidth 호환)
  const G7Core = (window as any).G7Core;
  const useResponsive = G7Core?.useResponsive;
  const responsiveValue = useResponsive?.();
  const isMobile = responsiveValue
    ? responsiveValue.width < 768
    : typeof window !== 'undefined' && window.innerWidth < 768;

  // 경로 변경 감지 (SPA 네비게이션 대응)
  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);

    // G7Core의 navigate 이벤트 감지
    const originalPushState = history.pushState;
    history.pushState = function(...args) {
      originalPushState.apply(this, args);
      setCurrentPath(window.location.pathname);
    };

    return () => {
      window.removeEventListener('popstate', handlePopState);
      history.pushState = originalPushState;
    };
  }, []);

  // 경로 매칭 헬퍼 함수
  const isActiveRoute = (path: string, exact = false): boolean => {
    if (exact) {
      return currentPath === path;
    }
    return currentPath === path || currentPath.startsWith(path + '/');
  };

  // 네비게이션 버튼 스타일
  const getNavButtonClass = (isActive: boolean): string => {
    const baseClass = 'px-3 py-2 text-sm font-medium whitespace-nowrap cursor-pointer rounded-lg transition-colors';
    if (isActive) {
      return `${baseClass} bg-gray-900 text-white dark:bg-white dark:text-gray-900`;
    }
    return `${baseClass} text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800`;
  };

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserMenu(false);
      }
      const insideMenuTrigger = Object.values(menuTriggerRefs.current).some((el) => el?.contains(target));
      if (!insideMenuTrigger && !menuDropdownRef.current?.contains(target)) {
        setOpenMenuId(null);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(target)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 경로가 바뀌면 상단 메뉴 드롭다운을 닫는다
  useEffect(() => {
    setOpenMenuId(null);
  }, [currentPath]);

  // 드롭다운은 fixed 위치라 스크롤·리사이즈 시 트리거와 어긋나므로 닫는다
  useEffect(() => {
    if (openMenuId === null) return;
    const close = () => setOpenMenuId(null);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [openMenuId]);

  // 언마운트 시 닫기 지연 타이머 정리
  useEffect(() => () => {
    if (menuCloseTimerRef.current !== null) {
      window.clearTimeout(menuCloseTimerRef.current);
    }
  }, []);

  // 상단 메뉴 데이터 — g7-easy-topmenu 플러그인이 없거나 API 가 실패하면 레이아웃 fallback([])이 오지만,
  // 배열이 아닌 값이 와도 헤더가 깨지지 않도록 한 번 더 방어한다 (메뉴 영역만 비고 나머지는 정상 렌더링)
  const topMenuItems: TopMenuItem[] = Array.isArray(menuItems) ? menuItems : [];

  // 상단 메뉴 링크 이동 — 사이트 안 주소는 SPA navigate, 외부 주소는 새 탭
  const openMenuLink = (item: TopMenuItem) => {
    if (!item.url) return;
    setOpenMenuId(null);
    if (item.is_external) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
      return;
    }
    navigate(item.url);
  };

  // 1단 항목 활성 판정 — 자기 링크나 하위 링크 중 하나가 현재 경로와 맞으면 활성
  const isMenuItemActive = (item: TopMenuItem): boolean => {
    const matches = (candidate: TopMenuItem) =>
      !!candidate.url && !candidate.is_external && isActiveRoute(candidate.url);
    return matches(item) || (Array.isArray(item.children) ? item.children : []).some(matches);
  };

  // nav 가 가로 스크롤(overflow-x-auto)이라 absolute 드롭다운은 잘린다 → 트리거 위치로 fixed 배치
  const openMenuDropdown = (item: TopMenuItem) => {
    if (menuCloseTimerRef.current !== null) {
      window.clearTimeout(menuCloseTimerRef.current);
      menuCloseTimerRef.current = null;
    }
    const trigger = menuTriggerRefs.current[item.id];
    if (trigger) {
      const rect = trigger.getBoundingClientRect();
      setDropdownPosition({ top: rect.bottom + 4, left: rect.left });
    }
    setOpenMenuId(item.id);
  };

  // 마우스가 트리거에서 드롭다운으로 넘어가는 틈에 닫히지 않도록 약간 늦춰 닫는다
  const scheduleMenuClose = () => {
    if (menuCloseTimerRef.current !== null) {
      window.clearTimeout(menuCloseTimerRef.current);
    }
    menuCloseTimerRef.current = window.setTimeout(() => {
      setOpenMenuId(null);
      menuCloseTimerRef.current = null;
    }, 150);
  };

  // 마우스: hover 로 열리고 벗어나면 닫힘 → 클릭은 열기만. 터치·키보드: 누를 때마다 열기/닫기.
  // (hover 로 연 직후의 클릭이 토글로 곧바로 닫아 버리는 문제 방지 — 터치의 에뮬레이션 hover 도 동일)
  const toggleMenuDropdown = (item: TopMenuItem) => {
    const pointerType = lastMenuPointerTypeRef.current;
    lastMenuPointerTypeRef.current = '';
    if (openMenuId === item.id && pointerType !== 'mouse') {
      setOpenMenuId(null);
    } else {
      openMenuDropdown(item);
    }
  };

  // 링크+하위가 둘 다 있는 1단 — 마우스·키보드(Enter)는 바로 이동(펼침은 hover/포커스가 담당).
  // 터치·펜은 hover 가 없으므로 닫혀 있으면 첫 탭에 펼치기만 하고, 이미 열린 항목을 다시 탭하면 이동한다.
  const handleLinkedParentClick = (item: TopMenuItem) => {
    const pointerType = lastMenuPointerTypeRef.current;
    lastMenuPointerTypeRef.current = '';
    if ((pointerType === 'touch' || pointerType === 'pen') && openMenuId !== item.id) {
      openMenuDropdown(item);
      return;
    }
    openMenuLink(item);
  };

  // 링크+하위 1단의 키보드 포커스 — 포커스만으로 펼친다.
  // 마우스·터치로 누를 때 생기는 포커스는 제외해야 첫 탭 펼침 → 클릭 판정이 "이미 열림 → 이동"으로 뒤바뀌지 않는다.
  const handleLinkedParentFocus = (item: TopMenuItem, e: React.FocusEvent<HTMLElement>) => {
    let keyboardFocus = !lastMenuPointerTypeRef.current;
    try {
      keyboardFocus = e.currentTarget.matches(':focus-visible');
    } catch {
      // :focus-visible 미지원 브라우저 — 직전 pointerdown 기록 유무로 판정
    }
    if (keyboardFocus) openMenuDropdown(item);
  };

  // 포커스가 이 트리거와 드롭다운 밖(다음 메뉴 항목 포함)으로 나가면 닫는다 (relatedTarget 이 없으면 판단하지 않음)
  const handleMenuTriggerBlur = (e: React.FocusEvent<HTMLElement>) => {
    const next = e.relatedTarget as Node | null;
    if (!next) return;
    if (e.currentTarget.parentElement?.contains(next) || menuDropdownRef.current?.contains(next)) return;
    setOpenMenuId(null);
  };

  const openMenu = topMenuItems.find((item) => item.id === openMenuId) ?? null;
  const openMenuChildren = Array.isArray(openMenu?.children) ? openMenu.children : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    // G7Core.dispatch를 사용하여 logout 핸들러 호출
    // AuthManager가 토큰 삭제, 상태 초기화, 리다이렉트를 처리
    (window as any).G7Core?.dispatch?.({
      handler: 'logout',
    });
  };

  // 언어 변경 핸들러 — 헤더 독립 언어 버튼(코어 기능)에서 호출. setLocale 은 비회원도 동작.
  const handleLocaleChange = (locale: string) => {
    (window as any).G7Core?.dispatch?.({
      handler: 'setLocale',
      target: locale,
    });
    setShowLangMenu(false);
  };

  // 로케일 코드 → 표시명 (활성 언어팩 native_name 우선, 폴백 사전)
  const getLocaleName = (locale: string): string =>
    (window as any).G7Core?.state?.get?.('_global.appConfig.localeNames')?.[locale] ??
    (locale === 'ko' ? '한국어' : locale === 'en' ? 'English' : locale === 'ja' ? '日本語' : locale === 'zh' ? '中文' : locale === 'es' ? 'Español' : locale === 'fr' ? 'Français' : locale === 'de' ? 'Deutsch' : locale.toUpperCase());

  return (
    <HeaderBasic
      {...((editorAttrs ?? {}) as Record<string, never>)}
      className={`sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 ${className}`}
    >
      {/* 상단 바 */}
      <Div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Button onClick={() => navigate('/')} className="flex items-center gap-2 flex-shrink-0 cursor-pointer">
            {logo ? (
              <Img src={logo} alt={siteName} className="h-8" />
            ) : (
              <Span className="text-xl font-bold text-gray-900 dark:text-white">{siteName}</Span>
            )}
          </Button>

          {/* 검색바 (데스크톱 전용) */}
          {!isMobile && (
            <Form onSubmit={handleSearch} className="flex flex-1 max-w-lg mx-8">
              <Div className="relative w-full">
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('common.search_placeholder')}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <Icon
                  name="search"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500"
                />
              </Div>
            </Form>
          )}

          {/* 우측 액션 버튼들 */}
          <Div className="flex items-center gap-2">
            {/* 다크모드 전환 */}
            <ThemeToggle
              autoText={t('common.theme.auto')}
              lightText={t('common.theme.light')}
              darkText={t('common.theme.dark')}
            />

            {/* 알림센터 드롭다운 — 로그인 사용자에게만 노출 */}
            {user?.uuid && (
              <NotificationCenter
                notifications={notifications}
                unreadCount={notificationCount}
                hasMore={notificationHasMore}
                loading={notificationLoading}
                unreadOnly={notificationUnreadOnly}
                titleText={notificationTitleText ?? t('mypage.notifications.title')}
                emptyText={notificationEmptyText ?? t('mypage.notifications.empty')}
                markAllReadText={notificationMarkAllReadText ?? t('mypage.notifications.mark_all_read')}
                deleteAllText={notificationDeleteAllText ?? t('mypage.notifications.delete_all')}
                unreadOnlyText={notificationUnreadOnlyText ?? t('mypage.notifications.unread_only')}
                onClose={onNotificationClose}
                onNotificationClick={onNotificationClick}
                onLoadMore={onNotificationLoadMore}
                onMarkAllRead={onNotificationMarkAllRead}
                onDeleteAll={onNotificationDeleteAll}
                onDelete={onNotificationDelete}
                onUnreadOnlyToggle={onNotificationUnreadOnlyToggle}
                dropdownAlign="right"
              />
            )}

            {/* 언어 선택 — 헤더 독립 버튼(코어 기능, 비회원 포함 전체 노출). 공간 절약 위해 아이콘+로케일 코드만.
                언어는 항상 존재(이커머스 무관) → 템플릿 헤더 내장. */}
            {availableLocales && availableLocales.length > 1 && (
              <Div ref={langMenuRef} className="relative">
                <Button
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="flex items-center gap-1.5 px-2.5 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
                  aria-haspopup="listbox"
                  aria-expanded={showLangMenu}
                  aria-label={t('common.language')}
                >
                  <Icon name="globe" className="w-4 h-4" />
                  <Span className="font-medium uppercase">{currentLocale}</Span>
                  <Icon name="chevron-down" className="w-3 h-3" />
                </Button>
                {showLangMenu && (
                  <Div
                    role="listbox"
                    className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-50 overflow-hidden"
                  >
                    {availableLocales.map((locale) => {
                      const isActive = locale === currentLocale;
                      return (
                        <Button
                          key={locale}
                          role="option"
                          aria-selected={isActive}
                          onClick={() => handleLocaleChange(locale)}
                          className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 cursor-pointer transition-colors ${
                            isActive
                              ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          <Icon name="globe" className="w-4 h-4" />
                          <Span className="flex-1 font-medium">{getLocaleName(locale)}</Span>
                          {isActive && <Icon name="check" className="w-4 h-4" />}
                        </Button>
                      );
                    })}
                  </Div>
                )}
              </Div>
            )}

            {/* 통화 선택 — 이커머스 모듈이 'header_currency' 슬롯에 주입(layout_extensions).
                헤더는 슬롯 이름만 알고 통화/모듈을 모름. 모듈 비활성 시 빈 슬롯 → 미렌더(인프라 자동 게이트).
                id 지정 필수 — 같은 슬롯이 모바일 헤더 SlotContainer 와 동시 렌더되므로 주입 컴포넌트
                root id 가 컨테이너별로 스코프되도록(SlotContainer 가 id 로 자식 root id 를 고유화) 한다. */}
            <SlotContainer slotId="header_currency" id="header_currency_slot_desktop" className="flex items-center" />

            {/* 사용자 메뉴 */}
            {user?.uuid ? (
              <Div ref={userMenuRef} className="relative">
                <Button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  <Avatar
                    avatar={user.avatar}
                    name={user.name}
                    size="sm"
                  />
                  <Span className="hidden sm:inline text-sm font-medium">{user.name}</Span>
                  <Icon name="chevron-down" className="w-4 h-4" />
                </Button>

                {/* 드롭다운 메뉴 */}
                {showUserMenu && (
                  <Div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-50">
                    {/* 사용자 정보 헤더 */}
                    <Div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <Div className="flex items-center gap-3">
                        <Avatar
                          avatar={user.avatar}
                          name={user.name}
                          size="md"
                        />
                        <Div>
                          <Div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</Div>
                          <Div className="text-xs text-gray-500 dark:text-gray-400">{t('common.member')}</Div>
                        </Div>
                      </Div>
                    </Div>

                    {/* 메뉴 항목 */}
                    <Div className="py-1">
                      {/* 관리자 메뉴 (is_admin일 때만 표시) - 하이퍼링크로 전체 페이지 새로고침 */}
                      {user.is_admin && (
                        <>
                          <A
                            href="/admin"
                            className="block w-full text-left px-4 py-2 text-sm text-primary-600 dark:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer font-medium"
                          >
                            <Icon name="settings" className="inline w-4 h-4 mr-2" />
                            {t('common.admin_menu')}
                          </A>
                          <Hr className="my-1 border-gray-200 dark:border-gray-700" />
                        </>
                      )}
                      <Button onClick={() => { navigate('/mypage'); setShowUserMenu(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                        <Icon name="user" className="inline w-4 h-4 mr-2" />
                        {t('common.mypage')}
                      </Button>
                    </Div>

                    {/* 언어 선택은 헤더 독립 버튼으로 일원화(드롭다운에서 제거) — 비회원도 헤더에서 전환 가능 */}

                    <Hr className="my-1 border-gray-200 dark:border-gray-700" />
                    <Button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <Icon name="right-from-bracket" className="inline w-4 h-4 mr-2" />
                      {t('auth.logout')}
                    </Button>
                  </Div>
                )}
              </Div>
            ) : (
              <Div className="flex items-center gap-1.5">
                <Button
                  onClick={() => navigate('/login')}
                  className="px-2.5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer"
                >
                  {t('auth.login')}
                </Button>
                <Button
                  onClick={() => navigate('/register')}
                  className="ml-1 px-3 py-2 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 cursor-pointer"
                >
                  {t('auth.register_link')}
                </Button>
              </Div>
            )}

            {/* 모바일 햄버거 메뉴 (모바일 전용) */}
            {isMobile && (
              <Button
                onClick={onMobileMenuOpen}
                className="p-2 text-gray-600 dark:text-gray-400"
              >
                <Icon name="menu" className="w-6 h-6" />
              </Button>
            )}
          </Div>
        </Div>
      </Div>

      {/* 탭 네비게이션 (데스크톱 전용) */}
      {!isMobile && (
      <Nav className="border-t border-gray-200 dark:border-gray-800">
        <Div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Div className="flex items-center gap-1 h-12 overflow-x-auto">
            <Button onClick={() => navigate('/')} className={getNavButtonClass(isActiveRoute('/', true))} data-testid="nav-home">
              {t('nav.home')}
            </Button>
            <Button onClick={() => navigate('/boards/popular')} className={`flex items-center gap-1 ${getNavButtonClass(isActiveRoute('/boards/popular'))}`} data-testid="nav-popular">
              <Span className="text-orange-500">🔥</Span>
              {t('nav.popular')}
            </Button>

            {/* 상단 메뉴 (g7-easy-topmenu) — 링크+하위 1단은 hover·키보드 포커스·첫 터치 탭=펼침, 클릭·Enter=이동 / 링크 없는 1단은 이름 클릭=펼침 */}
            {topMenuItems.map((item) => {
              const children = Array.isArray(item.children) ? item.children : [];
              const hasChildren = children.length > 0;
              const isActive = isMenuItemActive(item);
              const isOpen = openMenuId === item.id;

              return (
                <Div
                  key={item.id}
                  ref={(el: HTMLDivElement | null) => {
                    menuTriggerRefs.current[item.id] = el;
                  }}
                  className="flex items-center flex-shrink-0"
                  onPointerDown={(e: React.PointerEvent) => {
                    lastMenuPointerTypeRef.current = e.pointerType;
                  }}
                  onPointerEnter={hasChildren ? (e: React.PointerEvent) => {
                    if (e.pointerType === 'mouse') openMenuDropdown(item);
                  } : undefined}
                  onPointerLeave={hasChildren ? (e: React.PointerEvent) => {
                    if (e.pointerType === 'mouse') scheduleMenuClose();
                  } : undefined}
                  data-testid={`topmenu-item-${item.id}`}
                >
                  {item.url ? (
                    <Button
                      onClick={() => (hasChildren ? handleLinkedParentClick(item) : openMenuLink(item))}
                      onFocus={hasChildren ? (e: React.FocusEvent<HTMLElement>) => handleLinkedParentFocus(item, e) : undefined}
                      onBlur={hasChildren ? handleMenuTriggerBlur : undefined}
                      className={`inline-flex items-center gap-1.5 ${getNavButtonClass(isActive)}`}
                      aria-haspopup={hasChildren ? 'menu' : undefined}
                      aria-expanded={hasChildren ? isOpen : undefined}
                    >
                      {item.icon && <Icon name={item.icon} className="w-4 text-center" />}
                      {item.name}
                      {item.is_external && <Span className="ml-1 text-xs opacity-60">↗</Span>}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => hasChildren && toggleMenuDropdown(item)}
                      className={`flex items-center gap-1.5 ${getNavButtonClass(isActive)}`}
                      aria-haspopup={hasChildren ? 'menu' : undefined}
                      aria-expanded={hasChildren ? isOpen : undefined}
                    >
                      {item.icon && <Icon name={item.icon} className="w-4 text-center" />}
                      {item.name}
                    </Button>
                  )}
                </Div>
              );
            })}

            {/* 상단 메뉴 하위 드롭다운 */}
            {openMenu && openMenuChildren.length > 0 && (
              <Div
                ref={menuDropdownRef}
                role="menu"
                className="fixed min-w-[12rem] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-50"
                style={{ top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px` }}
                onMouseEnter={() => openMenuDropdown(openMenu)}
                onMouseLeave={scheduleMenuClose}
                data-testid={`topmenu-dropdown-${openMenu.id}`}
              >
                {openMenuChildren.map((child) => {
                  const isChildActive = !!child.url && !child.is_external && isActiveRoute(child.url);
                  return (
                    <Button
                      key={child.id}
                      role="menuitem"
                      onClick={() => openMenuLink(child)}
                      className={`flex w-full items-center justify-between gap-3 text-left px-4 py-2 text-sm whitespace-nowrap cursor-pointer ${
                        isChildActive
                          ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Span className="inline-flex items-center gap-1.5">
                        {child.icon && <Icon name={child.icon} className="w-4 text-center opacity-80" />}
                        {child.name}
                      </Span>
                      {child.is_external && <Span className="text-xs opacity-60">↗</Span>}
                    </Button>
                  );
                })}
              </Div>
            )}
          </Div>
        </Div>
      </Nav>
      )}
    </HeaderBasic>
  );
};

export default Header;
