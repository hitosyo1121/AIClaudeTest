import { getDb } from '../client';
import type { FamilyMember } from '@/types';

export function getAllMembers(): FamilyMember[] {
  const db = getDb();
  return db.prepare('SELECT * FROM family_members ORDER BY created_at ASC').all() as FamilyMember[];
}

export function getMemberById(id: number): FamilyMember | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM family_members WHERE id = ?').get(id) as FamilyMember | undefined;
}

export function createMember(data: { name: string; color: string }): FamilyMember {
  const db = getDb();
  const result = db
    .prepare('INSERT INTO family_members (name, color) VALUES (?, ?)')
    .run(data.name, data.color);
  return getMemberById(result.lastInsertRowid as number)!;
}

export function updateMember(id: number, data: { name?: string; color?: string }): FamilyMember | undefined {
  const db = getDb();
  const fields: string[] = [];
  const values: string[] = [];
  if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
  if (data.color !== undefined) { fields.push('color = ?'); values.push(data.color); }
  if (fields.length === 0) return getMemberById(id);
  values.push(String(id));
  db.prepare(`UPDATE family_members SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  return getMemberById(id);
}

export function deleteMember(id: number): boolean {
  const db = getDb();
  // member_id を null に戻してからメンバー削除
  db.prepare('UPDATE events SET member_id = NULL WHERE member_id = ?').run(id);
  const result = db.prepare('DELETE FROM family_members WHERE id = ?').run(id);
  return result.changes > 0;
}
