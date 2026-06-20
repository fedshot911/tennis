const DATA_PATHS = {
  rackets: "../assets/data/rackets.v1.1.0.json",
  questions: "../assets/data/quiz-questions.v1.1.1.json",
  rules: "../assets/data/recommendation-rules.v1.1.1.json"
};

const KAKAO_JS_KEY = document.querySelector('meta[name="kakao-js-key"]')?.content.trim() || "";

const state = {
  rackets: [],
  rules: null,
  questions: [],
  currentIndex: 0,
  answers: {},
  result: null,
  resultRecordId: null
};

const HERO_COPY = {
  intro: {
    kicker: "Racket Finder",
    title: "나에게 맞는 라켓 찾기",
    lead: "라켓 고르기, 생각보다 취향 많이 탑니다. 예쁜 거 샀다가 팔이 먼저 퇴근할 수도 있으니까요."
  },
  result: {
    kicker: "Match Result",
    title: "당신에게 맞는 라켓",
    lead: "답변을 기준으로 플레이 성향, 스윙 느낌, 장비 취향을 매칭했어요. 추천 이유와 스펙을 보고 내 라켓 후보로 괜찮은지 확인해보세요."
  }
};

const $ = (selector) => document.querySelector(selector);

init();

async function init() {
  try {
    const [racketsData, questionsData, rulesData] = await Promise.all([
      fetchJson(DATA_PATHS.rackets),
      fetchJson(DATA_PATHS.questions),
      fetchJson(DATA_PATHS.rules)
    ]);

    state.rackets = racketsData.records.filter((racket) => racket.active_for_quiz);
    state.questions = questionsData.questions.sort((a, b) => a.order - b.order);
    state.rules = rulesData;

    bindControls();
    renderSharedResultFromUrl();
    updateKakaoButtonState();
  } catch (error) {
    $("#quizSection").classList.remove("is-hidden");
    $("#quizSection").innerHTML = `<div class="load-error">${escapeHtml(error.message)}</div>`;
  }
}

async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`데이터를 불러오지 못했습니다: ${path}`);
  }
  return response.json();
}

function bindControls() {
  $("#startButton").addEventListener("click", startQuiz);
  $("#prevButton").addEventListener("click", goPrevious);
  $("#restartButton").addEventListener("click", restartQuiz);
  $("#retryButton").addEventListener("click", restartQuiz);
  $("#shareButton").addEventListener("click", shareResult);
  $("#kakaoShareButton").addEventListener("click", shareKakaoResult);
  window.addEventListener("resize", fitResultHeadings);
}

