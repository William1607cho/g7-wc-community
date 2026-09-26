/**
 * 회원/마이페이지 도메인 편집기 샘플 데이터 계약 테스트
 *
 * 회원 화면(프로필/내정보수정/알림함/마이게시판/공개프로필)은 이 템플릿 레이아웃이며, 데이터소스를
 * 선언한 레이아웃 소유 확장이 템플릿이므로 편집기 샘플 SSoT 는 템플릿 editor-spec
 * (`editor-spec/sampleData.json`)의 `byDataSourceId` 다.
 *
 * 실제 Resource shape 대조:
 *  - user             : UserResource::toProfileArray + 게시판 notify 필터(core.user.filter_resource_data)
 *  - userNotifications: UserNotificationResource[] (data.data[] + unread_count/페이지네이션)
 *  - myPosts/myComments: 게시판 board-activities/my-comments (data.data[] + query/total)
 *  - stats/myActivityStats: BoardService 통계 (flat counter)
 *  - profile/postStats/recentPosts/userProfile/userPosts: 공개 프로필(users/show, users/posts)
 *
 * 바인딩 SSoT: layouts/mypage/{profile,profile-edit,notifications,board}.json,
 *              layouts/users/{show,posts}.json (+ partials).
 *
 * wc-community(2026-09-26): 이 템플릿 자신의 editor-spec 을 읽는다(예전에는 코어의
 * templates/_bundled/sirsoft-basic 것을 읽어 저장소 단독 실행에서 불러오기부터 실패했다).
 * 이커머스와 함께 지운 배송지(addresses)·상품 문의(myInquiries/qna) 샘플 단언과, 다른 템플릿
 * (sirsoft-admin_basic)의 스펙을 검사하던 묶음은 뺐다 — 그 템플릿의 테스트는 그 저장소 소관이다.
 */
import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

const SAMPLE_PATH = path.resolve(__dirname, '../../editor-spec/sampleData.json');
const STATES_PATH = path.resolve(__dirname, '../../editor-spec/states.json');

const sample = JSON.parse(fs.readFileSync(SAMPLE_PATH, 'utf-8'));
const byId = sample.byDataSourceId as Record<string, any>;
const states = JSON.parse(fs.readFileSync(STATES_PATH, 'utf-8'));

function hasStub(node: unknown): boolean {
  if (node === '샘플') return true;
  if (typeof node === 'string' && /^샘플\s/.test(node)) return true;
  if (Array.isArray(node)) {
    if (node.length === 1 && node[0] === '샘플') return true;
    return node.some(hasStub);
  }
  if (node && typeof node === 'object') return Object.values(node).some(hasStub);
  return false;
}

function get(obj: any, dotted: string): any {
  return dotted.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
}

function findGroup(specStates: any, match: string): any {
  return (specStates.groups || []).find((g: any) => g.scope?.match === match);
}

