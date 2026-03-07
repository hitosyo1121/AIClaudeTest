import { NextRequest, NextResponse } from 'next/server';
import { saveSubscription, deleteSubscription } from '@/lib/db/queries/push';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint, keys } = body;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: '購読情報が不正です' }, { status: 400 });
    }
    const sub = saveSubscription({ endpoint, p256dh: keys.p256dh, auth: keys.auth });
    return NextResponse.json({ success: true, sub }, { status: 201 });
  } catch (error) {
    console.error('POST /api/push/subscribe error:', error);
    return NextResponse.json({ error: '購読の登録に失敗しました' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint } = body;
    if (!endpoint) {
      return NextResponse.json({ error: 'endpointが必要です' }, { status: 400 });
    }
    deleteSubscription(endpoint);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/push/subscribe error:', error);
    return NextResponse.json({ error: '購読の解除に失敗しました' }, { status: 500 });
  }
}
