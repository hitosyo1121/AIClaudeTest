import { NextRequest, NextResponse } from 'next/server';
import { generateTravelPlan } from '@/lib/ai/travel';
import { travelPlanSchema } from '@/lib/utils/validation';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = travelPlanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const plan = await generateTravelPlan(parsed.data);
    return NextResponse.json({ plan });
  } catch (error) {
    console.error('POST /api/ai/travel-plan error:', error);
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: 'AI生成に失敗しました。しばらく後でお試しください。' },
        { status: error.status },
      );
    }
    return NextResponse.json({ error: 'AIプランの生成に失敗しました' }, { status: 500 });
  }
}
