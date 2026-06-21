const SECURITY_HEADERS = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()"
};
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

    if (!payload.data?.id || !UUID_PATTERN.test(payload.data.id)) {
      return jsonResponse({ ok: false, error: "Missing result id." }, 400);
    }

    const result = await db.prepare(`
      UPDATE quiz_results
      SET
        share_count = share_count + 1,
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(payload.data.id).run();

    if (result?.meta?.changes === 0) {
      return jsonResponse({ ok: false, error: "Result not found." }, 404);
    }

    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, error: "Failed to update share count." }, 500);
  }
}

async function parseJsonPayload(request) {
  try {
    return { ok: true, data: await request.json() };
  } catch (error) {
    return { ok: false, error: "Invalid JSON payload." };
  }
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