describe('회원/마이페이지 도메인 편집기 샘플 — wc-community', () => {
  const targets = [
    'user', 'userNotifications', 'myPosts', 'myComments',
    'stats', 'myActivityStats',
    'profile', 'postStats', 'recentPosts', 'userProfile', 'userPosts',
  ];

  it('지운 이커머스 샘플(배송지·상품 문의)이 남아 있지 않다', () => {
    for (const id of ['addresses', 'userAddresses', 'myInquiries', 'qna']) {
      expect(byId[id], id).toBeUndefined();
    }
  });

  describe('DoD #1 — 스텁 0', () => {
    for (const id of targets) {
      it(`${id} 하위에 "샘플" stub 이 없다`, () => {
        expect(byId[id]).toBeTruthy();
        expect(hasStub(byId[id])).toBe(false);
      });
    }
  });

  describe('DoD #5 — 실제 Resource shape (바인딩 경로 충족)', () => {
    it('user.data 는 프로필 바인딩 경로를 채운다 (name 은 문자열)', () => {
      const d = byId.user.data;
      expect(typeof d.name).toBe('string');
      expect(d.name.length).toBeGreaterThan(0);
      for (const p of [
        'nickname', 'email', 'avatar', 'language', 'language_label', 'country',
        'country_name', 'status', 'status_label', 'status_variant', 'homepage',
        'mobile', 'phone', 'zipcode', 'address', 'address_detail', 'signature',
        'bio', 'timezone', 'last_login_at', 'last_login_human', 'created_at',
      ]) {
        expect(d[p], `user.data.${p}`).toBeTruthy();
      }
      // 게시판 notify 필터 병합 — boolean 4종 (분기 on/off 공존)
      expect(typeof d.notify_post_complete).toBe('boolean');
      expect(typeof d.notify_comment).toBe('boolean');
      expect(d.notify_post_complete).not.toBe(d.notify_comment); // on/off 양면
      expect(d.is_super).toBe(false);
      expect(d.withdrawn_at).toBeNull();
      expect(d.abilities?.can_update).toBe(true);
    });

    it('userNotifications.data 는 페이지네이션 + 읽음/안읽음 분기', () => {
      const d = byId.userNotifications.data;
      expect(typeof d.unread_count).toBe('number');
      expect(d.current_page).toBe(1);
      expect(d.last_page).toBeGreaterThanOrEqual(1);
      expect(Array.isArray(d.data)).toBe(true);
      expect(d.data.length).toBeGreaterThanOrEqual(3);
      expect(d.data.some((n: any) => !n.read_at)).toBe(true); // 안읽음
      expect(d.data.some((n: any) => !!n.read_at)).toBe(true); // 읽음
      for (const n of d.data) {
        for (const p of ['id', 'type', 'type_label', 'subject', 'body', 'created_at']) {
          expect(n[p], `notification.${p}`).toBeTruthy();
        }
      }
    });

    it('myPosts.data.data 는 ≥3 + 비밀글 분기 + 검색 query/total', () => {
      const d = byId.myPosts.data;
      expect(Array.isArray(d.data)).toBe(true);
      expect(d.data.length).toBeGreaterThanOrEqual(3);
      expect(d.data.some((p: any) => p.is_secret === true)).toBe(true);
      expect(d.data.some((p: any) => p.is_secret === false)).toBe(true);
      expect(d.query).toBeTruthy();
      expect(typeof d.total).toBe('number');
      for (const p of d.data) {
        for (const k of ['id', 'board_slug', 'board_name', 'title', 'created_at_formatted']) {
          expect(p[k], `post.${k}`).toBeTruthy();
        }
        expect(typeof p.view_count).toBe('number');
        expect(typeof p.comment_count).toBe('number');
      }
    });

    it('myComments.data.data 는 ≥3 + post_id_val/post_title', () => {
      const d = byId.myComments.data;
      expect(d.data.length).toBeGreaterThanOrEqual(3);
      for (const c of d.data) {
        for (const k of ['post_id_val', 'post_title', 'board_slug', 'board_name', 'content', 'created_at_formatted']) {
          expect(c[k], `comment.${k}`).toBeTruthy();
        }
      }
    });

    it('stats / myActivityStats / postStats 는 카운터 전 경로를 채운다', () => {
      for (const k of ['users', 'posts', 'comments', 'boards']) {
        expect(typeof get(byId, `stats.data.${k}`), `stats.data.${k}`).toBe('number');
      }
      for (const k of ['total_posts', 'total_comments', 'total_views']) {
        expect(typeof get(byId, `myActivityStats.data.${k}`)).toBe('number');
      }
      for (const k of ['posts_count', 'comments_count', 'total_views']) {
        expect(typeof get(byId, `postStats.data.${k}`)).toBe('number');
      }
    });

    it('공개 프로필(profile/userProfile) + 글 목록(recentPosts/userPosts) shape', () => {
      expect(byId.profile.data.name).toBeTruthy();
      expect(byId.profile.data.status).toBe('active');
      // 샘플 값은 API 응답 body(`{data:...}`)만 — loading/error 형제 키를 두면 DataSourceManager
      // 가 응답을 .data 아래 이중 래핑해 profile.data.name 이 깨진다(MCP 실측 확인). data 단독 유지.
      expect(Object.keys(byId.profile)).toEqual(['data']);
      expect(byId.userProfile.data.name).toBeTruthy();
      for (const ds of ['recentPosts', 'userPosts']) {
        const list = get(byId, `${ds}.data.data`);
        expect(Array.isArray(list), ds).toBe(true);
        expect(list.length).toBeGreaterThanOrEqual(3);
        // status 분기(published/blinded) + 비밀글 분기 공존
        expect(list.some((p: any) => p.status === 'blinded'), `${ds} blinded`).toBe(true);
        expect(list.some((p: any) => p.is_secret === true), `${ds} secret`).toBe(true);
      }
    });
  });

  describe('DoD #3 — 상태 override 가 base 와 동일 shape', () => {
    it('empty_notifications override 는 base 와 동일 shape (data.data 배열만 비움)', () => {
      const g = findGroup(states, '/mypage/notifications');
      const empty = g.items.find((s: any) => s.id === 'empty_notifications');
      const ov = empty.sampleDataOverrides.byDataSourceId.userNotifications.data;
      // base 와 동일 키 집합
      expect(Array.isArray(ov.data)).toBe(true);
      expect(ov.data.length).toBe(0);
      expect(ov.unread_count).toBe(0);
      expect(ov.current_page).toBe(1);
      expect(ov.last_page).toBeGreaterThanOrEqual(1);
    });

    it('/users/:userId active/withdrawn override 는 profile base 충실 shape (name/bio/created_at 유지)', () => {
      const g = findGroup(states, '/users/:userId');
      const active = g.items.find((s: any) => s.id === 'active_user');
      const withdrawn = g.items.find((s: any) => s.id === 'withdrawn_user');
      for (const [st, status] of [[active, 'active'], [withdrawn, 'withdrawn']] as const) {
        const d = get(st, 'sampleDataOverrides.byDataSourceId.profile.data');
        expect(d, `${status} override profile.data`).toBeTruthy();
        // override 는 통째 교체 → 헤더 바인딩(name/created_at) 이 채워져야 캔버스 붕괴 없음
        expect(d.name, `${status}.name`).toBeTruthy();
        expect(d.created_at, `${status}.created_at`).toBeTruthy();
        expect(d.status).toBe(status);
        expect('uuid' in d).toBe(true);
      }
    });

    it('/users/:userId/posts no_posts override 는 userPosts base shape (data 배열만 비움)', () => {
      const g = findGroup(states, '/users/:userId/posts');
      const noPosts = g.items.find((s: any) => s.id === 'no_posts');
      const d = get(noPosts, 'sampleDataOverrides.byDataSourceId.userPosts.data');
      expect(Array.isArray(d.data)).toBe(true);
      expect(d.data.length).toBe(0);
      expect(d.total).toBe(0);
    });
  });
});
