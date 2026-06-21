# Tennis Global Cursor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `tennis.fedshot911.com`의 모든 페이지와 모든 마우스 대상에서 기존 테니스공 커서를 표시한다.

**Architecture:** 기존 공통 CSS를 단일 기준으로 사용한다. 커서 변수는 문서 루트에 정의하고 `html`, `body`, `body *`에 우선순위가 높은 전역 규칙을 적용해 하위 페이지 CSS의 개별 커서 선언을 덮어쓴다.

**Tech Stack:** Static HTML, CSS, Cloudflare Pages, Wrangler

---

### Task 1: 회귀 검사 작성 및 실패 확인

**Files:**
- Create temporarily: `/tmp/tennis-cursor-regression.mjs`
- Inspect: `styles.v1.1.1.css`
- Inspect: `index.html`
- Inspect: `privacy/index.html`
- Inspect: `contact/index.html`
- Inspect: `racket-finder/index.html`

- [ ] **Step 1: 전역 커서와 캐시 갱신을 검사하는 테스트 작성**

```js
import fs from "node:fs";

const css = fs.readFileSync("styles.v1.1.1.css", "utf8");
const pages = [
  "index.html",
  "privacy/index.html",
  "contact/index.html",
  "racket-finder/index.html",
];

if (!/:root\s*\{[^}]*--tennis-ball-cursor:/s.test(css)) {
  throw new Error("cursor variable is not global");
}
if (!/html,\s*body,\s*body \*\s*\{[^}]*cursor:\s*var\(--tennis-ball-cursor\),\s*auto\s*!important;/s.test(css)) {
  throw new Error("global cursor override is missing");
}
for (const page of pages) {
  const html = fs.readFileSync(page, "utf8");
  if (!html.includes('/styles.v1.1.1.css?260622')) {
    throw new Error(`${page}: cache key is stale`);
  }
}
console.log("PASS: global tennis cursor contract");
```

- [ ] **Step 2: 테스트가 기존 결함 때문에 실패하는지 확인**

Run: `node /tmp/tennis-cursor-regression.mjs`

Expected: `Error: cursor variable is not global`

### Task 2: 공통 CSS 최소 수정

**Files:**
- Modify: `styles.v1.1.1.css`
- Modify: `index.html`
- Modify: `privacy/index.html`
- Modify: `contact/index.html`
- Modify: `racket-finder/index.html`

- [ ] **Step 1: 커서 변수를 루트로 이동하고 전역 규칙 추가**

```css
:root {
  --tennis-ball-cursor: url("/assets/cursors/tennis-ball-cursor-v1.0.0_260621.png") 16 16;
}

html,
body,
body * {
  cursor: var(--tennis-ball-cursor), auto !important;
}
```

기존 `.tennis-home-root` 안의 중복 변수 정의는 제거한다. 다른 디자인 속성은 변경하지 않는다.

- [ ] **Step 2: 네 HTML의 공통 CSS 캐시 키 통일**

```html
<link rel="stylesheet" href="/styles.v1.1.1.css?260622">
```

- [ ] **Step 3: 회귀 검사 통과 확인**

Run: `node /tmp/tennis-cursor-regression.mjs`

Expected: `PASS: global tennis cursor contract`

### Task 3: 로컬 렌더링 검증

**Files:**
- Verify: all files under the project root

- [ ] **Step 1: 정적 서버 실행**

Run: `python3 -m http.server 4173 --bind 127.0.0.1`

Expected: server listens on `http://127.0.0.1:4173`

- [ ] **Step 2: 브라우저에서 대상 흐름 검증**

Flow: `/privacy/` 로드 → 본문과 이메일 링크의 계산된 커서 확인 → `/racket-finder/` 로드 → 버튼과 비활성 버튼의 계산된 커서 확인 → 모두 테니스공 이미지 URL을 사용.

- [ ] **Step 3: 콘솔 및 자산 확인**

Expected: 관련 console error/warning 없음, 커서 PNG 요청 성공, 페이지 제목과 본문 정상 표시.

### Task 4: Cloudflare Pages 배포 및 운영 확인

**Files:**
- Deploy: project root `.`
- Read: `wrangler.toml`

- [ ] **Step 1: Wrangler 설치와 인증 상태 확인**

Run: `npx wrangler@latest --version`

Expected: Wrangler v4.x 이상.

Run: `npx wrangler@latest whoami`

Expected: 현재 Cloudflare 계정 정보 표시.

- [ ] **Step 2: Pages 프로젝트 확인**

Run: `npx wrangler@latest pages project list`

Expected: `tennis` 프로젝트 존재.

- [ ] **Step 3: 운영 배포**

Run: `npx wrangler@latest pages deploy . --project-name=tennis --branch=main`

Expected: 성공한 deployment URL 반환.

- [ ] **Step 4: 운영 사이트 검증**

Flow: `https://tennis.fedshot911.com/privacy/` 새로 로드 → 배포된 CSS 캐시 키와 계산된 커서 확인 → 홈페이지, Contact, Racket Finder도 같은 전역 커서 확인.

Expected: 모든 페이지와 대상 요소에서 테니스공 커서, 관련 console error 없음.

### Task 5: 작업 이력 및 최종 검증

**Files:**
- Create: `/Users/fedshot911/Desktop/M4Pro_Desk/fedshot911/07_SERVICE/00_AGENTS/tennis커서전체통일_YYMMDDHHMMSS.md`

- [ ] **Step 1: 작업 이력 작성**

요청 요약, 확인·변경 파일, 실행 명령과 결과, Cloudflare 공식 문서, 검증 결과, 추정·주의 사항, 남은 이슈와 다음 작업을 기록한다.

- [ ] **Step 2: 전체 변경 검토**

Run: `git diff --check && git status --short && node /tmp/tennis-cursor-regression.mjs`

Expected: whitespace 오류 없음, 의도한 파일만 변경, 회귀 검사 PASS.

- [ ] **Step 3: 구현 변경 커밋**

Run: `git add styles.v1.1.1.css index.html privacy/index.html contact/index.html racket-finder/index.html docs/superpowers/plans/tennis-global-cursor-plan_v1.0.0_260622.md && git commit -m "Apply tennis cursor across all pages"`

Expected: 구현 파일과 계획 문서가 커밋됨. `00_AGENTS`는 상위 프로젝트 작업 이력 폴더이므로 tennis 저장소 커밋 범위에서 제외한다.
