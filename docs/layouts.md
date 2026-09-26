# Basic — 레이아웃

> 레이아웃 목록과 라우트 매핑 · 진입점: [AGENTS.md](../AGENTS.md)

## 레이아웃 목록

<!-- @generated:layouts START — ext:docgen 이 갱신. 이 블록 안은 직접 수정하지 않는다 -->
레이아웃 80개 (루트: `layouts`).

| 그룹 | 개수 |
|---|---|
| `(root)` | 2개 |
| `auth` | 5개 |
| `board` | 5개 |
| `errors` | 6개 |
| `mypage` | 5개 |
| `page` | 1개 |
| `partials` | 53개 |
| `search` | 1개 |
| `users` | 2개 |

| 레이아웃 | 그룹 | 종류 | extends |
|---|---|---|---|
| `_user_base` | `(root)` | partial | - |
| `forgot_password` | `auth` | 화면 | `_user_base` |
| `identity_challenge` | `auth` | 화면 | `_user_base` |
| `login` | `auth` | 화면 | `_user_base` |
| `register` | `auth` | 화면 | `_user_base` |
| `reset_password` | `auth` | 화면 | `_user_base` |
| `boards` | `board` | 화면 | `_user_base` |
| `form` | `board` | 화면 | `_user_base` |
| `index` | `board` | 화면 | `_user_base` |
| `popular` | `board` | 화면 | `_user_base` |
| `show` | `board` | 화면 | `_user_base` |
| `401` | `errors` | 화면 | `_user_base` |
| `403` | `errors` | 화면 | `_user_base` |
| `404` | `errors` | 화면 | `_user_base` |
| `500` | `errors` | 화면 | `_user_base` |
| `503` | `errors` | 화면 | `_user_base` |
| `maintenance` | `errors` | 화면 | `_user_base` |
| `home` | `(root)` | 화면 | `_user_base` |
| `board` | `mypage` | 화면 | `_user_base` |
| `change-password` | `mypage` | 화면 | `_user_base` |
| `notifications` | `mypage` | 화면 | `_user_base` |
| `profile-edit` | `mypage` | 화면 | `_user_base` |
| `profile` | `mypage` | 화면 | `_user_base` |
| `show` | `page` | 화면 | `_user_base` |
| `_identity_challenge_modal` | `partials` | partial | - |
| `_modal_notification_delete_all_confirm` | `partials` | partial | - |
| `_login_form` | `partials` | partial | - |
| `_modal_privacy` | `partials` | partial | - |
| `_modal_terms` | `partials` | partial | - |
| `_redirect_if_logged_in` | `partials` | partial | - |
| `_register_form` | `partials` | partial | - |
| `_board_card` | `partials` | partial | - |
| `_parent_post` | `partials` | partial | - |
| `_password_verify_modal` | `partials` | partial | - |
| `_post_form` | `partials` | partial | - |
| `_type_renderer` | `partials` | partial | - |
| `_admin_links` | `partials` | partial | - |
| `_empty_states` | `partials` | partial | - |
| `_loading_error` | `partials` | partial | - |
| `_type_renderer` | `partials` | partial | - |
| `_write_button` | `partials` | partial | - |
| `_popular_item` | `partials` | partial | - |
| `_popular_list` | `partials` | partial | - |
| `_comment_input` | `partials` | partial | - |
| `_comment_item` | `partials` | partial | - |
| `_comment_section` | `partials` | partial | - |
| `_navigation` | `partials` | partial | - |
| `_post_attachments` | `partials` | partial | - |
| `_reply_section` | `partials` | partial | - |
| `_type_renderer` | `partials` | partial | - |
| `_modal_delete` | `partials` | partial | - |
| `_modal_report` | `partials` | partial | - |
| `_password_verify_modal` | `partials` | partial | - |
| `_wiki_front_button` | `partials` | partial | - |
| `_wiki_reroll_button` | `partials` | partial | - |
| `form` | `partials` | 화면 | - |
| `index` | `partials` | 화면 | - |
| `show` | `partials` | 화면 | - |
| `index` | `partials` | 화면 | - |
| `index` | `partials` | 화면 | - |
| `_tab_navigation` | `partials` | partial | - |
| `_list` | `partials` | partial | - |
| `_my_comments` | `partials` | partial | - |
| `_my_posts` | `partials` | partial | - |
| `_list` | `partials` | partial | - |
| `_edit` | `partials` | partial | - |
| `_modal_withdraw` | `partials` | partial | - |
| `_password_verify_section` | `partials` | partial | - |
| `_view` | `partials` | partial | - |
| `_search_filters` | `partials` | partial | - |
| `_search_input` | `partials` | partial | - |
| `_search_results` | `partials` | partial | - |
| `_search_states` | `partials` | partial | - |
| `_search_tabs` | `partials` | partial | - |
| `_section` | `partials` | partial | - |
| `_list` | `partials` | partial | - |
| `_section` | `partials` | partial | - |
| `index` | `search` | 화면 | `_user_base` |
| `posts` | `users` | 화면 | `_user_base` |
| `show` | `users` | 화면 | `_user_base` |
<!-- @generated:layouts END -->

