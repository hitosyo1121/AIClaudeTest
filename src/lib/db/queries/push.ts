import { getDb } from '../client';

export interface PushSubscription {
  id: number;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
}

export function getAllSubscriptions(): PushSubscription[] {
  const db = getDb();
  return db.prepare('SELECT * FROM push_subscriptions').all() as PushSubscription[];
}

export function saveSubscription(data: { endpoint: string; p256dh: string; auth: string }): PushSubscription {
  const db = getDb();
  db.prepare(`
    INSERT INTO push_subscriptions (endpoint, p256dh, auth)
    VALUES (?, ?, ?)
    ON CONFLICT(endpoint) DO UPDATE SET p256dh = excluded.p256dh, auth = excluded.auth
  `).run(data.endpoint, data.p256dh, data.auth);
  return db.prepare('SELECT * FROM push_subscriptions WHERE endpoint = ?').get(data.endpoint) as PushSubscription;
}

export function deleteSubscription(endpoint: string): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM push_subscriptions WHERE endpoint = ?').run(endpoint);
  return result.changes > 0;
}
