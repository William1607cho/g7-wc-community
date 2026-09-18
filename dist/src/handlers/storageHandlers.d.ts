/**
 * 로컬 스토리지 관련 핸들러
 *
 * 범용 localStorage 키/값 저장·로드를 처리합니다.
 *
 * 핸들러 시그니처: ActionDispatcher의 ActionHandler 형식을 따름
 * (action: ActionDefinition, context: ActionContext) => void | Promise<void>
 */
/**
 * 스토리지에 값 저장
 *
 * @param action 액션 정의 (params에 key, value 포함)
 * @param _context 액션 컨텍스트 (사용하지 않음)
 */
export declare function saveToStorageHandler(action?: any, _context?: any): void;
/**
 * 스토리지에서 값 로드
 *
 * @param action 액션 정의 (params에 key, defaultValue 포함)
 * @param _context 액션 컨텍스트 (사용하지 않음)
 */
export declare function loadFromStorageHandler(action?: any, _context?: any): string | null;