<!-- @intent START -->
80개 중 **49개가 partial** 입니다(화면 31). 이 비율이 이 템플릿의 구조를 그대로 보여줍니다 —
화면 하나가 여러 조각으로 나뉘어 있고, 조각은 여러 화면이 공유합니다. 화면 하나를 고칠 때는
그 화면 이름의 partials 디렉토리를 함께 열어야 전체가 보입니다.

그룹은 방문자 여정과 1:1 입니다 — `auth`(로그인·가입·비밀번호·본인인증) · `board`(게시판) ·
`mypage`(마이페이지) · `page`(단일 문서) · `search` · `users` · `errors`.
`(root)` 둘은 `_user_base`(모든 화면의 베이스)와 `home` 입니다.

**모든 화면이 `_user_base` 를 상속합니다.** 헤더·푸터·모바일 네비·토스트·모달 호스트가 거기
있으므로, `extends` 없이 독립 레이아웃을 새로 만들면 그 화면에서는 `toast` 나 `openModal` 이
성공으로 기록되지만 **화면에는 아무것도 나타나지 않습니다**(호스트 컴포넌트가 마운트되지 않아서).
새 화면은 특별한 이유가 없는 한 `_user_base` 를 상속합니다.

`errors/` 6종(401·403·404·500·503·maintenance)은 코어가 오류 상황에서 직접 부릅니다. 401 은
**로그인 리다이렉트를 여기서 구현하지 않습니다** — 코어 `TemplateApp.showRouteError` 가드가
처리하므로, 이 레이아웃에서 다시 이동시키면 이중 리다이렉트가 됩니다.
<!-- @intent END -->

## 라우트 매핑

<!-- @generated:layout-map START — ext:docgen 이 갱신. 이 블록 안은 직접 수정하지 않는다 -->
| 경로 | 레이아웃 | 이름 |
|---|---|---|
| `/` | `home` | - |
| `/login` | `auth/login` | - |
| `/register` | `auth/register` | - |
| `/forgot-password` | `auth/forgot_password` | - |
| `/reset-password` | `auth/reset_password` | - |
| `/identity/challenge` | `auth/identity_challenge` | - |
| `/boards` | `board/boards` | - |
| `/boards/popular` | `board/popular` | - |
| `/board/:slug` | `board/index` | - |
| `/board/:slug/write` | `board/form` | - |
| `/board/:slug/:id` | `board/show` | - |
| `/board/:slug/:id/edit` | `board/form` | - |
| `/mypage` | `-` | - |
| `/mypage/profile` | `mypage/profile` | - |
| `/mypage/profile/edit` | `mypage/profile-edit` | - |
| `/mypage/change-password` | `mypage/change-password` | - |
| `/mypage/notifications` | `mypage/notifications` | - |
| `/mypage/board` | `mypage/board` | - |
| `/users/:userId` | `users/show` | - |
| `/users/:userId/posts` | `users/posts` | - |
| `/page/:slug` | `page/show` | - |
| `/search` | `search/index` | - |
| `/404` | `errors/404` | - |
| `/403` | `errors/403` | - |
| `/500` | `errors/500` | - |
<!-- @generated:layout-map END -->

