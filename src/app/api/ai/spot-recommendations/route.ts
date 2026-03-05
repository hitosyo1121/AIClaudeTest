import { NextRequest, NextResponse } from 'next/server';
import { streamSpotRecommendations } from '@/lib/ai/spots';
import { spotRecommendationSchema } from '@/lib/utils/validation';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = spotRecommendationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          await streamSpotRecommendations(parsed.data, (chunk) => {
            controller.enqueue(new TextEncoder().encode(chunk));
          });
        } catch (error) {
          const errorMsg = error instanceof Anthropic.APIError
            ? 'AI生成に失敗しました。しばらく後でお試しください。'
            : 'スポット推薦の生成に失敗しました';
          controller.enqueue(new TextEncoder().encode(`\n\nエラー: ${errorMsg}`));
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('POST /api/ai/spot-recommendations error:', error);
    return NextResponse.json({ error: 'スポット推薦の生成に失敗しました' }, { status: 500 });
  }
}
