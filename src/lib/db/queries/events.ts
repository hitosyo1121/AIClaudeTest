import { getDb } from '../client';
import type { Event, EventType, RecurrenceType } from '@/types';
import { addDays, addWeeks, addMonths, addYears, format, parseISO, isAfter, isBefore, isEqual } from 'date-fns';

type RawEvent = Omit<Event, 'member'>;

function expandRecurringEvents(events: RawEvent[], monthStart: string, monthEnd: string): RawEvent[] {
  const result: RawEvent[] = [];
  const start = parseISO(monthStart);
  const end = parseISO(monthEnd);

  for (const event of events) {
    if (!event.recurrence || event.recurrence === 'none') {
      result.push(event);
      continue;
    }

    const eventDate = parseISO(event.date);
    const endDate = event.recurrence_end_date ? parseISO(event.recurrence_end_date) : addYears(new Date(), 5);

    let current = eventDate;
    let occurrenceIndex = 0;

    while (!isAfter(current, end) && !isAfter(current, endDate)) {
      const dateStr = format(current, 'yyyy-MM-dd');
      if (!isBefore(current, start) || isEqual(current, start)) {
        if (dateStr >= monthStart && dateStr <= monthEnd) {
          result.push({
            ...event,
            id: occurrenceIndex === 0 ? event.id : -(event.id * 10000 + occurrenceIndex),
            date: dateStr,
          });
        }
      }

      occurrenceIndex++;
      switch (event.recurrence) {
        case 'daily':   current = addDays(current, 1); break;
        case 'weekly':  current = addWeeks(current, 1); break;
        case 'monthly': current = addMonths(current, 1); break;
        case 'yearly':  current = addYears(current, 1); break;
        default: current = addYears(current, 100);
      }
    }
  }

  return result.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return (a.time || '').localeCompare(b.time || '');
  });
}

function attachMembers(db: ReturnType<typeof getDb>, events: RawEvent[]): Event[] {
  return events.map((event) => {
    if (!event.member_id) return event as Event;
    const member = db.prepare('SELECT * FROM family_members WHERE id = ?').get(event.member_id);
    return { ...event, member } as Event;
  });
}

export function getAllEvents(month?: string, type?: string): Event[] {
  const db = getDb();

  if (month) {
    const monthStart = `${month}-01`;
    const [year, mon] = month.split('-').map(Number);
    const lastDay = new Date(year, mon, 0).getDate();
    const monthEnd = `${month}-${String(lastDay).padStart(2, '0')}`;

    const typeFilter = type ? ' AND type = ?' : '';
    const params: (string | number)[] = [monthEnd, monthStart, `${month}%`];
    if (type) params.push(type);

    const query = `
      SELECT * FROM events
      WHERE (
        (date <= ? AND (recurrence_end_date IS NULL OR recurrence_end_date >= ?) AND recurrence != 'none')
        OR (date LIKE ? AND (recurrence = 'none' OR recurrence IS NULL))
      )${typeFilter}
      ORDER BY date ASC, time ASC
    `;

    const raw = db.prepare(query).all(...params) as RawEvent[];
    const expanded = expandRecurringEvents(raw, monthStart, monthEnd);
    return attachMembers(db, expanded);
  }

  const typeFilter = type ? ' WHERE type = ?' : '';
  const params: string[] = type ? [type] : [];
  const raw = db.prepare(`SELECT * FROM events${typeFilter} ORDER BY date ASC, time ASC`).all(...params) as RawEvent[];
  return attachMembers(db, raw);
}

export function getEventById(id: number): Event | undefined {
  const db = getDb();
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(id) as RawEvent | undefined;
  if (!event) return undefined;

  const photos = db.prepare('SELECT * FROM photos WHERE event_id = ? ORDER BY uploaded_at ASC').all(id);
  const member = event.member_id
    ? (db.prepare('SELECT * FROM family_members WHERE id = ?').get(event.member_id) as Event['member'])
    : undefined;

  return { ...event, photos: photos as Event['photos'], member };
}

export function createEvent(data: {
  title: string;
  date: string;
  time?: string;
  type: EventType;
  description?: string;
  recurrence?: RecurrenceType;
  recurrence_end_date?: string;
  member_id?: number;
}): Event {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO events (title, date, time, type, description, recurrence, recurrence_end_date, member_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    data.title,
    data.date,
    data.time || null,
    data.type,
    data.description || null,
    data.recurrence || 'none',
    data.recurrence_end_date || null,
    data.member_id || null,
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
    recurrence?: RecurrenceType;
    recurrence_end_date?: string;
    member_id?: number | null;
  },
): Event | undefined {
  const db = getDb();
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (data.title !== undefined) { fields.push('title = ?'); values.push(data.title); }
  if (data.date !== undefined) { fields.push('date = ?'); values.push(data.date); }
  if (data.time !== undefined) { fields.push('time = ?'); values.push(data.time || null); }
  if (data.type !== undefined) { fields.push('type = ?'); values.push(data.type); }
  if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description || null); }
  if (data.recurrence !== undefined) { fields.push('recurrence = ?'); values.push(data.recurrence); }
  if (data.recurrence_end_date !== undefined) { fields.push('recurrence_end_date = ?'); values.push(data.recurrence_end_date || null); }
  if (data.member_id !== undefined) { fields.push('member_id = ?'); values.push(data.member_id ?? null); }

  if (fields.length === 0) return getEventById(id);

  values.push(id);
  db.prepare(`UPDATE events SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  return getEventById(id);
}

export function deleteEvent(id: number): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM events WHERE id = ?').run(id);
  return result.changes > 0;
}

export function getUpcomingBirthdays(daysAhead: number = 30): Event[] {
  const db = getDb();
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const events = db.prepare("SELECT * FROM events WHERE type = 'birthday' ORDER BY date ASC").all() as RawEvent[];

  const upcoming: RawEvent[] = [];
  for (const event of events) {
    const origDate = parseISO(event.date);
    for (let yearOffset = 0; yearOffset <= 1; yearOffset++) {
      const candidate = new Date(todayDate.getFullYear() + yearOffset, origDate.getMonth(), origDate.getDate());
      const diffMs = candidate.getTime() - todayDate.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= daysAhead) {
        upcoming.push({ ...event, date: format(candidate, 'yyyy-MM-dd') });
        break;
      }
    }
  }

  upcoming.sort((a, b) => a.date.localeCompare(b.date));
  return attachMembers(db, upcoming);
}

export function getTomorrowEvents(): Event[] {
  const db = getDb();
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  const raw = db.prepare('SELECT * FROM events WHERE date = ? ORDER BY time ASC').all(tomorrow) as RawEvent[];
  return attachMembers(db, raw);
}
