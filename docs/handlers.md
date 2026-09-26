# Basic — 핸들러

> 템플릿 전용 핸들러와 부트스트랩 · 진입점: [AGENTS.md](../AGENTS.md)

## 템플릿 전용 핸들러

<!-- @generated:handlers START — ext:docgen 이 갱신. 이 블록 안은 직접 수정하지 않는다 -->
핸들러 7개 (정의: `src/handlers/index.ts`).

| 핸들러 | 레이아웃에서 부르는 이름 |
|---|---|
| `setTheme` | (템플릿 전용 — 네임스페이스 없음) |
| `initTheme` | (템플릿 전용 — 네임스페이스 없음) |
| `redirectToLoginWithReturn` | (템플릿 전용 — 네임스페이스 없음) |
| `downloadAttachment` | (템플릿 전용 — 네임스페이스 없음) |
| `loadTopMenu` | (템플릿 전용 — 네임스페이스 없음) |
| `saveToStorage` | (템플릿 전용 — 네임스페이스 없음) |
| `loadFromStorage` | (템플릿 전용 — 네임스페이스 없음) |
<!-- @generated:handlers END -->

<!-- @intent START -->
7개 모두 네임스페이스 없이 등록합니다 — 레이아웃에서는 이름만 씁니다. 원본 Basic 의 상품 옵션·
통화·장바구니·비회원 주문 핸들러(`sirsoft-basic.*` 포함)는 이 템플릿에서 뺐습니다.

| 무리 | 예 | 무엇을 하는가 |
|---|---|---|
| 테마 2 | `setTheme` · `initTheme` | 다크/라이트 전환 (관리자 템플릿과 **같은 localStorage 키**를 공유) |
| 저장소 2 | `saveToStorage` · `loadFromStorage` | 범용 localStorage 저장·로드 |
| 기타 3 | `redirectToLoginWithReturn` · `downloadAttachment` · `loadTopMenu` | 로그인 후 원래 자리 복귀, 첨부 내려받기, 상단 메뉴 불러오기(g7-easy-topmenu 활성 시) |

`setLocale` 은 이 템플릿의 핸들러가 아닙니다 — 엔진(`ActionDispatcher`) 빌트인이라 등록이
필요 없습니다.

### 핸들러 시그니처는 `(action, context)` 입니다

엔진은 등록된 핸들러를 `handler(action, context)` 로 부르고, 레이아웃이 선언한 값은
`action.params` 에 해석되어 들어옵니다. 첫 인자를 params 로 받는 형태로 작성하면 레이아웃이
넘긴 값이 전부 `undefined` 가 되는데, 오류가 나지 않아 드러나지 않습니다. 타입 정의는
`src/types/index.ts` 의 `HandlerFunction` · `TemplateActionDefinition` 이 정본입니다.

상태 조회·설정 API 는 컨텍스트가 아니라 전역 `G7Core` 가 제공합니다:

| 하는 일 | 쓰는 것 |
|---|---|
| 전역 상태 읽기/쓰기 | `G7Core.state.get()` / `G7Core.state.set()` |
| 로컬(`_local`) 상태 읽기/쓰기 | `G7Core.state.getLocal()` / `G7Core.state.setLocal()` |
| 현재 사용자 | `AuthManager.getInstance().getUser()` |

`context.setState(updates)` 는 **객체 하나**를 받습니다. 스코프 인자를 앞에 두는
`setState('global', {...})` 형태로 부르면 문자열 `'global'` 이 로컬 상태에 전개되어,
오류 없이 상태만 오염됩니다.
<!-- @intent END -->

## 부트스트랩

<!-- @generated:frontend-entry START — ext:docgen 이 갱신. 이 블록 안은 직접 수정하지 않는다 -->
| 항목 | 값 |
|---|---|
| 엔트리 파일 | `src/index.ts` |
| 전역 객체 | **미노출** |
| 재등록 진입점 | `initTemplate()` |

재등록 진입점이 전역에 고정 이름으로 노출되지 않으면 로케일 전환 후 이 확장의 액션이 전부 무반응이 됩니다 (오류·토스트 없음).
<!-- @generated:frontend-entry END -->

<!-- @intent START -->
전역 객체가 **미노출**입니다. 모듈·플러그인은 `window.__[Name].initModule/initPlugin` 을 고정
이름으로 노출해야 하지만(로케일 전환 후 코어가 그것을 다시 부릅니다), 템플릿은 코어가 부트스트랩
경로를 직접 알고 있어 전역 노출이 필요하지 않습니다.

`initTemplate()` 이 그 진입점이며 모듈 로드 시점에 스스로 실행됩니다. 하는 일이 셋입니다:

1. **핸들러 등록** — `handlerMap` 전량을 `ActionDispatcher` 에 올립니다. 개별 등록이 아니라
   맵을 순회하므로, 핸들러를 추가할 때 등록 코드를 함께 고칠 필요가 없습니다.
2. **IDV launcher 등록** — `window.G7Core.identity.setLauncher()` 로 본인인증 화면을 여는
   방법을 코어에 알립니다. 이것이 없으면 428 응답을 받은 화면이 인증 창을 띄우지 못합니다.
3. **iOS 판정 보정** — 서버 UA 판정이 놓치는 iPadOS(데스크탑 UA)를 클라이언트 신호로 바로잡아
   `appConfig.isIos` 에 반영합니다.

**`ActionDispatcher` 가용을 기다리는 재시도 루프**(100ms × 최대 50회)가 들어 있습니다.
`window.load` 이후에 시작하며, 그 안에서 세 작업이 함께 일어납니다.

