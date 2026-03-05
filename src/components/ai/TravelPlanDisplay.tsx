'use client';

import { useState } from 'react';
import type { TravelPlan } from '@/types';

interface TravelPlanDisplayProps {
  plan: TravelPlan;
}

export default function TravelPlanDisplay({ plan }: TravelPlanDisplayProps) {
  const [openDay, setOpenDay] = useState<number | null>(0);

  return (
    <div className="space-y-4">
      {/* 概要 */}
      <div className="bg-blue-50 rounded-xl p-4">
        <h4 className="font-bold text-blue-800 mb-2">📋 旅行概要</h4>
        <p className="text-blue-700 text-sm leading-relaxed">{plan.overview}</p>
        {plan.budget && (
          <p className="text-blue-600 text-sm mt-2 font-medium">💰 {plan.budget}</p>
        )}
      </div>

      {/* 日別プラン */}
      {plan.days && plan.days.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-bold text-gray-700">📅 日別スケジュール</h4>
          {plan.days.map((day, i) => (
            <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenDay(openDay === i ? null : i)}
                className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="text-left">
                  <span className="font-bold text-gray-800">
                    {day.day}日目 {day.date && `(${day.date})`}
                  </span>
                  <span className="ml-2 text-gray-500 text-sm">{day.title}</span>
                </div>
                <span className="text-gray-400">{openDay === i ? '▲' : '▼'}</span>
              </button>

              {openDay === i && day.schedule && (
                <div className="border-t border-gray-100 p-4 space-y-3">
                  {day.schedule.map((item, j) => (
                    <div key={j} className="flex gap-3">
                      <div className="text-sm text-blue-600 font-mono font-medium w-14 flex-shrink-0 pt-0.5">
                        {item.time}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 text-sm">{item.activity}</p>
                        <p className="text-gray-500 text-sm mt-0.5">{item.description}</p>
                        {item.tips && (
                          <p className="text-orange-600 text-xs mt-1">
                            👶 {item.tips}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* アドバイス */}
      {plan.tips && plan.tips.length > 0 && (
        <div className="bg-yellow-50 rounded-xl p-4">
          <h4 className="font-bold text-yellow-800 mb-2">💡 旅のアドバイス</h4>
          <ul className="space-y-1">
            {plan.tips.map((tip, i) => (
              <li key={i} className="text-yellow-700 text-sm flex items-start gap-2">
                <span className="text-yellow-500 flex-shrink-0">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
