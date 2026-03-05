'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import type { SpotRecommendationRequest } from '@/types';

interface SpotSearchFormProps {
  onSearch: (req: SpotRecommendationRequest) => void;
  loading: boolean;
}

const REGIONS = ['東京・関東', '大阪・関西', '愛知・中部', '北海道', '沖縄・九州', '東北', '北陸・甲信越', '中国・四国'];
const SEASONS = [
  { value: 'spring', label: '春（3〜5月）' },
  { value: 'summer', label: '夏（6〜8月）' },
  { value: 'autumn', label: '秋（9〜11月）' },
  { value: 'winter', label: '冬（12〜2月）' },
];
const ACTIVITY_TYPES = [
  { value: 'all', label: 'すべて' },
  { value: 'outdoor', label: '屋外' },
  { value: 'indoor', label: '屋内' },
  { value: 'cultural', label: '文化・学習' },
];

export default function SpotSearchForm({ onSearch, loading }: SpotSearchFormProps) {
  const getCurrentSeason = (): SpotRecommendationRequest['season'] => {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  };

  const [form, setForm] = useState<SpotRecommendationRequest>({
    region: '東京・関東',
    season: getCurrentSeason(),
    childAgeMin: 2,
    childAgeMax: 10,
    activityType: 'all',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(form);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <h3 className="font-bold text-gray-800 text-lg">🔍 検索条件</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">エリア</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {REGIONS.map((region) => (
            <button
              key={region}
              type="button"
              onClick={() => setForm({ ...form, region })}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                form.region === region
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {region}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">季節</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SEASONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setForm({ ...form, season: value as SpotRecommendationRequest['season'] })}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                form.season === value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">子供の年齢（最小）</label>
          <select
            value={form.childAgeMin}
            onChange={(e) => setForm({ ...form, childAgeMin: Number(e.target.value) })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 19 }, (_, i) => (
              <option key={i} value={i}>{i}歳</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">子供の年齢（最大）</label>
          <select
            value={form.childAgeMax}
            onChange={(e) => setForm({ ...form, childAgeMax: Number(e.target.value) })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 19 }, (_, i) => (
              <option key={i} value={i}>{i}歳</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">アクティビティタイプ</label>
        <div className="flex gap-2 flex-wrap">
          {ACTIVITY_TYPES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setForm({ ...form, activityType: value as SpotRecommendationRequest['activityType'] })}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                form.activityType === value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? '🔍 AIが検索中...' : '🗺️ スポットを探す'}
      </Button>
    </form>
  );
}
