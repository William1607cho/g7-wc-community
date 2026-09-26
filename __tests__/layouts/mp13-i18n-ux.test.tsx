/**
 * @file mp13-i18n-ux.test.tsx
 * @description MP13 — i18n·UX 소품 레이아웃 회귀 테스트 (sirsoft-basic)
 *
 * 검증 항목:
 * - U17: common.json 에 pagination aria-label 6키 (ko/en)
 *
 * wc-community(2026-09-26): 원본 Basic 의 U3·U21·A21·A5·U19④·취소 사유·주문 i18n 단언은
 * 주문·상품 레이아웃과 번역(mypage.order_detail)을 이 템플릿에서 지웠으므로 뺐다.
 *
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const baseDir = path.resolve(__dirname, '../..');

function loadJson(relPath: string): any {
  return JSON.parse(fs.readFileSync(path.resolve(baseDir, relPath), 'utf8'));
}

describe('U17 — 페이지네이션 aria-label 6키', () => {
  const ko = loadJson('lang/partial/ko/common.json');
  const en = loadJson('lang/partial/en/common.json');
  const keys = ['pagination', 'first_page', 'prev_page', 'next_page', 'last_page', 'page_n'];

  it('ko common.json 에 6키 정의', () => {
    keys.forEach((k) => expect(ko[k], `ko.${k}`).toBeTruthy());
    expect(ko.page_n).toContain('{{n}}');
  });

  it('en common.json 에 6키 정의', () => {
    keys.forEach((k) => expect(en[k], `en.${k}`).toBeTruthy());
    expect(en.page_n).toContain('{{n}}');
  });
});
