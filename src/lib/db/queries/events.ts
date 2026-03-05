import { getDb } from '../client';
import type { Event, EventType } from '@/types';

export function getAllEvents(month?: string): Event[] {
  const db = getDb();
  if (month) {
    const stmt = db.prepare(`
      SELECT * FROM events WHERE date LIKE ? ORDER BY date ASC, time ASC
    `);
    return stmt.all(`${month}%`) as Event[];
  }
  const stmt = db.prepare('SELECT * FROM events ORDER BY date ASC, time ASC');
  return stmt.all() as Event[];
}

export function getEventById(id: number): Event | undefined {
  const db = getDb();
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(id) as Event | undefined;
  if (!event) return undefined;

  const photos = db.prepare('SELECT * FROM photos WHERE event_id = ? ORDER BY uploaded_at ASC').all(id);
  event.photos = photos as Event['photos'];
  return event;
}

export function createEvent(data: {
  title: string;
  date: string;
  time?: string;
  type: EventType;
  description?: string;
}): Event {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO events (title, date, time, type, description)
    VALUES (?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    data.title,
    data.date,
    data.time || null,
    data.type,
    data.description || null,
  );
  return getEventById(result.lastInsertRowid as number)!;
}

export function updateEvent(
  id: number,
  data: {
    title?: string;
    date?: string;
    time?: string;
    type?: EventType;
    description?: string;
  },
): Event | undefined {
  const db = getDb();
  const fields: string[] = [];
  const values: (string | null)[] = [];

  if (data.title !== undefined) { fields.push('title = ?'); values.push(data.title); }
  if (data.date !== undefined) { fields.push('date = ?'); values.push(data.date); }
  if (data.time !== undefined) { fields.push('time = ?'); values.push(data.time || null); }
  if (data.type !== undefined) { fields.push('type = ?'); values.push(data.type); }
  if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description || null); }

  if (fields.length === 0) return getEventById(id);

  values.push(String(id));
  db.prepare(`UPDATE events SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  return getEventById(id);
}

export function deleteEvent(id: number): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM events WHERE id = ?').run(id);
  return result.changes > 0;
}
