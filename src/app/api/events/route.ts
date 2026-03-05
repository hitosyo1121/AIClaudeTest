import { NextRequest, NextResponse } from 'next/server';
import { getAllEvents, createEvent } from '@/lib/db/queries/events';
import { createEventSchema } from '@/lib/utils/validation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') || undefined;
    const events = getAllEvents(month);
    return NextResponse.json({ events });
  } catch (error) {
    console.error('GET /api/events error:', error);
    return NextResponse.json({ error: 'イベントの取得に失敗しました' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createEventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }
    const event = createEvent(parsed.data);
    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error('POST /api/events error:', error);
    return NextResponse.json({ error: 'イベントの作成に失敗しました' }, { status: 500 });
  }
}
