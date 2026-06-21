const QUIZ_ID = "racket_finder";
const QUIZ_VERSION = "v1.1.0";
const MAX_ANSWERS_JSON_LENGTH = 12000;
const MAX_RESULT_SCORE = 10000;
const MAX_ANSWER_COUNT = 20;
const SAFE_ID_PATTERN = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;
const QUESTION_ID_PATTERN = /^q[0-9]+_[a-z0-9_]+$/;
const IMAGE_VARIANTS = new Set(["male", "female"]);
const SECURITY_HEADERS = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()"
};

export async function onRequestPost(context) {
  try {
    const db = context.env.RACKET_RESULTS_DB;
    if (!db) {
      return jsonResponse({ ok: false, error: "D1 binding is not configured." }, 500);
    }

    const payload = await parseJsonPayload(context.request);
    if (!payload.ok) {
      return jsonResponse({ ok: false, error: payload.error }, 400);
    }

    const data = payload.data;
    const validationError = validatePayload(data);
    if (validationError) {
      return jsonResponse({ ok: false, error: validationError }, 400);
    }

    const id = crypto.randomUUID();
    const answersJson = JSON.stringify(data.answers);
    if (answersJson.length > MAX_ANSWERS_JSON_LENGTH) {
      return jsonResponse({ ok: false, error: "Answers payload is too large." }, 413);
    }

    await db.prepare(`
      INSERT INTO quiz_results (
        id,
        quiz_id,
        quiz_version,
        result_racket_id,
        result_score,
        image_variant,
        answers_json
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      QUIZ_ID,
      QUIZ_VERSION,
      data.result_racket_id,
      normalizeResultScore(data.result_score),
      data.image_variant || null,
      answersJson
    ).run();

    return jsonResponse({ ok: true, id }, 201);
  } catch (error) {
    return jsonResponse({ ok: false, error: "Failed to save quiz result." }, 500);
  }
}

async function parseJsonPayload(request) {
  try {
    return { ok: true, data: await request.json() };
  } catch (error) {
    return { ok: false, error: "Invalid JSON payload." };
  }
}

function validatePayload(payload) {
  if (!isPlainObject(payload)) {
    return "Invalid JSON payload.";
  }

  if (!isSafeId(payload.result_racket_id)) {
    return "Missing result_racket_id.";
  }

  if (!isValidOptionalScore(payload.result_score)) {
    return "Invalid result_score.";
  }

  if (payload.image_variant != null && !IMAGE_VARIANTS.has(payload.image_variant)) {
    return "Invalid image_variant.";
  }

  if (!isPlainObject(payload.answers)) {
    return "Missing answers.";
  }

  const answerEntries = Object.entries(payload.answers);
  if (answerEntries.length === 0 || answerEntries.length > MAX_ANSWER_COUNT) {
    return "Invalid answers.";
  }

  for (const [questionId, answerId] of answerEntries) {
    if (!QUESTION_ID_PATTERN.test(questionId) || !isSafeId(answerId)) {
      return "Invalid answers.";
    }
  }

  return "";
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isSafeId(value) {
  return typeof value === "string" && value.length <= 80 && SAFE_ID_PATTERN.test(value);
}

function isValidOptionalScore(value) {
  if (value == null) {
    return true;
  }

  return typeof value === "number" && Number.isFinite(value) && Math.abs(value) <= MAX_RESULT_SCORE;
}

function normalizeResultScore(value) {
  return value == null ? 0 : value;
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...SECURITY_HEADERS,
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}
