/**
 * wc-community 템플릿 핸들러 등록
 *
 * 이 파일에서 모든 커스텀 핸들러를 export합니다.
 * G7Core에서 자동으로 로드하여 사용할 수 있습니다.
 */

// 스토리지 관련 핸들러
import {
  saveToStorageHandler,
  loadFromStorageHandler,
} from './storageHandlers';

// 테마 관련 핸들러
import { setThemeHandler, initThemeHandler } from './setThemeHandler';

// 인증 리다이렉트 관련 핸들러
import { redirectToLoginWithReturnHandler } from './redirectToLoginWithReturn';

// 게시판 첨부 다운로드 핸들러 (토큰 동반 → 활동이력 행위자 기록)
import { downloadAttachmentHandler } from './downloadAttachment';
// 상단 메뉴 (g7-easy-topmenu 플러그인 활성 시에만 로드)
import { loadTopMenuHandler } from './loadTopMenu';

// 언어 관련 핸들러는 엔진 레벨(ActionDispatcher)에서 처리
// setLocale 핸들러는 ActionDispatcher에 빌트인으로 등록되어 있음

/**
 * wc-community 템플릿의 모든 커스텀 핸들러
 *
 * @example
 * // 레이아웃 JSON에서 사용
 * {
 *   "handler": "custom",
 *   "name": "setTheme",
 *   "params": { ... }
 * }
 */
export const handlers = {
  // 테마
  setTheme: setThemeHandler,
  initTheme: initThemeHandler,

  // 인증 리다이렉트 (비로그인 게시판/비밀글 진입 → /login?redirect=현재경로)
  redirectToLoginWithReturn: redirectToLoginWithReturnHandler,

  // 게시판 첨부 다운로드 (토큰 동반 → 활동이력 행위자 기록)
  downloadAttachment: downloadAttachmentHandler,
  // 상단 메뉴 (g7-easy-topmenu 플러그인 활성 시에만 로드)
  loadTopMenu: loadTopMenuHandler,

  // 언어: setLocale은 엔진 레벨(ActionDispatcher)에서 빌트인으로 처리

  // 스토리지
  saveToStorage: saveToStorageHandler,
  loadFromStorage: loadFromStorageHandler,
};

/**
 * 핸들러 맵 (handlerMap alias)
 *
 * index.ts에서 import할 때 사용
 */
export const handlerMap = handlers;

/**
 * 핸들러 타입 정의 (TypeScript 자동완성용)
 */
export type WcCommunityHandlers = typeof handlers;

// 개별 핸들러 export (직접 import용)
export {
  setThemeHandler,
  initThemeHandler,
  // 인증 리다이렉트
  redirectToLoginWithReturnHandler,
  // 게시판 첨부 다운로드
  downloadAttachmentHandler,
  // setLocaleHandler는 엔진 레벨에서 처리하므로 제거됨
  // 스토리지
  saveToStorageHandler,
  loadFromStorageHandler,
};
