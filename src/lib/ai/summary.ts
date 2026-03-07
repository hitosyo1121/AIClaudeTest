import { getAnthropicClient } from './client';
import type { Event } from '@/types';

export async function generateMonthlySummary(month: string, events: Event[]): Promise<string> {
  const client = getAnthropicClient();

  if (events.length === 0) {
    return `${month}は記録された予定がありませんでした。`;
  }

  const eventList = events
    .map((e) => `・${e.date}${e.time ? ' ' + e.time : ''} 「${e.title}」（${e.type}）${e.description ? '：' + e.description : ''}`)
    .join('\n');

  const [year, mon] = month.split('-');
  const monthLabel = `${year}年${parseInt(mon)}月`;

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    system: `あなたは家族の思い出を温かくまとめてくれるアシスタントです。
家族のスケジュールを見て、その月の振り返りを日本語で3〜5文程度の短い文章にまとめてください。
楽しい思い出や家族の絆を感じられるような、温かみのある文体で書いてください。
箇条書きは使わず、自然な文章で書いてください。`,
    messages: [
      {
        role: 'user',
        content: `${monthLabel}の家族の予定一覧です。この月の振り返りをまとめてください。\n\n${eventList}`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type');
  return content.text;
}
