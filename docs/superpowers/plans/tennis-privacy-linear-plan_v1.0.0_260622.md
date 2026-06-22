# Tennis Privacy Linear-Style Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 현재 개인정보 처리 문구와 tennis 색상을 유지하면서 Privacy 페이지를 Linear형 단일 문서 구조로 재디자인한다.

**Architecture:** `privacy/index.html`에서 카드형 섹션을 번호형 목차와 순차 문서 섹션으로 재구성한다. Privacy 전용 스타일이 있는 `racket-finder.v1.1.6.css`만 조정하고 헤더, 공통 푸터, 커서와 다른 페이지 스타일은 유지한다.

**Tech Stack:** Static HTML, CSS, Node.js regression script, Cloudflare Pages

---

### Task 1: 문구 보존과 Linear형 구조 회귀 검사

**Files:**
- Create temporarily: `/private/tmp/tennis-privacy-linear-regression.mjs`
- Inspect: `privacy/index.html`
- Inspect: `racket-finder/racket-finder.v1.1.6.css`

- [ ] **Step 1: 원하는 구조와 기존 핵심 문구를 검사하는 테스트 작성**

```js
import fs from "node:fs";

const html = fs.readFileSync("privacy/index.html", "utf8");
const css = fs.readFileSync("racket-finder/racket-finder.v1.1.6.css", "utf8");
const sections = [
  ["saved-data", "저장하는 정보"],
  ["not-collected", "저장하지 않는 정보"],
  ["purpose", "이용 목적"],
  ["retention", "보관 기간과 삭제"],
  ["sharing", "제3자 제공"],
  ["infrastructure", "처리 위탁과 인프라"],
  ["security", "안전성 확보 조치"],
  ["contact-requests", "문의와 요청"],
];
const preservedPhrases = [
  "추천 결과 저장, 공유 횟수 집계, 서비스 분석 및 마케팅 활용",
  "Cloudflare Pages Functions 및 Cloudflare D1",
  "저장된 추천 결과를 구분하는 무작위 ID",
  "이름, 전화번호, 주소, 결제 정보, 계정 비밀번호, 민감정보",
  "파트너, 광고주, 콘텐츠 제작자, 분석 또는 운영 협력사",
  "HTTPS, 보안 헤더, 입력값 검증",
  "fedshot911@fedshot911.com",
];

if (!html.includes('class="privacy-effective-date"')) throw new Error("effective date is not in the document header");
if (!html.includes('class="privacy-toc"')) throw new Error("Linear-style table of contents is missing");
for (const [id, label] of sections) {
  if (!html.includes(`href="#${id}"`)) throw new Error(`missing TOC link: ${id}`);
  if (!html.includes(`id="${id}"`)) throw new Error(`missing section target: ${id}`);
  if (!html.includes(`>${label}<`)) throw new Error(`missing section heading: ${label}`);
}
for (const phrase of preservedPhrases) {
  if (!html.includes(phrase)) throw new Error(`missing preserved content: ${phrase}`);
}
if (html.includes('class="privacy-grid"')) throw new Error("legacy card grid remains");
if (!html.includes('racket-finder.v1.1.6.css?2606222150')) throw new Error("privacy CSS cache key is stale");
if (!/\.privacy-shell\s*\{[^}]*width:\s*min\(800px,\s*90vw\)/s.test(css)) throw new Error("document width is not Linear-style");
if (!/\.privacy-toc\s*\{[^}]*border-top:/s.test(css)) throw new Error("TOC styling is missing");
if (!/\.privacy-section\s*\{[^}]*display:\s*block;/s.test(css)) throw new Error("sections are not single-column");
console.log("PASS: Linear-style privacy contract");
```

- [ ] **Step 2: 수정 전 테스트 실패 확인**

Run: `node /private/tmp/tennis-privacy-linear-regression.mjs`

Expected: `effective date is not in the document header`

### Task 2: Privacy HTML을 Linear형 문서 구조로 변경

**Files:**
- Modify: `privacy/index.html`

- [ ] **Step 1: 기존 `<main>`을 다음 완성된 문서 마크업으로 교체**

