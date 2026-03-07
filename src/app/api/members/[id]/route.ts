import { NextRequest, NextResponse } from 'next/server';
import { getMemberById, updateMember, deleteMember } from '@/lib/db/queries/members';
import { createMemberSchema } from '@/lib/utils/validation';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = createMemberSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }
    const member = updateMember(Number(id), parsed.data);
    if (!member) {
      return NextResponse.json({ error: 'メンバーが見つかりません' }, { status: 404 });
    }
    return NextResponse.json({ member });
  } catch (error) {
    console.error('PUT /api/members/[id] error:', error);
    return NextResponse.json({ error: 'メンバーの更新に失敗しました' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const deleted = deleteMember(Number(id));
    if (!deleted) {
      return NextResponse.json({ error: 'メンバーが見つかりません' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/members/[id] error:', error);
    return NextResponse.json({ error: 'メンバーの削除に失敗しました' }, { status: 500 });
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const member = getMemberById(Number(id));
    if (!member) {
      return NextResponse.json({ error: 'メンバーが見つかりません' }, { status: 404 });
    }
    return NextResponse.json({ member });
  } catch (error) {
    console.error('GET /api/members/[id] error:', error);
    return NextResponse.json({ error: 'メンバーの取得に失敗しました' }, { status: 500 });
  }
}
