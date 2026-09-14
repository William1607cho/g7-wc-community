/**
 * 로컬 스토리지 관련 핸들러
 *
 * 범용 localStorage 키/값 저장·로드를 처리합니다.
 *
 * 핸들러 시그니처: ActionDispatcher의 ActionHandler 형식을 따름
 * (action: ActionDefinition, context: ActionContext) => void | Promise<void>
 */

// Logger 설정 (G7Core 초기화 전에도 동작하도록 폴백 포함)
const logger = ((window as any).G7Core?.createLogger?.('Handler:Storage')) ?? {
  log: (...args: unknown[]) => console.log('[Handler:Storage]', ...args),
  warn: (...args: unknown[]) => console.warn('[Handler:Storage]', ...args),
  error: (...args: unknown[]) => console.error('[Handler:Storage]', ...args),
};

/**
 * 스토리지에 값 저장
 *
 * @param action 액션 정의 (params에 key, value 포함)
 * @param _context 액션 컨텍스트 (사용하지 않음)
 */
export function saveToStorageHandler(
  action?: any,
  _context?: any
): void {
  const { key, value } = action?.params || {};
  if (!key) {
    logger.warn('saveToStorage: key is required');
    return;
  }
  try {
    localStorage.setItem(key, value);
    logger.log('Saved to storage:', key, value);
  } catch {
    // localStorage 저장 실패 시 무시
  }
}

/**
 * 스토리지에서 값 로드
 *
 * @param action 액션 정의 (params에 key, defaultValue 포함)
 * @param _context 액션 컨텍스트 (사용하지 않음)
 */
export function loadFromStorageHandler(
  action?: any,
  _context?: any
): string | null {
  const { key, defaultValue } = action?.params || {};
  if (!key) {
    logger.warn('loadFromStorage: key is required');
    return defaultValue || null;
  }
  try {
    return localStorage.getItem(key) || defaultValue || null;
  } catch {
    return defaultValue || null;
  }
}
