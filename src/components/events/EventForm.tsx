'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import type { Event, EventType } from '@/types';
import { EVENT_TYPE_LABELS } from '@/types';

interface EventFormProps {
  event?: Event;
  defaultDate?: string;
}

export default function EventForm({ event, defaultDate }: EventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: event?.title || '',
    date: event?.date || defaultDate || new Date().toISOString().split('T')[0],
    time: event?.time || '',
    type: (event?.type || 'regular') as EventType,
    description: event?.description || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const method = event ? 'PUT' : 'POST';
      const url = event ? `/api/events/${event.id}` : '/api/events';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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