<!-- @intent START -->
라우트는 모두 정적 경로입니다(원본 Basic 의 상점 경로 표현식 라우트는 이 템플릿에서 뺐습니다).

`/mypage` 자체는 레이아웃이 `-` 입니다 — 진입하면 하위 탭 중 하나로 넘기는 자리이며 자기
화면을 갖지 않습니다.

라우트를 바꾸면 `php artisan template:update sirsoft-basic --force` 로 반영합니다. 빌드는
필요 없습니다.
<!-- @intent END -->

## 확장 오버라이드

<!-- @generated:template-overrides START — ext:docgen 이 갱신. 이 블록 안은 직접 수정하지 않는다 -->
| 대상 | 설명 |
|---|---|
| `extensions/sirsoft-daum_postcode/user-address-search.json` | 모듈/플러그인 확장 조각을 대체하는 오버라이드 |
<!-- @generated:template-overrides END -->

<!-- @intent START -->
오버라이드는 **확장이 제공한 조각을 이 템플릿의 것으로 갈아 끼우는** 장치입니다. 지금은 하나
있습니다 — `sirsoft-daum_postcode` 의 주소 검색 조각.

플러그인이 제공하는 원본 조각은 관리자 화면에 맞춰져 있어, 방문자 화면(회원정보 수정)의 주소 입력
디자인과 어긋납니다. 조각을 고치는 대신 **템플릿이 자기 버전을 얹는** 것이 이 방향입니다 —
플러그인을 업데이트해도 이 오버라이드는 남고, 다른 템플릿은 원본을 그대로 씁니다.

그 대가로 **원본이 바뀌면 이 사본은 따라가지 않습니다.** 플러그인이 조각의 동작(핸들러 이름·
필드 계약)을 바꾸면 오버라이드만 옛 계약을 붙들고 있게 되고, 증상은 "주소 검색 버튼이
무반응" 으로만 나타납니다. 해당 플러그인을 업그레이드한 뒤에는 이 오버라이드를 함께 확인합니다.
<!-- @intent END -->

## 이관 원문 상세