```html
<main class="finder-shell privacy-shell">
  <section class="privacy-hero" aria-labelledby="page-title">
    <p class="guide-label">Privacy</p>
    <h1 id="page-title">개인정보 처리 안내</h1>
    <p class="privacy-effective-date">시행일 및 마지막 수정일: 2026년 6월 21일</p>
    <p class="privacy-intro">
      fedshot911 tennis는 라켓 추천 결과를 저장하고 공유 횟수를 집계하기 위해 필요한 범위의
      서비스 이용 기록을 저장합니다. 이름, 전화번호, 주소처럼 개인을 직접 식별하는 정보는
      라켓 추천 과정에서 요구하지 않습니다.
    </p>
    <dl class="privacy-summary" aria-label="개인정보 처리 요약">
      <div>
        <dt>저장 목적</dt>
        <dd>추천 결과 저장, 공유 횟수 집계, 서비스 분석 및 마케팅 활용</dd>
      </div>
      <div>
        <dt>저장 위치</dt>
        <dd>Cloudflare Pages Functions 및 Cloudflare D1</dd>
      </div>
      <div>
        <dt>문의</dt>
        <dd><a href="mailto:fedshot911@fedshot911.com">fedshot911@fedshot911.com</a></dd>
      </div>
    </dl>
  </section>

  <nav class="privacy-toc" aria-labelledby="privacy-toc-title">
    <p class="guide-label">On this page</p>
    <h2 id="privacy-toc-title">이 페이지에서</h2>
    <ol>
      <li><a href="#saved-data">저장하는 정보</a></li>
      <li><a href="#not-collected">저장하지 않는 정보</a></li>
      <li><a href="#purpose">이용 목적</a></li>
      <li><a href="#retention">보관 기간과 삭제</a></li>
      <li><a href="#sharing">제3자 제공</a></li>
      <li><a href="#infrastructure">처리 위탁과 인프라</a></li>
      <li><a href="#security">안전성 확보 조치</a></li>
      <li><a href="#contact-requests">문의와 요청</a></li>
    </ol>
  </nav>

  <section class="privacy-section" id="saved-data" aria-labelledby="saved-data-title">
    <p class="guide-label">Saved data</p>
    <h2 id="saved-data-title">저장하는 정보</h2>
    <p>
      추천 완료 시 아래 정보가 저장될 수 있습니다. 이 정보는 회원 계정이나 연락처와 연결하지
      않고, 라켓 추천 기능의 결과 저장, 공유 횟수 확인, 서비스 분석, 마케팅 참고에 사용합니다.
    </p>
    <div class="privacy-table-wrap">
      <table class="privacy-table">
        <thead>
          <tr>
            <th scope="col">항목</th>
            <th scope="col">내용</th>
            <th scope="col">사용 목적</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">결과 ID</th>
            <td>저장된 추천 결과를 구분하는 무작위 ID</td>
            <td>공유 횟수 업데이트, 결과 관리</td>
          </tr>
          <tr>
            <th scope="row">답변 조합</th>
            <td>라켓 파인더 질문에 선택한 답변 ID 목록</td>
            <td>추천 품질 점검, 서비스 분석, 마케팅 참고</td>
          </tr>
          <tr>
            <th scope="row">추천 결과</th>
            <td>추천 라켓 ID, 추천 점수, 결과 이미지 타입</td>
            <td>결과 저장, 추천 로직 개선, 콘텐츠/마케팅 분석</td>
          </tr>
          <tr>
            <th scope="row">공유 횟수</th>
            <td>결과 공유 버튼 사용 시 증가하는 횟수</td>
            <td>공유 기능 동작 확인</td>
          </tr>
          <tr>
            <th scope="row">시각 정보</th>
            <td>결과 생성 시각과 마지막 업데이트 시각</td>
            <td>운영 점검, 데이터 정리 기준, 이용 추세 분석</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <section class="privacy-section" id="not-collected" aria-labelledby="not-collected-title">
    <p class="guide-label">Not collected</p>
    <h2 id="not-collected-title">저장하지 않는 정보</h2>
    <p>
      라켓 추천 결과 저장 과정에서는 이름, 전화번호, 주소, 결제 정보, 계정 비밀번호, 민감정보를
      입력받지 않습니다. Contact로 문의하는 경우에는 사용자가 보낸 이메일 내용만 문의 응답에
      사용합니다.
    </p>
  </section>

  <section class="privacy-section" id="purpose" aria-labelledby="purpose-title">
    <p class="guide-label">Purpose</p>
    <h2 id="purpose-title">이용 목적</h2>
    <p>
      저장된 정보는 추천 결과 기록, 공유 횟수 집계, 추천 품질 개선, 오류 확인, 악용 방지,
      서비스 분석, 콘텐츠 기획, 제휴 검토, 광고 및 마케팅 참고 자료로 사용할 수 있습니다.
      이때 이름이나 연락처처럼 개인을 직접 식별하는 정보와 결합하지 않는 것을 원칙으로 합니다.
    </p>
  </section>

  <section class="privacy-section" id="retention" aria-labelledby="retention-title">
    <p class="guide-label">Retention</p>
    <h2 id="retention-title">보관 기간과 삭제</h2>
    <p>
      저장된 결과 기록은 서비스 운영, 분석, 마케팅 활용 목적을 위해 서비스가 운영되는 동안
      계속 보관할 수 있습니다. 삭제가 필요한 경우 결과 링크나 확인 가능한 정보를 포함해
      문의하면 가능한 범위에서 확인 후 삭제합니다. 다만 이미 집계되었거나 개인을 직접
      식별할 수 없는 통계 자료는 별도로 삭제하기 어려울 수 있습니다.
    </p>
  </section>

  <section class="privacy-section" id="sharing" aria-labelledby="sharing-title">
    <p class="guide-label">Sharing</p>
    <h2 id="sharing-title">제3자 제공</h2>
    <p>
      저장된 추천 결과 기록은 서비스 분석, 콘텐츠 기획, 제휴 검토, 광고 및 마케팅 활용을 위해
      파트너, 광고주, 콘텐츠 제작자, 분석 또는 운영 협력사에게 제공될 수 있습니다. 제공되는
      정보는 답변 조합, 추천 라켓, 공유 횟수, 생성 시각 등 라켓 추천 이용 기록이며, 이름,
      전화번호, 주소처럼 개인을 직접 식별하는 정보는 포함하지 않는 것을 원칙으로 합니다.
    </p>
  </section>

  <section class="privacy-section" id="infrastructure" aria-labelledby="infrastructure-title">
    <p class="guide-label">Infrastructure</p>
    <h2 id="infrastructure-title">처리 위탁과 인프라</h2>
    <p>
      사이트 호스팅, API 실행, 데이터 저장을 위해 Cloudflare Pages, Cloudflare Pages Functions,
      Cloudflare D1을 사용합니다. 저장 데이터는 Cloudflare 계정 권한 안에서 관리됩니다.
    </p>
  </section>

  <section class="privacy-section" id="security" aria-labelledby="security-title">
    <p class="guide-label">Security</p>
    <h2 id="security-title">안전성 확보 조치</h2>
    <p>
      HTTPS, 보안 헤더, 입력값 검증, 필요한 항목 중심의 최소 저장, D1 바인딩 접근 제한을 통해
      저장 정보가 불필요하게 노출되지 않도록 관리합니다.
    </p>
  </section>

  <section class="privacy-section privacy-contact" id="contact-requests" aria-labelledby="contact-title">
    <p class="guide-label">Rights</p>
    <h2 id="contact-title">문의와 요청</h2>
    <p>
      개인정보 처리, 결과 기록 삭제, 서비스 운영 관련 문의는 아래 이메일로 보내주세요. 답변이
      필요한 경우 메일 제목에 fedshot911 tennis를 포함하면 확인이 쉽습니다.
    </p>
    <a class="privacy-mail-link" href="mailto:fedshot911@fedshot911.com">fedshot911@fedshot911.com</a>
  </section>
</main>
```

