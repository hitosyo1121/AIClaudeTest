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
  `);
}
