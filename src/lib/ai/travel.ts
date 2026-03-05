import { getAnthropicClient } from './client';
import type { TravelPlanRequest, TravelPlan } from '@/types';

export async function generateTravelPlan(req: TravelPlanRequest): Promise<TravelPlan> {
  const client = getAnthropicClient();

  const systemPrompt = `あなたは日本の家族旅行プランナーです。
子供連れの家族向けに、安全で楽しい旅行プランを作成してください。
子供の年齢に配慮し、バリアフリー情報、授乳室・おむつ替えスペース、お昼寝の時間、キッズメニューなども考慮してください。
必ず以下のJSON形式のみで返してください（説明文や前置きは不要です）:
{
  "overview": "旅行概要（2-3文）",
  "days": [
    {
      "day": 数字,
      "date": "YYYY-MM-DD",
      "title": "その日のテーマ",
      "schedule": [
        {
          "time": "HH:MM",
          "activity": "活動名",
          "description": "詳細説明",
          "tips": "子連れのポイント"
        }
      ]
    }
  ],
  "tips": ["アドバイス1", "アドバイス2"],
  "budget": "概算予算"
}`;

  const userPrompt = `以下の条件で旅行プランを作成してください:
目的地: ${req.destination}
旅行期間: ${req.startDate} 〜 ${req.endDate}
メンバー: 大人${req.adults}名、子供${req.children}名
子供の年齢: ${req.childAges.length > 0 ? req.childAges.join('歳、') + '歳' : '未指定'}
希望・条件: ${req.preferences || 'なし'}`;

  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const message = await stream.finalMessage();
  const text = message.content[0].type === 'text' ? message.content[0].text : '';

  // JSONを抽出してパース
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      overview: text,
      days: [],
      tips: [],
      budget: '要問い合わせ',
    };
  }

  try {
    return JSON.parse(jsonMatch[0]) as TravelPlan;
  } catch {
    return {
      overview: text,
      days: [],
      tips: [],
      budget: '要問い合わせ',
    };
  }
}