- [ ] **Step 2: Privacy 전용 CSS 캐시 키 갱신**

```html
<link rel="stylesheet" href="/racket-finder/racket-finder.v1.1.6.css?2606222150">
```

### Task 3: 현재 색상을 유지한 Linear형 CSS 구현

**Files:**
- Modify: `racket-finder/racket-finder.v1.1.6.css`

- [ ] **Step 1: 기존 Privacy 전용 CSS 블록을 다음 완성된 스타일로 교체**

```css
.privacy-shell {
  width: min(800px, 90vw);
  padding-top: clamp(3.5rem, 8vw, 6.5rem);
}

.privacy-hero {
  padding: 0 0 clamp(2.5rem, 6vw, 4rem);
}

.privacy-hero h1 {
  max-width: 11ch;
  margin-bottom: 1rem;
  font-size: clamp(3rem, 7vw, 5.4rem);
  line-height: 0.98;
}

.privacy-effective-date {
  margin-bottom: 1.6rem;
  color: #205843;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.82rem;
  font-weight: 850;
}

.privacy-intro {
  max-width: 44rem;
  margin-bottom: 0;
  color: #3d4650;
  font-size: clamp(1rem, 1.6vw, 1.18rem);
}

.privacy-summary {
  margin: 2.5rem 0 0;
  border-top: 1px solid rgba(24, 26, 31, 0.12);
}

.privacy-summary div {
  display: grid;
  grid-template-columns: 9rem minmax(0, 1fr);
  gap: 1rem;
  padding: 0.85rem 0;
  border-bottom: 1px solid rgba(24, 26, 31, 0.1);
}

.privacy-summary dt,
.privacy-table th {
  color: #181a1f;
  font-weight: 850;
}

.privacy-summary dd {
  margin: 0;
  color: #4c5661;
}

.privacy-summary a {
  text-underline-offset: 0.18em;
}

.privacy-toc {
  padding: clamp(2.25rem, 5vw, 3.5rem) 0;
  border-top: 1px solid rgba(24, 26, 31, 0.12);
  border-bottom: 1px solid rgba(24, 26, 31, 0.12);
}

.privacy-toc h2 {
  margin: 0.3rem 0 1.2rem;
  font-size: clamp(1.4rem, 2.5vw, 1.85rem);
  line-height: 1.1;
}

.privacy-toc ol {
  display: grid;
  gap: 0.55rem;
  margin: 0;
  padding-left: 1.45rem;
}

.privacy-toc li {
  padding-left: 0.35rem;
  color: #4c5661;
}

.privacy-toc li::marker {
  color: #205843;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.82rem;
  font-weight: 850;
}

.privacy-toc a {
  color: inherit;
  text-decoration: none;
}

.privacy-toc a:hover,
.privacy-toc a:focus-visible {
  color: #181a1f;
  text-decoration: underline;
  text-decoration-color: #205843;
  text-underline-offset: 0.2em;
}

.privacy-section {
  display: block;
  padding: clamp(2.5rem, 6vw, 4rem) 0;
  border-bottom: 1px solid rgba(24, 26, 31, 0.1);
  scroll-margin-top: 96px;
}

.privacy-section h2 {
  margin-bottom: 1rem;
  font-size: clamp(1.8rem, 3.5vw, 2.6rem);
  line-height: 1.08;
}

.privacy-section > p:not(.guide-label) {
  margin-bottom: 0;
  color: #4c5661;
}

.privacy-table-wrap {
  margin-top: 1.75rem;
  overflow-x: auto;
  border-top: 1px solid rgba(24, 26, 31, 0.14);
  border-bottom: 1px solid rgba(24, 26, 31, 0.14);
  background: transparent;
}

.privacy-table {
  width: 100%;
  min-width: 680px;
  border-collapse: collapse;
  text-align: left;
}

.privacy-table th,
.privacy-table td {
  padding: 0.9rem 0.75rem;
  border-bottom: 1px solid rgba(24, 26, 31, 0.09);
  vertical-align: top;
}

.privacy-table th:first-child,
.privacy-table td:first-child {
  padding-left: 0;
}

.privacy-table th:last-child,
.privacy-table td:last-child {
  padding-right: 0;
}

.privacy-table tr:last-child th,
.privacy-table tr:last-child td {
  border-bottom: 0;
}

.privacy-table td {
  color: #4c5661;
}

.privacy-contact {
  padding-bottom: 0;
  border-bottom: 0;
}

.privacy-mail-link {
  display: inline-flex;
  margin-top: 1.25rem;
  color: #205843;
  font-weight: 850;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.24em;
}

.privacy-mail-link:hover,
.privacy-mail-link:focus-visible {
  color: #181a1f;
}

@media (max-width: 920px) {
  .privacy-shell {
    width: min(800px, 90vw);
    padding-top: 3rem;
  }

  .privacy-hero h1 {
    font-size: clamp(2.65rem, 13vw, 4rem);
  }

  .privacy-summary div {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }

  .privacy-section {
    padding: 2.5rem 0;
  }
}
```

