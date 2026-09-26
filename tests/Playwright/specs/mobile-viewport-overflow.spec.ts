/**
 * sirsoft-basic 모바일 뷰포트 가로 오버플로 회귀 E2E.
 *
 * 배경 (390x844 실측):
 * - 헤더 우측 그룹에 언어(71px)+통화(91px)가 있어 26개 라우트 중 24개에서
 *   document.scrollWidth = 401px (뷰포트 390px 대비 +11px).
 *   320px(iPhone SE)에서는 햄버거 버튼이 화면 밖으로 밀려 내비게이션 자체가 불가능했다.
 * - 비회원 댓글폼: 아바타 76px 들여쓰기 + flex-1 입력 2개 → 문서 +81px 초과
 * - 상품상세 쿠폰 칩: 라벨에 whitespace-nowrap 이 없어 39px 폭에서 2줄로 줄바꿈
 *
 * 조치:
 * - 언어/통화를 모바일 드로어(mobile_drawer_prefs)로 이동, 가로 칩으로 나열
 * - 통화/배송국가 주입 조각은 responsive.portable 로 모바일에서만 static 인라인 목록
 * - 데스크톱(≥1024px)은 기존 헤더 드롭다운 유지
 *
 * 후속 (드로어 세로 길이):
 * - 언어 / 통화·배송국가를 각각 독립 아코디언으로 접는다(기본 접힘). 접힘 상태에서도
 *   트리거에 현재값(언어명 / 통화·배송국가)을 요약 표기해 펼치지 않고 알 수 있게 한다.
 * - 언어=템플릿 소유(_global.mobileLanguageOpen), 통화=주입 조각 소유(_local.showCurrencyDropdown).
 *
 * 단위 테스트(Vitest)는 레이아웃 JSON 구조만 본다. 실제 브라우저 폭·줄 수·가시성은
 * 여기서만 검증된다 (위지윅 발행 회귀 #238 교훈).
 *
 * wc-community(2026-09-26): 헤더·드로어의 언어 선택을 숨기고 통화 선택은 이커머스와 함께 뺐다.
 * 드로어 선호설정 아코디언(mobile_drawer_prefs)·데스크톱 통화 드롭다운·상품 쿠폰 칩 검사는 그 화면이
 * 없어져 지웠고, 320px 햄버거 검사는 드로어(mobile_nav_drawer)가 열리는지로 확인한다.
 */
import { test, expect, type Page } from '@playwright/test';

/** 문서가 뷰포트보다 가로로 넘치는 px (0 이어야 정상) */
async function docOverflow(page: Page): Promise<number> {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
}

/**
 * 뷰포트를 벗어난 가시 요소 목록.
 *
 * 제외 대상 (자기 자신부터 조상까지 거슬러 올라가며 판정):
 *  - 숨김 요소(display/visibility/opacity)
 *  - 화면 밖으로 밀어둔 off-canvas 서브트리 — 닫힌 드로어(`translate-x-full`)
 *  - `position: fixed` 서브트리 — 문서 스크롤 폭에 기여하지 않는다.
 *    (예: PageTransitionIndicator 의 로딩 바는 translateX 애니메이션으로 한때
 *     `right > VW` 가 되지만 fixed 라 문서를 넓히지 않는다)
 *  - 조상이 `overflow-x: hidden|clip` 으로 잘라내는 요소
 *
 * 문서 전체 오버플로는 `docOverflow()` 가 별도로 본다. 이 함수는 "어떤 요소가 범인인가"를
 * 진단하기 위한 것이다.
 */
async function overflowingElements(page: Page): Promise<Array<{ id: string; cls: string }>> {
  return page.evaluate(() => {
    const VW = document.documentElement.clientWidth;
    const isExcluded = (el: Element): boolean => {
      let n: Element | null = el;
      while (n && n !== document.documentElement) {
        const cs = getComputedStyle(n);
        if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) {
          return true;
        }
        if (cs.position === 'fixed') return true;
        if (n !== el && /hidden|clip/.test(cs.overflowX)) return true;
        const r = n.getBoundingClientRect();
        if (r.width > 0 && (r.left >= VW - 1 || r.right <= 1)) return true;
        n = n.parentElement;
      }
      return false;
    };
    return [...document.body.querySelectorAll('*')]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height || isExcluded(el)) return false;
        return r.right > VW + 1 || r.left < -1;
      })
      .map((el) => ({ id: el.id, cls: String(el.className).slice(0, 60) }));
  });
}

test.describe('모바일 헤더/드로어 (390px)', () => {
  test('@smoke 홈에서 문서가 가로로 넘치지 않는다', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.locator('#mobile_menu_toggle')).toBeVisible({ timeout: 15_000 });

    expect(await docOverflow(page)).toBe(0);
    expect(await overflowingElements(page)).toEqual([]);
  });

  test('헤더 우측 그룹에 언어/통화 셀렉터가 없다', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.locator('#mobile_header_right')).toBeVisible({ timeout: 15_000 });

    await expect(page.locator('#mobile_header_right #mobile_lang_selector_wrap')).toHaveCount(0);
    await expect(page.locator('#mobile_header_right #mobile_currency_selector_wrap')).toHaveCount(0);
  });

  test('드로어에 언어/통화 선호설정 영역이 없다', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.locator('#mobile_menu_toggle').click();

    await expect(page.locator('#mobile_nav_drawer')).toBeVisible();
    await expect(page.locator('#mobile_drawer_prefs')).toHaveCount(0);
    expect(await docOverflow(page)).toBe(0);
  });

  test('320px 에서도 햄버거 버튼을 누를 수 있다 (내비게이션 접근성)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 844 });
    await page.goto('/');

    const toggle = page.locator('#mobile_menu_toggle');
    // toBeInViewport 는 요소 존재를 기다리지 않는다(기본 5s 안에 하이드레이션이 끝나지 않으면
    // element(s) not found). 병렬 워커 부하에서 플레이키했으므로 먼저 가시성을 기다린다.
    await expect(toggle).toBeVisible({ timeout: 15_000 });
    await expect(toggle).toBeInViewport();
    expect(await docOverflow(page)).toBe(0);

    await toggle.click();
    await expect(page.locator('#mobile_nav_drawer')).toBeVisible();
    expect(await docOverflow(page)).toBe(0);
  });
});

test.describe('비회원 폼 (390px)', () => {
  test('게시판 글쓰기폼의 이름/비밀번호가 세로로 쌓인다', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/board/free/write');

    const pw = page.locator('input[type="password"]').first();
    await expect(pw).toBeVisible({ timeout: 15_000 });

    // 압착(147px) 이 아니라 전체폭에 가까워야 한다
    const box = await pw.boundingBox();
    expect(box!.width).toBeGreaterThan(250);
    expect(await docOverflow(page)).toBe(0);
  });
});
