'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import type { TravelPlanRequest, TravelPlan } from '@/types';

interface TravelPlanFormProps {
  defaultStartDate?: string;
  onPlanGenerated: (plan: TravelPlan) => void;
}

export default function TravelPlanForm({ defaultStartDate, onPlanGenerated }: TravelPlanFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [childAgesInput, setChildAgesInput] = useState('');
  const [form, setForm] = useState<TravelPlanRequest>({
    destination: '',
    startDate: defaultStartDate || '',
    endDate: '',
    adults: 2,
    children: 1,
    childAges: [],
    preferences: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const childAges = childAgesInput
      .split(/[,、\s]+/)
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n) && n >= 0 && n <= 18);

    try {
      const res = await fetch('/api/ai/travel-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, childAges }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'プランの生成に失敗しました');
        return;
      }

      onPlanGenerated(data.plan);
    } catch {
      setError('ネットワークエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          目的地 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.destination}
          onChange={(e) => setForm({ ...form, destination: e.target.value })}
          placeholder="例: 沖縄、北海道、京都"
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">出発日</label>
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">帰宅日</label>
          <input
            type="date"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">大人の人数</label>
          <input
            type="number"
            min={1}
            max={20}
            value={form.adults}
            onChange={(e) => setForm({ ...form, adults: Number(e.target.value) })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">子供の人数</label>
          <input
            type="number"
            min={0}
            max={20}
            value={form.children}
            onChange={(e) => setForm({ ...form, children: Number(e.target.value) })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          子供の年齢（カンマ区切り）
        </label>
        <input
          type="text"
          value={childAgesInput}
          onChange={(e) => setChildAgesInput(e.target.value)}
          placeholder="例: 3, 6, 8"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">希望・条件（任意）</label>
        <textarea
          value={form.preferences}
          onChange={(e) => setForm({ ...form, preferences: e.target.value })}
          placeholder="例: 温泉あり、海水浴、アクティビティ重視、予算は家族で10万円程度"
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? '✨ AIがプランを作成中...' : '✨ AIでプランを作成する'}
      </Button>
    </form>
  );
}
