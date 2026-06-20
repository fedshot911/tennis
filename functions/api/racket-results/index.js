const QUIZ_ID = "racket_finder";
const QUIZ_VERSION = "v1.1.0";
const MAX_ANSWERS_JSON_LENGTH = 12000;

export async function onRequestPost(context) {
  try {
    const db = context.env.RACKET_RESULTS_DB;
    if (!db) {
      return jsonResponse({ ok: false, error: "D1 binding is not configured." }, 500);
    }

    const payload = await context.request.json();
    const validationError = validatePayload(payload);
    if (validationError) {
      return jsonResponse({ ok: false, error: validationError }, 400);
    }

    const id = crypto.randomUUID();
    const answersJson = JSON.stringify(payload.answers);
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
      payload.result_racket_id,
      Number(payload.result_score || 0),
      payload.image_variant || null,
      answersJson
    ).run();

    return jsonResponse({ ok: true, id }, 201);
  } catch (error) {
    return jsonResponse({ ok: false, error: "Failed to save quiz result." }, 500);
  }
}

function validatePayload(payload) {
  if (!payload || typeof payload !== "object") {
    return "Invalid JSON payload.";
  }

  if (!isNonEmptyString(payload.result_racket_id)) {
    return "Missing result_racket_id.";
  }

  if (!payload.answers || typeof payload.answers !== "object" || Array.isArray(payload.answers)) {
    return "Missing answers.";
  }

  return "";
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}
