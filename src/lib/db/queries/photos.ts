import { getDb } from '../client';
import type { Photo } from '@/types';

export function insertPhoto(data: {
  event_id: number;
  filename: string;
  original_name?: string;
}): Photo {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO photos (event_id, filename, original_name)
    VALUES (?, ?, ?)
  `);
  const result = stmt.run(data.event_id, data.filename, data.original_name || null);
  return db.prepare('SELECT * FROM photos WHERE id = ?').get(result.lastInsertRowid) as Photo;
}

export function deletePhoto(id: number): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM photos WHERE id = ?').run(id);
  return result.changes > 0;
}

export function getPhotosByEventId(eventId: number): Photo[] {
  const db = getDb();
  return db.prepare('SELECT * FROM photos WHERE event_id = ? ORDER BY uploaded_at ASC').all(eventId) as Photo[];
}
