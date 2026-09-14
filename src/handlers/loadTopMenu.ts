/**
 * loadTopMenu 핸들러 — g7-easy-topmenu 플러그인 상단 메뉴 로드
 *
 * 이 템플릿의 상단 메뉴(데스크톱 Header·모바일 메뉴)는 g7-easy-topmenu 플러그인 API 에 의존한다
 * (template.json `dependencies.plugins`). 플러그인이 비활성·미설치면 API 라우트 자체가 없어 404 가
 * 나므로, 서버가 내려준 활성 플러그인 목록(`G7Config.activePlugins`)을 먼저 보고 활성일 때만 요청한다.
 *
 * 결과는 `_global.topMenuItems` 에 둔다. 플러그인 부재·요청 실패 시 빈 배열 — 메뉴 영역만 비고
 * 헤더·모바일 메뉴의 나머지는 정상 렌더링된다.
 */

const PLUGIN_ID = 'g7-easy-topmenu';
const ENDPOINT = `/api/plugins/${PLUGIN_ID}/menu-items`;

/**
 * g7-easy-topmenu 플러그인이 활성 상태인지 (서버 렌더 시점의 활성 플러그인 목록 기준)
 */
export function isTopMenuPluginActive(): boolean {
  const activePlugins = (window as any).G7Config?.activePlugins;
  return Array.isArray(activePlugins) && activePlugins.some((plugin: any) => plugin?.identifier === PLUGIN_ID);
}

// 배열은 deep merge 시 이전 항목이 섞일 수 있어 키 단위로 교체한다
const setTopMenuItems = (items: unknown[]): void => {
  (window as any).G7Core?.state?.set?.({ topMenuItems: items }, { merge: 'shallow' });
};

/**
 * @param _action 액션 정의 (사용하지 않음)
 * @param _context 액션 컨텍스트 (사용하지 않음)
 */
export async function loadTopMenuHandler(_action?: any, _context?: any): Promise<void> {
  if (!isTopMenuPluginActive()) {
    setTopMenuItems([]);
    // 방문자 화면에는 아무것도 띄우지 않고, 관리자 콘솔에만 이유를 남긴다 (에러 아님)
    if ((window as any).G7Core?.state?.get?.('_global')?.currentUser?.is_admin) {
      console.info(`[wc-community] ${PLUGIN_ID} 플러그인이 비활성이라 상단 메뉴가 비어 있습니다.`);
    }
    return;
  }

  try {
    const response = await (window as any).G7Core?.api?.get?.(ENDPOINT);
    setTopMenuItems(Array.isArray(response?.data) ? response.data : []);
  } catch {
    setTopMenuItems([]);
  }
}
