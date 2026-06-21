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

    const payload = await context.request.json();
    if (!payload?.id || typeof payload.id !== "string") {
      return jsonResponse({ ok: false, error: "Missing result id." }, 400);
    }

    await db.prepare(`
      UPDATE quiz_results
      SET
        share_count = share_count + 1,
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(payload.id).run();

    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, error: "Failed to update share count." }, 500);
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
