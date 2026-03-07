import Database from 'better-sqlite3';

export function runMigrations(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT NOT NULL,
      date        TEXT NOT NULL,
      time        TEXT,
      type        TEXT NOT NULL DEFAULT 'regular',
      description TEXT,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS photos (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id      INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      filename      TEXT NOT NULL,
      original_name TEXT,
      uploaded_at   TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS family_members (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL,
      color      TEXT NOT NULL DEFAULT '#6366f1',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      endpoint   TEXT NOT NULL UNIQUE,
      p256dh     TEXT NOT NULL,
      auth       TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // 既存テーブルへのカラム追加（べき等マイグレーション）
  const alterStatements = [
    "ALTER TABLE events ADD COLUMN recurrence TEXT NOT NULL DEFAULT 'none'",
    "ALTER TABLE events ADD COLUMN recurrence_end_date TEXT",
    "ALTER TABLE events ADD COLUMN member_id INTEGER REFERENCES family_members(id)",
  ];

  for (const sql of alterStatements) {
    try {
      db.exec(sql);
    } catch {
      // カラムが既に存在する場合は無視
    }
  }
}
