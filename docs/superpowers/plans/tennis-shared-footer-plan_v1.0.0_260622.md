# Tennis Shared Footer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 네 tennis 페이지의 하단을 좌측 홈 심볼과 우측 `Privacy · Contact` 링크로 통일한다.

**Architecture:** 네 정적 HTML에 동일한 접근성 마크업을 사용하고, 기존 공통 CSS에서 로고 크기와 좌우 정렬을 관리한다. 새 의존성이나 이미지 없이 기존 헤더 심볼 자산을 재사용한다.

**Tech Stack:** Static HTML, CSS, Node.js regression script, Cloudflare Pages

---

### Task 1: 푸터 계약 회귀 검사 작성

**Files:**
- Create temporarily: `/private/tmp/tennis-footer-regression.mjs`
- Inspect: `index.html`
- Inspect: `privacy/index.html`
- Inspect: `contact/index.html`
- Inspect: `racket-finder/index.html`
- Inspect: `styles.v1.1.1.css`

- [ ] **Step 1: 네 페이지의 동일 마크업과 공통 CSS를 검사하는 테스트 작성**

```js
import fs from "node:fs";

const pages = [
  "index.html",
  "privacy/index.html",
  "contact/index.html",
  "racket-finder/index.html",
];
const expectedFooter = `<footer class="site-footer">
    <a class="site-footer-brand" href="/" aria-label="fedshot911 tennis home">
      <img src="/assets/app-icons/v2.0.0/fedshot911-brand-mark-48-v2.0.0.png" alt="" aria-hidden="true">
    </a>
    <nav class="site-footer-links" aria-label="Footer">
      <a href="/privacy/">Privacy</a>
      <span aria-hidden="true">·</span>
      <a href="/contact/">Contact</a>
    </nav>
  </footer>`;

for (const page of pages) {
  const html = fs.readFileSync(page, "utf8");
  if (!html.includes(expectedFooter)) throw new Error(`${page}: footer mismatch`);
  if (!html.includes('/styles.v1.1.1.css?2606220843')) throw new Error(`${page}: stale CSS cache key`);
}

const css = fs.readFileSync("styles.v1.1.1.css", "utf8");
if (!/\.site-footer-brand img\s*\{[^}]*width:\s*2rem;[^}]*height:\s*2rem;/s.test(css)) {
  throw new Error("footer symbol sizing is missing");
}
if (!/\.site-footer-links\s*\{[^}]*justify-content:\s*flex-end;/s.test(css)) {
  throw new Error("footer link alignment is missing");
}
console.log("PASS: shared tennis footer contract");
```

- [ ] **Step 2: 수정 전 테스트 실패 확인**

Run: `node /private/tmp/tennis-footer-regression.mjs`

Expected: `index.html: footer mismatch`

### Task 2: 공통 푸터 최소 구현

**Files:**
- Modify: `index.html`
- Modify: `privacy/index.html`
- Modify: `contact/index.html`
- Modify: `racket-finder/index.html`
- Modify: `styles.v1.1.1.css`

- [ ] **Step 1: 네 HTML 푸터를 동일한 마크업으로 교체**

```html
<footer class="site-footer">
  <a class="site-footer-brand" href="/" aria-label="fedshot911 tennis home">
    <img src="/assets/app-icons/v2.0.0/fedshot911-brand-mark-48-v2.0.0.png" alt="" aria-hidden="true">
  </a>
  <nav class="site-footer-links" aria-label="Footer">
    <a href="/privacy/">Privacy</a>
    <span aria-hidden="true">·</span>
    <a href="/contact/">Contact</a>
  </nav>
</footer>
```

- [ ] **Step 2: 공통 CSS에 심볼과 링크 정렬 추가**

```css
.site-footer {
  align-items: center;
}

.site-footer-brand {
  display: inline-flex;
  flex: 0 0 auto;
}

.site-footer-brand img {
  display: block;
  width: 2rem;
  height: 2rem;
  object-fit: contain;
}

.site-footer-links {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.35rem;
  flex-wrap: wrap;
}
```

모바일 미디어 쿼리의 `.site-footer` 세로 배치 적용은 제거해 모든 화면에서 좌우 한 줄을 유지한다.

- [ ] **Step 3: 네 HTML의 공통 CSS 캐시 키 갱신**

```html
<link rel="stylesheet" href="/styles.v1.1.1.css?2606220843">
```

- [ ] **Step 4: 회귀 검사 통과 확인**

Run: `node /private/tmp/tennis-footer-regression.mjs`

Expected: `PASS: shared tennis footer contract`

### Task 3: 로컬 브라우저 반응형 검증

**Files:**
- Verify: project root

- [ ] **Step 1: 로컬 정적 서버 실행**

Run: `python3 -m http.server 4173 --bind 127.0.0.1`

Expected: `http://127.0.0.1:4173`에서 응답.

- [ ] **Step 2: 데스크톱 네 페이지 검증**

Flow: 각 페이지 로드 → 푸터 심볼 `src`·홈 링크 `href` 확인 → 우측 링크가 `Privacy`, `Contact` 두 개뿐인지 확인 → 좌우 위치 확인.

- [ ] **Step 3: 모바일 검증**

Viewport: `390 × 844`.

Expected: 심볼과 링크가 한 줄 좌우 배치를 유지하고 겹침이나 가로 스크롤이 없음.

- [ ] **Step 4: 상호작용과 콘솔 확인**

Flow: Contact에서 심볼 클릭 → 홈페이지 이동 → Privacy 링크 클릭 → Privacy 이동.

Expected: 대상 URL이 정확하고 관련 console error/warning 없음.

### Task 4: Cloudflare Pages 배포 및 운영 검증

**Files:**
- Deploy: project root `.`

- [ ] **Step 1: 운영 배포**

Run: `npx --yes wrangler@latest pages deploy . --project-name=tennis --branch=main`

Expected: 새 `tennis-c3k.pages.dev` 배포 URL 반환.

- [ ] **Step 2: 운영 도메인 검증**

Flow: `https://tennis.fedshot911.com` 네 페이지와 모바일 화면에서 Task 3 검사를 반복한다.

Expected: 공통 푸터, 링크 이동, 이미지 로드, 콘솔 상태 모두 정상.

### Task 5: 작업 이력과 최종 검증

**Files:**
- Create: `/Users/fedshot911/Desktop/M4Pro_Desk/fedshot911/07_SERVICE/00_AGENTS/tennis푸터통일_YYMMDDHHMMSS.md`
- Commit: implementation and plan files

- [ ] **Step 1: 작업 이력 작성**

요청 요약, 확인·변경 파일, 실행 명령과 결과, 배포 URL, 검증 결과, 추정·주의 사항과 남은 이슈를 기록한다.

- [ ] **Step 2: 최종 정적 검증**

Run: `git diff --check && node /private/tmp/tennis-footer-regression.mjs && git status --short`

Expected: whitespace 오류 없음, 회귀 검사 PASS, 의도한 파일만 변경.

- [ ] **Step 3: 구현 커밋**

Run: `git add index.html privacy/index.html contact/index.html racket-finder/index.html styles.v1.1.1.css docs/superpowers/plans/tennis-shared-footer-plan_v1.0.0_260622.md && git commit -m "Unify tennis page footers"`

Expected: 소스와 계획 문서가 하나의 구현 커밋으로 기록됨.