> 아래는 코어 `docs/frontend/templates/sirsoft-basic/layouts.md` 에 있던 원문을 이 문서로 옮긴 것입니다(#601). 이관 시점 그대로
> 보존하되, **코드가 SSoT 인 값과 어긋나는 부분에는 정정 주석**을 달았습니다.

### sirsoft-basic 레이아웃

> **템플릿 식별자**: `sirsoft-basic` (type: user)
> **관련 문서**: [컴포넌트](components.md) | [핸들러](handlers.md) | [레이아웃 JSON 스키마](../../../../docs/frontend/layout-json.md)

> **정정(#601)**: 아래 페이지 맵·개수는 이관 시점 값입니다. 실측 총계와 그룹별 분포는 위
> 「레이아웃 목록」 블록이 SSoT 이며, 이관 이후 추가·삭제된 레이아웃이 있을 수 있습니다.

---

### TL;DR (5초 요약)

```text
1. 베이스: _user_base.json (헤더 + 푸터 + 모바일 네비 + 콘텐츠 슬롯)
2. 코어 페이지 30개+: 인증, 게시판, 마이페이지, 검색, 프로필
3. Partial 100개+: 폼, 모달, 탭, 카드, 목록, 필터, 타입별 렌더러
4. 에러 페이지 6개: 401, 403, 404, 500, 503, maintenance
5. 패턴: 게시판(타입별 렌더러), 마이페이지(탭 네비게이션)
```

---

### 목차

1. [페이지 맵 (트리 구조)](#페이지-맵-트리-구조)
2. [카테고리별 가이드](#카테고리별-가이드)
   - [인증 페이지 패턴](#인증-페이지-패턴)
   - [게시판 패턴](#게시판-패턴)
   - [마이페이지 패턴](#마이페이지-패턴)
   - [검색 패턴](#검색-패턴)
   - [기타 페이지 패턴](#기타-페이지-패턴)
   - [에러 페이지 패턴](#에러-페이지-패턴)

---

### 페이지 맵 (트리 구조)

```text
_user_base.json (베이스 레이아웃)
│
├── home.json (홈/대시보드)
│   └── partials/home/
│       ├── _welcome_card.json (환영 카드)
│       ├── _stat_card_users.json (통계: 사용자)
│       ├── _stat_card_posts.json (통계: 게시글)
│       ├── _stat_card_comments.json (통계: 댓글)
│       ├── _stat_card_boards.json (통계: 게시판)
│       ├── _recent_posts.json (최근 게시글)
│       ├── _popular_boards.json (인기 게시판)
│       ├── _board_summary.json (게시판 요약)
│       └── _community_guide.json (커뮤니티 가이드)
│
├── 인증 (auth/)
│   ├── login.json (로그인)
│   ├── register.json (회원가입)
│   ├── forgot_password.json (비밀번호 찾기)
│   ├── reset_password.json (비밀번호 재설정)
│   └── partials/auth/
│       ├── _login_form.json (로그인 폼)
│       ├── _register_form.json (회원가입 폼)
│       ├── _redirect_if_logged_in.json (로그인 상태 리다이렉트)
│       ├── _modal_terms.json (이용약관 모달)
│       └── _modal_privacy.json (개인정보 처리방침 모달)
│
├── 게시판 (board/)
│   ├── boards.json (게시판 목록)
│   │   └── partials/board/boards/
│   │       └── _board_card.json (게시판 카드)
│   ├── index.json (게시글 목록)
│   │   └── partials/board/index/
│   │       ├── _type_renderer.json (타입별 렌더러 분기)
│   │       ├── _empty_states.json (빈 상태)
│   │       ├── _loading_error.json (로딩/에러)
│   │       └── _write_button.json (글쓰기 버튼)
│   ├── show.json (게시글 상세)
│   │   └── partials/board/show/
│   │       ├── _type_renderer.json (타입별 렌더러 분기)
│   │       ├── _comment_section.json (댓글 섹션)
│   │       ├── _comment_item.json (댓글 아이템)
│   │       ├── _comment_input.json (댓글 입력)
│   │       ├── _reply_section.json (답글 섹션)
│   │       ├── _navigation.json (이전글/다음글)
│   │       ├── _post_attachments.json (첨부파일)
│   │       └── modals/
│   │           ├── _modal_delete.json (삭제 확인)
│   │           ├── _modal_report.json (신고)
│   │           └── _password_verify_modal.json (비밀번호 확인)
│   ├── form.json (게시글 작성/수정)
│   │   └── partials/board/form/
│   │       ├── _post_form.json (게시글 폼)
│   │       ├── _parent_post.json (원글 표시)
│   │       ├── _type_renderer.json (타입별 렌더러 분기)
│   │       └── _password_verify_modal.json (비밀번호 확인)
│   ├── popular.json (인기글)
│   │   └── partials/board/popular/
│   │       ├── _popular_list.json (인기글 리스트)
│   │       └── _popular_item.json (인기글 아이템)
│   └── partials/board/types/ (게시판 타입별 부분 레이아웃)
│       ├── basic/
│       │   ├── index.json (기본 목록)
│       │   ├── show.json (기본 상세)
│       │   └── form.json (기본 폼)
│       ├── card/
│       │   └── index.json (카드형 목록)
│       └── gallery/
│           └── index.json (갤러리형 목록)
│
├── 마이페이지 (mypage/)
│   ├── profile.json (프로필 보기)
│   ├── profile-edit.json (프로필 수정)
│   │   └── partials/mypage/profile/
│   │       ├── _view.json (프로필 보기 섹션)
│   │       ├── _edit.json (프로필 수정 섹션)
│   │       ├── _password_verify_section.json (비밀번호 확인)
│   │       └── _modal_withdraw.json (회원 탈퇴)
│   ├── board.json (내 게시글/댓글)
│   │   └── partials/mypage/board/
│   │       ├── _list.json (탭 목록)
│   │       ├── _my_posts.json (내 게시글)
│   │       └── _my_comments.json (내 댓글)
│   ├── notifications.json (알림)
│   │   └── partials/mypage/notifications/
│   │       └── _list.json (알림 목록)
│   ├── change-password.json (비밀번호 변경)
│   └── partials/mypage/
│       └── _tab_navigation.json (마이페이지 공통 탭)
│
├── 검색 (search/)
│   └── index.json (통합 검색)
│       └── partials/search/
│           ├── _search_input.json (검색 입력)
│           ├── _search_tabs.json (검색 탭)
│           ├── _search_filters.json (검색 필터)
│           ├── _search_results.json (검색 결과)
│           ├── _search_states.json (검색 상태)
│           ├── posts/
│           │   ├── _section.json (게시글 결과 섹션)
│           │   └── _list.json (게시글 결과 목록)
│           └── pages/
│               └── _section.json (페이지 결과 섹션)
│
├── 사용자 (users/)
│   ├── show.json (사용자 프로필)
│   └── posts.json (사용자 게시글)
│
├── 페이지 (page/)
│   └── show.json (정적 페이지)
│
└── 에러 페이지 (errors/)
    ├── 401.json (인증 필요)
    ├── 403.json (접근 거부)
    ├── 404.json (페이지 없음)
    ├── 500.json (서버 오류)
    ├── 503.json (서비스 불가)
    └── maintenance.json (점검 중)
```

---

### 카테고리별 가이드

#### 인증 페이지 패턴

**대표**: `auth/login.json`, `auth/register.json`

**구성**:
```text
extends: _user_base
slots.content:
  └── Flex (중앙 정렬)
      ├── _redirect_if_logged_in.json (로그인 시 리다이렉트)
      └── Div (카드 스타일 래퍼)
          ├── H2 (제목)
          ├── partial: _login_form.json 또는 _register_form.json
          └── 하단 링크 (회원가입/로그인 전환, 비밀번호 찾기)
```

**특수사항**:
- `_redirect_if_logged_in.json`: 이미 로그인한 사용자를 홈으로 리다이렉트하는 partial
- 로그인 폼은 `SocialLoginButtons` 포함 (소셜 로그인 지원)
- 회원가입 폼은 `PasswordInput` 사용 (비밀번호 규칙 검증, 확인 일치)
- 약관 동의 모달: `_modal_terms.json`, `_modal_privacy.json`
- `blur_until_loaded`: 현재 사용자 정보 로드 전까지 폼 블러 처리

**핸들러 패턴**:
- `apiCall` — 로그인 (POST `/api/auth/login`), 회원가입 (POST `/api/auth/register`)
- `navigate` — 성공 후 홈/대시보드로 이동
- `setState` — 폼 에러, 로딩 상태

**2단계 인증(인증번호) 단계**

관리자가 보안 설정에서 2단계 인증을 켠 사이트에서는 로그인 응답이 두 형태로 갈립니다 —
정상 로그인과 인증번호 요구(challenge)입니다. `_login_form.json` 은 그 둘을 **같은 카드 안에서**
단계 전환으로 처리합니다.

- 1단계(이메일·비밀번호) 블록은 `if: "{{!_global.twoFactor?.required}}"`, 2단계(인증번호) 블록은
  그 부정형을 답니다. 두 `if` 는 언제나 상보여야 합니다 — 한쪽만 고치면 두 단계가 겹쳐 보이거나
  둘 다 사라집니다.
- 제출 시퀀스의 `login` 과 `loginTwoFactor` 도 같은 쌍으로 상호배타입니다. `loginTwoFactor` 쪽
  `if` 가 빠지면 인증번호 단계에서 Enter 를 눌렀을 때 새 challenge 가 발급되어 흐름이 끊깁니다.
- 인증번호 입력은 controlled 입니다(`value` + `onChange` 의 `setState` 쌍). `events: {}` 래퍼는
  쓰지 않습니다.
- 화면 진입 시 `auth/login.json` 의 `init_actions` 첫 액션이 `twoFactor` 를 `null` 로 되돌립니다.
  전역 상태라 화면을 떠나도 남기 때문에, 이 리셋이 없으면 다시 들어왔을 때 1단계가 보이지 않습니다.
- 만료 시각은 정적 표기입니다(`| datetime`). 카운트다운을 쓰지 않습니다 — `startInterval` 은 등록
  시점 컨텍스트를 고정하고 정지 호출처가 없어 화면을 떠난 뒤에도 남습니다.

**금지 — 같은 시퀀스·onSuccess 안에서 방금 저장한 상태를 다시 읽지 않습니다**

`setState target:global` 직후 형제 액션의 `if` 나 값으로 `_global.*` 를 재독하면 갱신 이전 값을
읽습니다(시퀀스 처리기는 `_local` 만 갱신합니다). 그 자리에서는 `{{response.*}}` 만 씁니다.
오류도 경고도 남지 않고 분기만 조용히 어긋나므로 화면을 보지 않으면 드러나지 않습니다.

---

#### 게시판 패턴

**대표**: `board/index.json`, `board/show.json`, `board/form.json`

**구성**:
```text
extends: _user_base
data_sources: [posts (게시글 목록/상세)]
slots.content:
  └── Container
      ├── 타입 렌더러 (_type_renderer.json)
      │   → 게시판 타입에 따라 분기:
      │   ├── basic/index.json (기본 테이블형)
      │   ├── card/index.json (카드형)
      │   └── gallery/index.json (갤러리형)
      ├── Pagination
      └── 글쓰기 버튼 (_write_button.json)
```

**data_sources**:
```json
{
  "id": "posts",
  "endpoint": "/api/modules/sirsoft-board/boards/{{route.slug}}/posts",
  "method": "GET",
  "params": {
    "page": "{{query.page ?? 1}}",
    "search": "{{query.search ?? ''}}",
    "category": "{{query.category ?? ''}}"
  },
  "auto_fetch": true,
  "refetchOnMount": true,
  "errorHandling": {
    "403": { "handler": "showErrorPage", "params": { "target": "content" } }
  }
}
```

**타입별 렌더러 시스템**:
게시판은 `board_type` 필드에 따라 다른 레이아웃을 렌더링합니다:
- `basic` — 테이블형 게시글 목록 (기본)
- `card` — 카드 그리드형 목록
- `gallery` — 이미지 갤러리형 목록

```text
_type_renderer.json (조건 분기):
  ├── if: board_type === 'basic' → partial: types/basic/index.json
  ├── if: board_type === 'card' → partial: types/card/index.json
  └── if: board_type === 'gallery' → partial: types/gallery/index.json
```

**게시글 상세 구성**:
```text
show.json:
  └── _type_renderer.json → types/basic/show.json
      ├── 게시글 본문 (HtmlContent)
      ├── _post_attachments.json (첨부파일)
      ├── PostReactions (리액션)
      ├── _comment_section.json
      │   ├── _comment_input.json (댓글 입력)
      │   └── _comment_item.json (댓글 아이템, iteration)
      │       └── _reply_section.json (답글)
      ├── _navigation.json (이전/다음 글)
      └── modals: 삭제, 신고, 비밀번호 확인
```

**게시글 작성/수정 구성**:
```text
form.json:
  ├── _parent_post.json (답글 시 원글 표시)
  └── _post_form.json
      ├── Input (제목)
      ├── Select (카테고리)
      ├── HtmlEditor (본문)
      ├── FileUploader (첨부파일)
      ├── Checkbox (공지, 비밀글 등)
      └── Button (저장/취소)
```

**핸들러 패턴**:
- `apiCall` — CRUD, 댓글 작성/삭제, 리액션, 신고
- `navigate` — 게시판 이동, 글 상세/목록 이동
- `setState` — 검색, 필터, 페이지네이션, 댓글 접기/펼치기
- `replaceUrl` — 페이지네이션 시 URL만 변경

---

#### 마이페이지 패턴

**대표**: `mypage/profile.json`, `mypage/board.json`

**구성**:
```text
extends: _user_base
computed: { currentTab: "profile" }
data_sources: [user (인증 사용자 정보)]
transition_overlay: { target: "mypage_tab_content" }
slots.content:
  └── Div
      ├── _tab_navigation.json (공통 마이페이지 탭)
      │   → 프로필, 게시글, 알림
      └── 탭별 콘텐츠 영역
```

**탭 구조**:
각 마이페이지 하위 페이지는 동일한 `_tab_navigation.json`을 공유하되, `computed.currentTab`으로 활성 탭을 구분합니다.

| 탭 | 레이아웃 | Partial |
|---|---------|---------|
| 프로필 | `profile.json` | `_view.json` |
| 프로필 수정 | `profile-edit.json` | `_edit.json`, `_password_verify_section.json`, `_modal_withdraw.json` |
| 내 게시글 | `board.json` | `_my_posts.json`, `_my_comments.json` |
| 알림 | `notifications.json` | `_list.json` |
| 비밀번호 변경 | `change-password.json` | (인라인) |

**핸들러 패턴**:
- `apiCall` — 프로필 수정, 알림 읽음 처리
- `navigate` — 탭 간 이동 (별도 페이지)
- `setState` — 폼 상태, 모달 제어
- `openModal`/`closeModal` — 탈퇴, 주소 편집, 삭제 확인

---

#### 검색 패턴

**대표**: `search/index.json`

**구성**:
```text
extends: _user_base
state: { q: "" }
init_actions: [setState — query 파라미터에서 검색어 추출]
global_state: { searchActiveTab, searchBoardFilter, searchSortBy, searchPage }
data_sources: [searchPosts, searchPages]
slots.content:
  └── Container
      ├── _search_input.json (검색 입력 — SearchBar)
      ├── _search_tabs.json (탭: 전체/게시글/페이지)
      ├── _search_filters.json (정렬, 게시판 필터)
      ├── _search_states.json (검색 전/로딩/결과없음 상태)
      └── _search_results.json (결과 표시)
          ├── posts/_section.json → posts/_list.json
          └── pages/_section.json
```

**특수사항**:
- 통합 검색: 게시글 + 페이지 동시 검색
- `searchActiveTab`으로 탭 전환 시 해당 카테고리만 표시
- `global_state`로 검색 상태 유지 (탭, 필터, 정렬, 페이지)

**핸들러 패턴**:
- `apiCall` — 검색 API (게시글, 페이지 별도)
- `setState` — 탭 전환, 필터, 정렬
- `replaceUrl` — 검색어/필터 변경 시 URL 갱신

---

#### 기타 페이지 패턴

##### 사용자 프로필 (users/show.json, users/posts.json)

```text
extends: _user_base
data_sources: [user (공개 프로필)]
slots.content:
  └── Container
      ├── Avatar + 사용자 정보
      └── 게시글 목록 (users/posts.json)
```

##### 정적 페이지 (page/show.json)

```text
extends: _user_base
data_sources: [page (페이지 콘텐츠)]
slots.content:
  └── Container
      └── HtmlContent (본문 렌더링)
```

##### 홈 (home.json)

```text
extends: _user_base
data_sources: [stats, recent_posts, popular_boards]
meta.seo: { structured_data: WebSite }
slots.content:
  └── Container
      ├── _welcome_card.json (환영 배너)
      ├── Grid (통계 카드 4개)
      │   ├── _stat_card_users.json
      │   ├── _stat_card_posts.json
      │   ├── _stat_card_comments.json
      │   └── _stat_card_boards.json
      ├── _recent_posts.json (최근 게시글)
      ├── _popular_boards.json (인기 게시판)
      ├── _board_summary.json (게시판 요약)
      └── _community_guide.json (가이드)
```

> **정정(wc-community)**: 홈은 템플릿 블록을 모두 뺐고 `main_content` 주입 지점만 남겼습니다(g7-home-widgets 가 채움).

---

#### 에러 페이지 패턴

**대표**: `errors/404.json`

**구성**:
```text
(extends 없음 — 독립 레이아웃)
components:
  └── Div (전체 화면 중앙 정렬)
      ├── Icon (에러 아이콘)
      ├── H1 (에러 코드)
      ├── P (에러 메시지)
      └── Button (홈으로 이동)
```

**핸들러 패턴**:
- `navigate` — 홈으로 이동

---

### 베이스 레이아웃 구조

#### _user_base.json

모든 사용자 페이지의 공통 구조를 정의합니다.

```text
_user_base.json
├── globalHeaders: [X-Board-Secret-View-Token (게시판 API)]
├── transition_overlay: { style: "skeleton", target: "main_content_area" }
├── init_actions: [initTheme, loadTopMenu]
├── data_sources:
│   ├── boards (게시판 메뉴 — progressive, fallback)
│   ├── current_user (인증 사용자 — auth_required, suppress 401)
│   └── notification_unread_count · notifications · user_notification_ws (알림)
├── components:
│   ├── Toast (전역 알림)
│   ├── PageTransitionIndicator
│   ├── Div (min-h-screen flex flex-col)
│   │   ├── mobile_overlay (모바일 메뉴 오버레이 — responsive portable)
│   │   ├── MobileNav (모바일 네비게이션 드로어)
│   │   ├── Header (사이트 헤더 — 로고, 메뉴, 검색, 사용자)
│   │   ├── Div#main_content_area (콘텐츠 영역)
│   │   │   └── slot: "content" (← 하위 레이아웃이 채움)
│   │   └── Footer (사이트 푸터)
│   └── PageTransitionBlur (전환 블러)
```

**슬롯**:
- `content` — 각 페이지의 메인 콘텐츠가 삽입되는 위치

**특수사항**:
- `globalHeaders`: 패턴별 공통 헤더 자동 첨부
  - `/api/modules/sirsoft-board/*` — `X-Board-Secret-View-Token`
    비밀번호를 입력해 비밀글 원문을 연 사실을 다음 요청으로 넘기는 값입니다. 서버는 이
    사실을 검증 응답 하나에만 담고 있어서, 토큰을 싣지 않으면 원문을 연 사용자도 댓글·답글·
    신고에서 전부 거부됩니다. 토큰은 게시글에 결속되므로 다른 글에는 통하지 않고, 비밀글이
    아닌 요청에서는 서버가 아예 평가하지 않습니다. `board/types/basic/show.json` 의
    비밀번호 검증 `onSuccess` 가 `_global.secretViewToken` 에 넣습니다.
- `transition_overlay.style: "skeleton"`: 페이지 전환 시 PageSkeleton 표시
- `responsive`: 모바일 오버레이/네비게이션은 `portable` breakpoint에서만 표시
- `errorHandling.401.handler: "suppress"`: 비회원의 인증 API 401은 에러 전파 방지

---

### 관련 문서

- [sirsoft-basic 컴포넌트](components.md)
- [sirsoft-basic 핸들러](handlers.md)
- [sirsoft-admin_basic 레이아웃](../../sirsoft-admin_basic/docs/layouts.md)
- [레이아웃 JSON 스키마](../../../../docs/frontend/layout-json.md)
- [레이아웃 상속](../../../../docs/frontend/layout-json-inheritance.md)
