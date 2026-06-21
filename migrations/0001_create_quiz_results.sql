CREATE TABLE IF NOT EXISTS quiz_results (
  id TEXT PRIMARY KEY,
  quiz_id TEXT NOT NULL,
  quiz_version TEXT NOT NULL,
  result_racket_id TEXT NOT NULL,
  result_score REAL NOT NULL DEFAULT 0,
  image_variant TEXT,
  answers_json TEXT NOT NULL,
  share_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_quiz_results_created_at
  ON quiz_results (created_at);

CREATE INDEX IF NOT EXISTS idx_quiz_results_result_racket_id
  ON quiz_results (result_racket_id);