기존 `@media (max-width: 920px)`의 시작 선택자를 다음과 같이 변경해 더 이상 사용하지 않는 Privacy 선택자를 제거한다.

```css
@media (max-width: 920px) {
  .finder-hero,
  .result-layout,
  .finder-guide-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 2: 회귀 검사 통과 확인**

Run: `node /private/tmp/tennis-privacy-linear-regression.mjs`

Expected: `PASS: Linear-style privacy contract`

### Task 4: 로컬 브라우저 검증

**Files:**
- Verify: project root

- [ ] **Step 1: 로컬 서버 실행**

Run: `python3 -m http.server 4173 --bind 127.0.0.1`

Expected: `http://127.0.0.1:4173/privacy/` 응답.

- [ ] **Step 2: 데스크톱 문서 구조 검증**

Flow: Privacy 로드 → 제목·시행일·목차·8개 섹션·표·메일 링크·공통 푸터 확인.

- [ ] **Step 3: 목차 상호작용 검증**

Flow: `보관 기간과 삭제` 목차 링크 클릭 → URL hash가 `#retention`으로 바뀌고 해당 섹션이 표시됨.

- [ ] **Step 4: 모바일 검증**

Viewport: `390 × 844`.

Expected: 본문·목차·푸터에 가로 넘침이나 겹침 없음. 표의 최소 폭은 표 컨테이너 내부에서만 스크롤됨.

