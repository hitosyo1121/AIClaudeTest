'use client';

import { useState, useRef } from 'react';
import SpotSearchForm from '@/components/ai/SpotSearchForm';
import type { SpotRecommendationRequest } from '@/types';

export default function SpotsPage() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleSearch = async (req: SpotRecommendationRequest) => {
    setContent('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/spot-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });

      if (!res.ok || !res.body) {
        setContent('スポットの取得に失敗しました。しばらくしてからお試しください。');
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setContent(accumulated);
        // スクロール
        if (contentRef.current) {
          contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
      }
    } catch {
      setContent('ネットワークエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  // マークダウン風のテキストをHTMLに変換
  const formatContent = (text: string) => {
    return text
      .split('\n')
      .map((line) => {
        if (line.startsWith('## ')) {
          return `<h2>${line.slice(3)}</h2>`;
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return `<p><strong>${line.slice(2, -2)}</strong></p>`;
        }
        if (line.match(/^\*\*(.*?)\*\*/)) {
          return `<p>${line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`;
        }
        if (line === '---') {
          return '<hr>';
        }
        if (line.trim() === '') {
          return '<br>';
        }
        return `<p>${line}</p>`;
      })
      .join('');
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">子連れおでかけスポット</h1>
        <p className="text-gray-500 mt-1">AIがエリア・季節・年齢に合ったスポットを紹介します</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <SpotSearchForm onSearch={handleSearch} loading={loading} />
        </div>

        <div className="lg:col-span-2">
          {!content && !loading && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <div className="text-6xl mb-4">🗺️</div>
              <p className="text-gray-500">
                左の条件を選んで「スポットを探す」ボタンを押してください
              </p>
            </div>
          )}

          {loading && content === '' && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <div className="text-4xl mb-3 animate-pulse">✨</div>
              <p className="text-gray-500">AIがおすすめスポットを探しています...</p>
            </div>
          )}

          {content && (
            <div
              ref={contentRef}
              className="bg-white rounded-xl border border-gray-200 p-6 prose-spots max-h-[70vh] overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: formatContent(content) }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