function startQuiz() {
  state.currentIndex = 0;
  document.body.classList.remove("finder-result-mode");
  setHeroCopy("intro");
  $("#introCard").classList.add("is-hidden");
  $("#resultSection").classList.add("is-hidden");
  $("#quizSection").classList.remove("is-hidden");
  renderQuestion();
  requestAnimationFrame(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function restartQuiz() {
  state.currentIndex = 0;
  state.answers = {};
  state.result = null;
  state.resultRecordId = null;
  document.body.classList.remove("finder-result-mode");
  setHeroCopy("intro");
  $("#introCard").classList.remove("is-hidden");
  $("#quizSection").classList.add("is-hidden");
  $("#resultSection").classList.add("is-hidden");
  $("#shareButton").textContent = "링크 복사";
  $("#kakaoShareButton").textContent = "카카오톡 공유";
  history.replaceState(null, "", location.pathname);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function goPrevious() {
  if (state.currentIndex === 0) return;
  state.currentIndex -= 1;
  renderQuestion();
}

function renderQuestion() {
  const question = state.questions[state.currentIndex];
  const total = state.questions.length;
  const answeredCount = Object.keys(state.answers).length;
  const progress = Math.round(((state.currentIndex + 1) / total) * 100);

  $("#questionCounter").textContent = `${state.currentIndex + 1} / ${total}`;
  $("#answeredCounter").textContent = `답변 ${answeredCount}개`;
  $("#progressFill").style.width = `${progress}%`;
  $("#questionPurpose").textContent = purposeLabel(question.purpose);
  $("#questionTitle").textContent = question.title;
  $("#prevButton").disabled = state.currentIndex === 0;

  $("#answerGrid").innerHTML = question.answers.map((answer) => {
    const activeClass = state.answers[question.id] === answer.id ? " active" : "";
    return `
      <button class="answer-button${activeClass}" type="button" data-answer-id="${escapeHtml(answer.id)}">
        ${escapeHtml(answer.label)}
      </button>
    `;
  }).join("");

  $("#answerGrid").querySelectorAll(".answer-button").forEach((button) => {
    button.addEventListener("click", () => selectAnswer(question.id, button.dataset.answerId));
  });
}

function selectAnswer(questionId, answerId) {
  state.answers[questionId] = answerId;

  const isLastQuestion = state.currentIndex === state.questions.length - 1;
  if (isLastQuestion) {
    $("#progressFill").style.width = "100%";
    showResult();
    return;
  }

  state.currentIndex += 1;
  renderQuestion();
}

function showResult() {
  const result = calculateRecommendation(state.answers);
  state.result = result;
  state.resultRecordId = null;
  renderResult(result);
  saveQuizResult(result);
  document.body.classList.add("finder-result-mode");
  setHeroCopy("result");
  $("#quizSection").classList.add("is-hidden");
  $("#resultSection").classList.remove("is-hidden");
  fitResultHeadings();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderSharedResultFromUrl() {
  const shared = getSharedResultFromUrl();
  if (!shared) return;

  const result = createResultFromRacket(shared.racket, shared.imageVariant);
  state.answers = {
    q1_visual_gender: shared.imageVariant === "female" ? "female_visual" : "male_visual"
  };
  state.result = result;
  state.resultRecordId = null;

  renderResult(result);
  document.body.classList.add("finder-result-mode");
  setHeroCopy("result");
  $("#introCard").classList.add("is-hidden");
  $("#quizSection").classList.add("is-hidden");
  $("#resultSection").classList.remove("is-hidden");
  fitResultHeadings();

  if (shared.shouldCleanUrl) {
    history.replaceState(null, "", buildShareUrl(result));
  }
}

function getSharedResultFromUrl() {
  const params = new URLSearchParams(location.search);
  const racketId = normalizeRacketId(params.get("racket"));
  if (!racketId) return null;

  const racket = state.rackets.find((item) => item.racket_id === racketId);
  if (!racket) return null;

  const imageVariant = params.get("image") === "female" ? "female" : "male";
  return {
    racket,
    imageVariant,
    shouldCleanUrl: params.get("racket") !== racketId || !params.has("image")
  };
}

function normalizeRacketId(value) {
  const match = String(value || "").trim().match(/[a-z0-9]+(?:_[a-z0-9]+)*/i);
  return match ? match[0] : "";
}

function calculateRecommendation(selection) {
  const rules = state.rules;
  const confidenceRank = rules.scoring_model.confidence_rank;

  const scored = state.rackets.map((racket) => {
    const tags = new Set(racket.recommendation_tags);
    let total = 0;
    let directBoost = 0;

    for (const [questionId, answerId] of Object.entries(selection)) {
      const answerRule = rules.answer_rules[questionId]?.[answerId];
      if (!answerRule) continue;

      for (const [tag, score] of Object.entries(answerRule.tag_scores ?? {})) {
        if (tags.has(tag)) total += score;
      }

      for (const [tag, score] of Object.entries(answerRule.penalties ?? {})) {
        if (tags.has(tag)) total += score;
      }

      const boost = answerRule.racket_boosts?.[racket.racket_id] ?? 0;
      total += boost;
      directBoost += boost;
    }

    return {
      racket,
      total,
      directBoost,
      confidence: confidenceRank[racket.confidence] ?? 0,
      priority: rules.racket_priority_rank[racket.racket_id] ?? 9999
    };
  });

  scored.sort((a, b) =>
    b.total - a.total ||
    b.directBoost - a.directBoost ||
    b.confidence - a.confidence ||
    a.priority - b.priority
  );

  return {
    ...scored[0],
    imagePath: selection.q1_visual_gender === "female_visual"
      ? scored[0].racket.result_image_female_path
      : scored[0].racket.result_image_male_path
  };
}

function createResultFromRacket(racket, imageVariant = "male") {
  return {
    racket,
    total: 0,
    directBoost: 0,
    confidence: state.rules.scoring_model.confidence_rank[racket.confidence] ?? 0,
    priority: state.rules.racket_priority_rank[racket.racket_id] ?? 9999,
    imageVariant,
    imagePath: imageVariant === "female"
      ? racket.result_image_female_path
      : racket.result_image_male_path
  };
}

function renderResult(result) {
  const racket = result.racket;

  $("#heroImage").src = racketPath(result.imagePath);
  $("#heroImage").alt = `${racket.display_name} 결과 이미지`;

  $("#productImage").src = racketPath(racket.product_image_path);
  $("#productImage").alt = `${racket.display_name} 라켓 이미지`;

  $("#resultTitle").textContent = racket.result_title;
  $("#resultSummary").textContent = racket.result_summary;
  $("#racketBrand").textContent = `${racket.brand} / ${racket.line}`;
  $("#racketName").textContent = racket.model;
  $("#resultReason").textContent = racket.result_reason_template;
  $("#headSize").textContent = `${racket.head_size_sq_in} sq in`;
  $("#weight").textContent = `${racket.unstrung_weight_g} g`;
  $("#styleTags").textContent = racket.recommendation_tags.slice(0, 4).join(" · ");
  $("#caution").textContent = racket.caution || "스트링과 텐션에 따라 체감은 달라질 수 있습니다.";
  $("#playerContext").textContent = racket.player_context || "업데이트 예정";
  $("#playerNote").textContent = racket.player_context_note || "공식 출처 확인 후 업데이트 예정";
  fitResultHeadings();
}

function fitResultHeadings() {
  const resultSection = $("#resultSection");
  if (!resultSection || resultSection.classList.contains("is-hidden")) return;

  fitSingleLine($("#resultTitle"), 28);
  fitSingleLine($("#racketName"), 22);
}

function fitSingleLine(element, minFontSize) {
  if (!element) return;

  element.style.fontSize = "";
  if (window.matchMedia("(max-width: 620px)").matches) {
    return;
  }

  let fontSize = parseFloat(window.getComputedStyle(element).fontSize);
  element.style.whiteSpace = "nowrap";

  while (element.scrollWidth > element.clientWidth && fontSize > minFontSize) {
    fontSize -= 1;
    element.style.fontSize = `${fontSize}px`;
  }
}

function setHeroCopy(mode) {
  const copy = HERO_COPY[mode] || HERO_COPY.intro;
  $(".finder-kicker").textContent = copy.kicker;
  $("#page-title").textContent = copy.title;
  $(".finder-lead").textContent = copy.lead;
}

async function shareResult() {
  if (!state.result) return;

  await copyShareUrl();
}

async function shareKakaoResult() {
  if (!state.result) return;

  if (!initializeKakao()) {
    await copyShareUrl("카카오 설정 전이라 링크 복사됨", $("#kakaoShareButton"), "카카오톡 공유");
    return;
  }

  const payload = buildSharePayload(state.result);

  try {
    Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: payload.title,
        description: payload.description,
        imageUrl: payload.imageUrl,
        link: {
          mobileWebUrl: payload.url,
          webUrl: payload.url
        }
      },
      buttons: [
        {
          title: "결과 보기",
          link: {
            mobileWebUrl: payload.url,
            webUrl: payload.url
          }
        }
      ]
    });
    updateShareCount();
  } catch (error) {
    await copyShareUrl("카카오 공유 실패, 링크 복사됨", $("#kakaoShareButton"), "카카오톡 공유");
  }
}

async function copyShareUrl(message = "링크 복사됨", button = $("#shareButton"), resetText = "링크 복사") {
  try {
    await writeClipboardText(buildShareUrl(state.result));
    updateShareCount();
    button.textContent = message;
  } catch (error) {
    button.textContent = "복사 실패";
  }

  window.setTimeout(() => {
    button.textContent = resetText;
  }, 1600);
}

async function writeClipboardText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.append(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();

  if (!copied) {
    throw new Error("Clipboard copy failed");
  }
}

function initializeKakao() {
  if (!KAKAO_JS_KEY || !window.Kakao?.init || !window.Kakao?.isInitialized) return false;
  if (!Kakao.isInitialized()) {
    Kakao.init(KAKAO_JS_KEY);
  }
  return Kakao.isInitialized() && !!Kakao.Share?.sendDefault;
}

function updateKakaoButtonState() {
  const button = $("#kakaoShareButton");
  if (!button) return;

  if (!KAKAO_JS_KEY) {
    button.title = "Kakao Developers JavaScript 키를 meta[name='kakao-js-key']에 넣고 fedshot911.com을 플랫폼 도메인으로 등록해야 카카오톡 공유가 동작합니다.";
  }
}

function buildSharePayload(result) {
  const url = buildShareUrl(result);
  const racket = result.racket;
  return {
    title: `나에게 맞는 라켓은 ${racket.display_name}`,
    description: racket.result_summary || "테니스 성향에 맞는 라켓 추천 결과를 확인해보세요.",
    imageUrl: absoluteAssetUrl(result.imagePath),
    url
  };
}

function buildShareUrl(result) {
  const url = new URL(location.pathname, location.origin);
  url.searchParams.set("racket", result.racket.racket_id);
  url.searchParams.set("image", result.imageVariant || selectedImageVariant());
  return url.toString();
}

function selectedImageVariant() {
  return state.answers.q1_visual_gender === "female_visual" ? "female" : "male";
}

function absoluteAssetUrl(path) {
  if (/^https?:\/\//.test(path)) return path;
  return new URL(path.startsWith("/") ? path : path.replace(/^\.\.\//, "/"), location.origin).toString();
}

async function saveQuizResult(result) {
  try {
    const response = await fetch("/api/racket-results", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        result_racket_id: result.racket.racket_id,
        result_score: result.total,
        image_variant: state.answers.q1_visual_gender === "female_visual" ? "female" : "male",
        answers: state.answers
      })
    });

    if (!response.ok) return;

    const data = await response.json();
    if (data?.id) {
      state.resultRecordId = data.id;
    }
  } catch (error) {
    state.resultRecordId = null;
  }
}

async function updateShareCount() {
  if (!state.resultRecordId) return;

  try {
    await fetch("/api/racket-results/share", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({ id: state.resultRecordId })
    });
  } catch (error) {
    // Sharing should keep working even if analytics storage is unavailable.
  }
}

function purposeLabel(purpose) {
  const labels = {
    result_image_selection: "Result visual",
    skill_level: "Skill check",
    play_style: "Play style",
    preferred_impact: "Impact feel",
    swing_style: "Swing",
    racket_feel: "Racket feel",
    comfort_need: "Arm care",
    tie_breaker: "Shopping vibe",
    final_tie_breaker: "Final vibe"
  };

  return labels[purpose] || "Question";
}

function racketPath(path) {
  return path.startsWith("/") ? `..${path}` : path;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
