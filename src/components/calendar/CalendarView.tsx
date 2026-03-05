'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { ja } from 'date-fns/locale';
import type { Event } from '@/types';
import { EVENT_TYPE_DOT_COLORS, EVENT_TYPE_LABELS } from '@/types';

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const monthStr = format(currentDate, 'yyyy-MM');

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/events?month=${monthStr}`);
      const data = await res.json();
      setEvents(data.events || []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [monthStr]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDay = (day: Date) =>
    events.filter((e) => e.date === format(day, 'yyyy-MM-dd'));

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  return (
    <div>
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1))}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 text-xl"
        >
          ‹
        </button>
        <h2 className="text-2xl font-bold text-gray-800">
          {format(currentDate, 'yyyy年 M月', { locale: ja })}
        </h2>
        <button
          onClick={() => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1))}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 text-xl"
        >
          ›
        </button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((day, i) => (
          <div
            key={day}
            className={`text-center text-xs font-medium py-2 ${
              i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* カレンダーグリッド */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">読み込み中...</div>
      ) : (
        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-xl overflow-hidden border border-gray-200">
          {days.map((day) => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isSelected = selectedDay && isSameDay(day, selectedDay);
            const todayDay = isToday(day);
            const dayOfWeek = day.getDay();

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDay(isSameDay(day, selectedDay ?? new Date(0)) ? null : day)}
                className={`bg-white p-2 min-h-[80px] text-left transition-colors hover:bg-blue-50 ${
                  isSelected ? 'ring-2 ring-blue-400 ring-inset' : ''
                } ${!isCurrentMonth ? 'opacity-40' : ''}`}
              >
                <span
                  className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium ${
                    todayDay
                      ? 'bg-blue-600 text-white'
                      : dayOfWeek === 0
                      ? 'text-red-500'
                      : dayOfWeek === 6
                      ? 'text-blue-500'
                      : 'text-gray-700'
                  }`}
                >
                  {format(day, 'd')}
                </span>
                <div className="mt-1 space-y-0.5">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-1"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${EVENT_TYPE_DOT_COLORS[event.type]}`} />
                      <span className="text-xs text-gray-600 truncate leading-tight">
                        {event.title}
                      </span>
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-400">+{dayEvents.length - 3}件</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* 選択日のイベント表示 */}
      {selectedDay && (
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">
              {format(selectedDay, 'M月d日（E）', { locale: ja })}の予定
            </h3>
            <Link
              href={`/events/new?date=${format(selectedDay, 'yyyy-MM-dd')}`}
              className="text-sm text-blue-600 hover:underline"
            >
              ＋ 予定を追加
            </Link>
          </div>
          {selectedDayEvents.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">予定はありません</p>
          ) : (
            <ul className="space-y-2">
              {selectedDayEvents.map((event) => (
                <li key={event.id}>
                  <Link
                    href={`/events/${event.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${EVENT_TYPE_DOT_COLORS[event.type]}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{event.title}</p>
                      <p className="text-xs text-gray-400">
                        {event.time && `${event.time} · `}
                        {EVENT_TYPE_LABELS[event.type]}
                      </p>
                    </div>
                    <span className="text-gray-300">›</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* 凡例 */}
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-500">
        {Object.entries(EVENT_TYPE_LABELS).map(([type, label]) => (
          <div key={type} className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${EVENT_TYPE_DOT_COLORS[type as keyof typeof EVENT_TYPE_DOT_COLORS]}`} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
