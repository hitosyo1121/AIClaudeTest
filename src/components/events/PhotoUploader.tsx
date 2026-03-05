'use client';

import { useState, useRef } from 'react';
import Button from '@/components/ui/Button';
import type { Photo } from '@/types';

interface PhotoUploaderProps {
  eventId: number;
  onUploaded: (photos: Photo[]) => void;
}

export default function PhotoUploader({ eventId, onUploaded }: PhotoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return;
    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('photos', file));

      const res = await fetch(`/api/events/${eventId}/photos`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'アップロードに失敗しました');
        return;
      }

      onUploaded(data.photos);
    } catch {
      setError('ネットワークエラーが発生しました');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    uploadFiles(files);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith('image/'),
    );
    uploadFiles(files);
  };

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="text-4xl mb-2">📷</div>
        {uploading ? (
          <p className="text-gray-500 text-sm">アップロード中...</p>
        ) : (
          <>
            <p className="text-gray-600 font-medium">写真をドラッグ＆ドロップ</p>
            <p className="text-gray-400 text-sm mt-1">またはクリックして選択（最大10枚・10MBまで）</p>
          </>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
