import { NextRequest, NextResponse } from 'next/server';
import { getEventById, updateEvent, deleteEvent } from '@/lib/db/queries/events';
import { createEventSchema } from '@/lib/utils/validation';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const event = getEventById(Number(id));
    if (!event) {
      return NextResponse.json({ error: 'イベントが見つかりません' }, { status: 404 });
    }
    return NextResponse.json({ event });
  } catch (error) {
    console.error('GET /api/events/[id] error:', error);
    return NextResponse.json({ error: 'イベントの取得に失敗しました' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = createEventSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }
    const event = updateEvent(Number(id), parsed.data);
    if (!event) {
      return NextResponse.json({ error: 'イベントが見つかりません' }, { status: 404 });
    }
    return NextResponse.json({ event });
  } catch (error) {
    console.error('PUT /api/events/[id] error:', error);
    return NextResponse.json({ error: 'イベントの更新に失敗しました' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const deleted = deleteEvent(Number(id));
    if (!deleted) {
      return NextResponse.json({ error: 'イベントが見つかりません' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/events/[id] error:', error);
    return NextResponse.json({ error: 'イベントの削除に失敗しました' }, { status: 500 });
  }
}
