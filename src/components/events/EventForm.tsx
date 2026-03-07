'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import type { Event, EventType, RecurrenceType, FamilyMember } from '@/types';
import { EVENT_TYPE_LABELS, RECURRENCE_LABELS } from '@/types';

interface EventFormProps {
  event?: Event;
  defaultDate?: string;
}

export default function EventForm({ event, defaultDate }: EventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [members, setMembers] = useState<FamilyMember[]>([]);

  const [form, setForm] = useState({
    title: event?.title || '',
    date: event?.date || defaultDate || new Date().toISOString().split('T')[0],
    time: event?.time || '',
    type: (event?.type || 'regular') as EventType,
    description: event?.description || '',
    recurrence: (event?.recurrence || 'none') as RecurrenceType,
    recurrence_end_date: event?.recurrence_end_date || '',
    member_id: event?.member_id || null as number | null,
  });

  useEffect(() => {
    fetch('/api/members')
      .then((r) => r.json())
      .then((d) => setMembers(d.members || []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const method = event ? 'PUT' : 'POST';
      const url = event ? `/api/events/${event.id}` : '/api/events';

      const payload = {
        ...form,
        member_id: form.member_id || undefined,
        recurrence_end_date: form.recurrence === 'none' ? undefined : form.recurrence_end_date || undefined,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '保存に失敗しました');
        return;
      }

      router.push(`/events/${data.event.id}`);
      router.refresh();
    } catch {
      setError('ネットワークエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          タイトル <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="例: 家族でディズニーランドへ"
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            日付 <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">時刻（任意）</label>
          <input
            type="time"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {(Object.entries(EVENT_TYPE_LABELS) as [EventType, string][]).map(([type, label]) => (
            <button
              key={type}
              type="button"
              onClick={() => setForm({ ...form, type })}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                form.type === type
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 繰り返し設定 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">繰り返し</label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {(Object.entries(RECURRENCE_LABELS) as [RecurrenceType, string][]).map(([rec, label]) => (
            <button
              key={rec}
              type="button"
              onClick={() => setForm({ ...form, recurrence: rec })}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                form.recurrence === rec
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {form.recurrence !== 'none' && (
          <div className="mt-2">
            <label className="block text-xs text-gray-500 mb-1">繰り返し終了日（任意）</label>
            <input
              type="date"
              value={form.recurrence_end_date}
              onChange={(e) => setForm({ ...form, recurrence_end_date: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        )}
      </div>

      {/* 家族メンバー選択 */}
      {members.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">担当メンバー（任意）</label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setForm({ ...form, member_id: null })}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                !form.member_id
                  ? 'bg-gray-700 text-white border-gray-700'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              なし
            </button>
            {members.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => setForm({ ...form, member_id: member.id })}
                className={`px-3 py-1.5 rounded-full text-sm border-2 transition-colors font-medium ${
                  form.member_id === member.id ? 'text-white' : 'bg-white'
                }`}
                style={
                  form.member_id === member.id
                    ? { backgroundColor: member.color, borderColor: member.color }
                    : { borderColor: member.color, color: member.color }
                }
              >
                {member.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">メモ（任意）</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="詳細やメモを入力..."
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? '保存中...' : event ? '更新する' : '作成する'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          キャンセル
        </Button>
      </div>
    </form>
  );
}
