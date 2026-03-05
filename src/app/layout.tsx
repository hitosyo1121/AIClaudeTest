import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';

export const metadata: Metadata = {
  title: '家族スケジュール',
  description: '家族で予定を共有しよう',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