레이아웃 편집기 위젯 등록만은 **이 함수 밖**에서 모듈 로드 즉시 실행됩니다. 편집기 URL 을 직접
하드로드한 경로에서는 `window.load` 게이트를 기다리면 등록이 편집기 셸 마운트보다 늦어 위젯이
누락되기 때문입니다("Unsupported control"). 진입 경로와 무관하게 결정적이어야 하는 등록은 이
자리에 둡니다.

이 템플릿은 `AuthManager.updateConfig()` 를 부르지 않습니다 — 코어 기본값을 그대로 씁니다.
호출이 필요해지면 **템플릿 부트스트랩에서만** 하고(모듈·플러그인에서 부르면 안 됩니다),
`loginPath` 는 `/` 로 시작하는 동일 origin 경로여야 합니다. `//` 로 시작하거나 외부 origin 을
주면 open redirect 가 됩니다.
<!-- @intent END -->

## 이관 원문 상세

> 아래는 코어 `docs/frontend/templates/sirsoft-basic/handlers.md` 에 있던 원문을 이 문서로 옮긴 것입니다(#601). 이관 시점 그대로
> 보존하되, **코드가 SSoT 인 값과 어긋나는 부분에는 정정 주석**을 달았습니다.

### sirsoft-basic 핸들러

> **템플릿 식별자**: `sirsoft-basic` (type: user)
> **관련 문서**: [액션 핸들러 개요](../../../../docs/frontend/actions-handlers.md) | [컴포넌트](components.md) | [레이아웃](layouts.md)

---

### TL;DR (5초 요약)

```text
1. setTheme/initTheme: 다크/라이트 모드 전환 (admin과 동일 키 공유)
2. 스토리지 2종: 범용 localStorage 저장/로드
```

---

### 목차

1. [테마 핸들러](#테마-핸들러)
2. [스토리지 핸들러](#스토리지-핸들러)
3. [핸들러 등록 맵](#핸들러-등록-맵)

---

### 테마 핸들러

**소스**: `src/handlers/setThemeHandler.ts`

sirsoft-admin_basic과 동일한 localStorage 키(`g7_color_scheme`)를 사용하여 테마 설정을 공유합니다.

#### setTheme

테마 값은 액션 **top-level `target`** 으로 넘깁니다. 핸들러는 `params` 를 읽지 않으므로
`params.theme` 으로 넘기면 콘솔 경고 한 줄만 남기고 아무 것도 하지 않습니다 (dev-g7#640).

```json
{
  "type": "click",
  "handler": "setTheme",
  "target": "dark"
}
```

| 위치 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `target` | string | ✅ | `"light"`, `"dark"`, `"auto"` (시스템 설정 따름) |

#### initTheme

앱 시작 시 `init_actions`에서 호출합니다. `target` 은 선택이며, 유효한 테마 값이면 그 값을,
없거나 유효하지 않으면 localStorage 저장값(없으면 `auto`)을 적용합니다.

```json
{
  "init_actions": [
    { "handler": "initTheme" }
  ]
}
```

---

### 스토리지 핸들러

**소스**: `src/handlers/storageHandlers.ts`

클라이언트 스토리지(localStorage)를 다룹니다.

#### saveToStorage / loadFromStorage

범용 localStorage 저장/로드 핸들러입니다.

```json
{
  "handler": "saveToStorage",
  "params": {
    "key": "g7_some_setting",
    "value": "{{_local.settingValue}}"
  }
}
```

```json
{
  "handler": "loadFromStorage",
  "params": {
    "key": "g7_some_setting",
    "stateKey": "savedSetting"
  }
}
```

#### 스토리지 핸들러 요약

| 핸들러 | params | 설명 |
|--------|--------|------|
| `saveToStorage` | `{ key, value }` | localStorage 저장 |
| `loadFromStorage` | `{ key, stateKey }` | localStorage 로드 → 상태에 설정 |

---

### 핸들러 등록 맵

> **정정(wc-community)**: 코드 실측은 **7개**이며 위 「템플릿 전용 핸들러」 블록이 SSoT 입니다.

**소스**: `src/handlers/index.ts`

| 등록 키 | 소스 파일 | 설명 |
|---------|----------|------|
| `setTheme` | setThemeHandler.ts | 테마 변경 |
| `initTheme` | setThemeHandler.ts | 테마 초기화 |
| `redirectToLoginWithReturn` | redirectToLoginWithReturn.ts | 로그인 후 원래 경로 복귀 |
| `downloadAttachment` | downloadAttachment.ts | 게시판 첨부 내려받기 |
| `loadTopMenu` | loadTopMenu.ts | 상단 메뉴 불러오기 |
| `saveToStorage` | storageHandlers.ts | localStorage 저장 |
| `loadFromStorage` | storageHandlers.ts | localStorage 로드 |

---

### 주의사항

```text
이 핸들러들은 sirsoft-basic 템플릿에서만 등록됨
sirsoft-basic. 접두사 핸들러는 풀네임으로 호출해야 함
setLocale은 엔진 레벨(ActionDispatcher) 빌트인 — 별도 등록 불필요
✅ 범용 핸들러(navigate, apiCall, setState 등)는 actions-handlers.md 참조
```

---

### 관련 문서

- [액션 핸들러 개요](../../../../docs/frontend/actions-handlers.md)
- [sirsoft-basic 컴포넌트](components.md)
- [sirsoft-basic 레이아웃](layouts.md)
- [sirsoft-admin_basic 핸들러](../../sirsoft-admin_basic/docs/handlers.md)
