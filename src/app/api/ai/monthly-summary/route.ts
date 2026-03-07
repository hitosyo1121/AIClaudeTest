import { NextRequest, NextResponse } from 'next/server';
import { getAllEvents } from '@/lib/db/queries/events';
import { generateMonthlySummary } from '@/lib/ai/summary';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { month } = body;

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json({ error: '月の形式が正しくありません（YYYY-MM）' }, { status: 400 });
    }

    const events = getAllEvents(month);
    const summary = await generateMonthlySummary(month, events);
    return NextResponse.json({ summary, eventCount: events.length });
  } catch (error) {
    console.error('POST /api/ai/monthly-summary error:', error);
    return NextResponse.json({ error: '要約の生成に失敗しました' }, { status: 500 });
  }
}
