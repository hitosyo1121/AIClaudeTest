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
  differenceInCalendarDays,
  parseISO,
} from 'date-fns';
import { ja } from 'date-fns/locale';
import type { Event, FamilyMember } from '@/types';
import { EVENT_TYPE_DOT_COLORS, EVENT_TYPE_LABELS } from '@/types';

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

function BirthdayCountdown({ events }: { events: Event[] }) {
  if (events.length === 0) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = events
    .map((e) => {
      const days = differenceInCalendarDays(parseISO(e.date), today);
      return { event: e, days };
    })
    .filter((x) => x.days >= 0)
    .sort((a, b) => a.days - b.days);

  if (upcoming.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {upcoming.slice(0, 3).map(({ event, days }) => (
        <div
          key={event.id}
          className="flex items-center gap-2 bg-pink-50 border border-pink-200 rounded-full px-4 py-1.5 text-sm"
        >
          <span>🎂</span>
          <span className="text-pink-700 font-medium">
            {event.title}まであと
            <span className="text-lg font-bold mx-1">{days}</span>日
          </span>
        </div>
      ))}
    </div>
  );
}

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [birthdayEvents, setBirthdayEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);

  // AI 要約
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);

  // プッシュ通知
  const [notifSupported, setNotifSupported] = useState(false);
  const [notifGranted, setNotifGranted] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);

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
    setSummary('');
  }, [fetchEvents]);

  useEffect(() => {
    fetch('/api/events?type=birthday')
      .then((r) => r.json())
      .then((d) => setBirthdayEvents(d.events || []))
      .catch(() => {});
    fetch('/api/members')
      .then((r) => r.json())
      .then((d) => setMembers(d.members || []))
      .catch(() => {});

    // 通知サポート確認
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setNotifSupported(true);
      setNotifGranted(Notification.permission === 'granted');
    }
  }, []);

  const handleEnableNotifications = async () => {
    if (!notifSupported) return;
    setNotifLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setNotifLoading(false);
        return;
      }
      setNotifGranted(true);

      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        alert('VAPID公開鍵が設定されていません');
        setNotifLoading(false);
        return;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey).buffer as ArrayBuffer,
      });

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      });

      alert('通知が有効になりました！明日の予定を毎日お知らせします。');
    } catch (err) {
      console.error('push registration error:', err);
      alert('通知の設定に失敗しました');
    } finally {
      setNotifLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    setSummaryLoading(true);
    setSummary('');
    try {
      const res = await fetch('/api/ai/monthly-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: monthStr }),
      });
      const data = await res.json();
      setSummary(data.summary || 'まとめを生成できませんでした。');
    } catch {
      setSummary('エラーが発生しました。');
    } finally {
      setSummaryLoading(false);
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDay = (day: Date) =>
    events.filter((e) => e.date === format(day, 'yyyy-MM-dd'));

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  const getMemberColor = (event: Event): string | null => {
    if (event.member?.color) return event.member.color;
    if (event.member_id) {
      const m = members.find((m) => m.id === event.member_id);
      return m?.color || null;
    }
    return null;
  };

  return (
    <div>
      {/* 誕生日カウントダウン */}
      <BirthdayCountdown events={birthdayEvents} />

      {/* 通知ボタン */}
      {notifSupported && !notifGranted && (
        <div className="mb-4 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <span className="text-blue-500 text-xl">🔔</span>
          <p className="text-sm text-blue-700 flex-1">明日の予定をプッシュ通知で受け取りませんか？</p>
          <button
            onClick={handleEnableNotifications}
            disabled={notifLoading}
            className="text-sm bg-blue-600 text-white rounded-lg px-3 py-1.5 hover:bg-blue-700 disabled:opacity-50"
          >
            {notifLoading ? '設定中...' : '通知を有効にする'}
          </button>
        </div>
      )}
      {notifGranted && (
        <div className="mb-4 flex items-center gap-2 text-sm text-green-600">
          <span>✓</span> プッシュ通知が有効です
        </div>
      )}

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
                  {dayEvents.slice(0, 3).map((event) => {
                    const memberColor = getMemberColor(event);
                    return (
                      <div key={event.id} className="flex items-center gap-1">
                        {memberColor ? (
                          <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: memberColor }}
                          />
                        ) : (
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${EVENT_TYPE_DOT_COLORS[event.type]}`} />
                        )}
                        <span className="text-xs text-gray-600 truncate leading-tight">
                          {event.title}
                        </span>
                      </div>
                    );
                  })}
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
              {selectedDayEvents.map((event) => {
                const memberColor = getMemberColor(event);
                return (
                  <li key={event.id}>
                    <Link
                      href={`/events/${Math.abs(event.id)}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {memberColor ? (
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: memberColor }}
                        />
                      ) : (
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${EVENT_TYPE_DOT_COLORS[event.type]}`} />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{event.title}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-gray-400">
                            {event.time && `${event.time} · `}
                            {EVENT_TYPE_LABELS[event.type]}
                            {event.recurrence && event.recurrence !== 'none' && ' 🔄'}
                          </p>
                          {event.member && (
                            <span
                              className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                              style={{ backgroundColor: `${event.member.color}20`, color: event.member.color }}
                            >
                              {event.member.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-gray-300">›</span>
                    </Link>
                  </li>
                );
              })}
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
        {members.map((m) => (
          <div key={m.id} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
            {m.name}
          </div>
        ))}
      </div>

      {/* 月の振り返り */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800">
            {format(currentDate, 'M月', { locale: ja })}の振り返り
          </h3>
          <button
            onClick={handleGenerateSummary}
            disabled={summaryLoading}
            className="text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg px-3 py-1.5 hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
          >
            {summaryLoading ? (
              <>
                <span className="animate-spin">⏳</span> 生成中...
              </>
            ) : (
              <>✨ AIでまとめる</>
            )}
          </button>
        </div>
        {summary ? (
          <p className="text-gray-700 text-sm leading-relaxed">{summary}</p>
        ) : (
          <p className="text-gray-400 text-sm">
            「AIでまとめる」ボタンを押すと、今月の予定をAIが温かい文章でまとめます。
          </p>
        )}
      </div>
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
