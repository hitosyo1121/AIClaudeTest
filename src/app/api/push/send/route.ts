import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { getAllSubscriptions } from '@/lib/db/queries/push';
import { getTomorrowEvents } from '@/lib/db/queries/events';

webpush.setVapidDetails(
  'mailto:family-schedule@example.com',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export async function POST() {
  try {
    const subscriptions = getAllSubscriptions();
    const events = getTomorrowEvents();

    if (subscriptions.length === 0) {
      return NextResponse.json({ message: '購読者がいません' });
    }

    if (events.length === 0) {
      return NextResponse.json({ message: '明日の予定はありません' });
    }

    const eventTitles = events.map((e) => `${e.time ? e.time + ' ' : ''}${e.title}`).join('、');
    const payload = JSON.stringify({
      title: '明日の家族の予定',
      body: eventTitles,
      icon: '/icon-192.png',
    });

    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
        ),
      ),
    );

    const sent = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return NextResponse.json({ sent, failed, events: events.length });
  } catch (error) {
    console.error('POST /api/push/send error:', error);
    return NextResponse.json({ error: '通知の送信に失敗しました' }, { status: 500 });
  }
}
