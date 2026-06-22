# Tennis Footer Round Logo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 하단 좌측의 검은 사각 로고를 상단 로고와 같은 원형 마스킹으로 표시한다.

**Architecture:** 새 이미지 자산을 사용하지 않고 기존 `fedshot911-brand-mark-48-v2.0.0.png`를 유지한다. 공통 CSS의 푸터 이미지에 원형 마스킹과 `object-fit: cover`를 적용하고 네 HTML의 공통 CSS 캐시 키를 갱신한다.

**Tech Stack:** Static HTML, CSS, Node.js regression script, Cloudflare Pages

---

### Task 1: 원형 푸터 로고 회귀 검사

**Files:**
- Create temporarily: `/private/tmp/tennis-footer-round-logo-regression.mjs`
- Inspect: `styles.v1.1.1.css`
- Inspect: `index.html`
- Inspect: `privacy/index.html`
- Inspect: `contact/index.html`
- Inspect: `racket-finder/index.html`

- [ ] **Step 1: 원형 마스킹과 캐시 키 검사 작성**

```js
import fs from "node:fs";

const css = fs.readFileSync("styles.v1.1.1.css", "utf8");
const pages = ["index.html", "privacy/index.html", "contact/index.html", "racket-finder/index.html"];

if (!/\.site-footer-brand img\s*\{[^}]*border-radius:\s*50%;[^}]*object-fit:\s*cover;/s.test(css)) {
  throw new Error("footer logo is not circular");
}
for (const page of pages) {
  const html = fs.readFileSync(page, "utf8");
  if (!html.includes('/styles.v1.1.1.css?2606222224')) throw new Error(`${page}: stale CSS cache key`);
}
console.log("PASS: round footer logo contract");
```

- [ ] **Step 2: 수정 전 실패 확인**

Run: `node /private/tmp/tennis-footer-round-logo-regression.mjs`

Expected: `footer logo is not circular`

### Task 2: 최소 CSS 수정

**Files:**
- Modify: `styles.v1.1.1.css`
- Modify: `index.html`
- Modify: `privacy/index.html`
- Modify: `contact/index.html`
- Modify: `racket-finder/index.html`

- [ ] **Step 1: 푸터 이미지 원형 마스킹 적용**

```css
.site-footer-brand img {
  display: block;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  object-fit: cover;
}
```

- [ ] **Step 2: 네 HTML의 공통 CSS 캐시 키 갱신**

```html
<link rel="stylesheet" href="/styles.v1.1.1.css?2606222224">
```

- [ ] **Step 3: 회귀 검사 통과 확인**

Run: `node /private/tmp/tennis-footer-round-logo-regression.mjs`

Expected: `PASS: round footer logo contract`

### Task 3: 렌더링·배포·기록

**Files:**
- Verify: project root
- Create: `/Users/fedshot911/Desktop/M4Pro_Desk/fedshot911/07_SERVICE/00_AGENTS/하단로고원형수정_YYMMDDHHMMSS.md`
- Commit: source and plan files

- [ ] **Step 1: 로컬 브라우저 검증**

Contact와 Privacy 하단에서 푸터 이미지의 계산된 `border-radius`가 `50%`, 크기가 `32 × 32`, 원본 이미지가 기존 경로인지 확인한다.

- [ ] **Step 2: 운영 배포**

Run: `npx --yes wrangler@latest pages deploy . --project-name=tennis --branch=main`

Expected: 새 Pages 배포 URL 반환.

- [ ] **Step 3: 운영 브라우저 검증**

`https://tennis.fedshot911.com/privacy/` 하단에서 검은 사각 모서리가 원형으로 잘리고 우측 `Privacy · Contact`가 유지되는지 확인한다.

- [ ] **Step 4: 작업 이력과 최종 검증**

Run: `git diff --check && node /private/tmp/tennis-footer-round-logo-regression.mjs && git status --short`

Expected: whitespace 오류 없음, 회귀 검사 PASS, 의도한 파일만 변경.

- [ ] **Step 5: 구현 커밋**

Run: `git add styles.v1.1.1.css index.html privacy/index.html contact/index.html racket-finder/index.html docs/superpowers/plans/tennis-footer-round-logo-plan_v1.0.0_260622.md && git commit -m "Round the tennis footer logo"`

Expected: 공통 CSS, 네 HTML, 계획 문서가 하나의 커밋으로 기록됨.
