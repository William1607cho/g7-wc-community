import { saveToStorageHandler, loadFromStorageHandler } from './storageHandlers';
import { setThemeHandler, initThemeHandler } from './setThemeHandler';
import { redirectToLoginWithReturnHandler } from './redirectToLoginWithReturn';
import { downloadAttachmentHandler } from './downloadAttachment';
import { loadTopMenuHandler } from './loadTopMenu';
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
export declare const handlers: {
    setTheme: typeof setThemeHandler;
    initTheme: typeof initThemeHandler;
    redirectToLoginWithReturn: typeof redirectToLoginWithReturnHandler;
    downloadAttachment: typeof downloadAttachmentHandler;
    loadTopMenu: typeof loadTopMenuHandler;
    saveToStorage: typeof saveToStorageHandler;
    loadFromStorage: typeof loadFromStorageHandler;
};
/**
 * 핸들러 맵 (handlerMap alias)
 *
 * index.ts에서 import할 때 사용
 */
export declare const handlerMap: {
    setTheme: typeof setThemeHandler;
    initTheme: typeof initThemeHandler;
    redirectToLoginWithReturn: typeof redirectToLoginWithReturnHandler;
    downloadAttachment: typeof downloadAttachmentHandler;
    loadTopMenu: typeof loadTopMenuHandler;
    saveToStorage: typeof saveToStorageHandler;
    loadFromStorage: typeof loadFromStorageHandler;
};
/**
 * 핸들러 타입 정의 (TypeScript 자동완성용)
 */
export type WcCommunityHandlers = typeof handlers;
export { setThemeHandler, initThemeHandler, redirectToLoginWithReturnHandler, downloadAttachmentHandler, saveToStorageHandler, loadFromStorageHandler, };
