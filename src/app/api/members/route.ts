import { NextRequest, NextResponse } from 'next/server';
import { getAllMembers, createMember } from '@/lib/db/queries/members';
import { createMemberSchema } from '@/lib/utils/validation';

export async function GET() {
  try {
    const members = getAllMembers();
    return NextResponse.json({ members });
  } catch (error) {
    console.error('GET /api/members error:', error);
    return NextResponse.json({ error: 'メンバーの取得に失敗しました' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createMemberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }
    const member = createMember(parsed.data);
    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    console.error('POST /api/members error:', error);
    return NextResponse.json({ error: 'メンバーの作成に失敗しました' }, { status: 500 });
  }
}