- [ ] **Step 5: 콘솔과 기존 공통 요소 확인**

Expected: console error/warning 없음, 헤더·푸터 이미지 로드, 계산된 커서가 테니스공 이미지 URL을 유지.

### Task 5: Cloudflare Pages 배포 및 운영 검증

**Files:**
- Deploy: project root `.`

- [ ] **Step 1: 운영 배포**

Run: `npx --yes wrangler@latest pages deploy . --project-name=tennis --branch=main`

Expected: 새 `tennis-c3k.pages.dev` 배포 URL 반환.

- [ ] **Step 2: 운영 도메인 검증**

`https://tennis.fedshot911.com/privacy/`에서 Task 4의 데스크톱·모바일·목차·콘솔 검사를 반복한다.

### Task 6: 작업 이력과 최종 검증

**Files:**
- Create: `/Users/fedshot911/Desktop/M4Pro_Desk/fedshot911/07_SERVICE/00_AGENTS/tennisPrivacyLinear디자인_YYMMDDHHMMSS.md`
- Commit: source and plan files

- [ ] **Step 1: 작업 이력 작성**

요청 요약, 변경 파일, Linear 공식 레퍼런스, 실행 명령과 결과, 배포 URL, 검증 결과, 추정·주의 사항과 남은 이슈를 기록한다.

- [ ] **Step 2: 최종 정적 검증**

Run: `git diff --check && node /private/tmp/tennis-privacy-linear-regression.mjs && git status --short`

Expected: whitespace 오류 없음, 회귀 검사 PASS, 의도한 파일만 변경.

- [ ] **Step 3: 구현 커밋**

Run: `git add privacy/index.html racket-finder/racket-finder.v1.1.6.css docs/superpowers/plans/tennis-privacy-linear-plan_v1.0.0_260622.md && git commit -m "Redesign tennis privacy in Linear style"`

Expected: Privacy HTML, 전용 CSS, 구현 계획이 하나의 커밋으로 기록됨.
