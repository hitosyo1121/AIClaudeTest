import { getAnthropicClient } from './client';
import type { SpotRecommendationRequest } from '@/types';

const seasonMap = {
  spring: '春（3〜5月）',
  summer: '夏（6〜8月）',
  autumn: '秋（9〜11月）',
  winter: '冬（12〜2月）',
};

const activityMap = {
  outdoor: '屋外アクティビティ',
  indoor: '屋内アクティビティ',
  cultural: '文化・学習体験',
  all: '全ジャンル',
};

export async function streamSpotRecommendations(
  req: SpotRecommendationRequest,
  onChunk: (chunk: string) => void,
): Promise<void> {
  const client = getAnthropicClient();

  const prompt = `2026年現在、${req.region}エリアで${seasonMap[req.season]}に、${req.childAgeMin}〜${req.childAgeMax}歳の子供と一緒に楽しめるおすすめスポットを6〜8件紹介してください。

条件:
- アクティビティタイプ: ${activityMap[req.activityType]}
- 子供の年齢: ${req.childAgeMin}〜${req.childAgeMax}歳
- 季節: ${seasonMap[req.season]}
- 2026年現在で人気・話題のスポットを優先してください

各スポットについて以下の情報を含めてください:
## スポット名
**カテゴリ**: （例: テーマパーク/公園/博物館など）
**場所**: 住所または最寄り駅
**おすすめ年齢**: ○歳〜○歳
**概要**: スポットの特徴や見どころ（2-3文）
**子連れポイント**: 授乳室・おむつ替え・駐車場・飲食施設などの子連れ情報
**アクセス**: 電車・車でのアクセス方法
**料金目安**: 大人・子供の入場料など
---`;

  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 3000,
    messages: [{ role: 'user', content: prompt }],
  });

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      onChunk(event.delta.text);
    }
  }
}
