'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Photo } from '@/types';

interface PhotoGalleryProps {
  photos: Photo[];
}

export default function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [lightbox, setLightbox] = useState<string | null>(null);

  if (photos.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {photos.map((photo) => (
          <button
            key={photo.id}
            onClick={() => setLightbox(`/uploads/${photo.filename}`)}
            className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity"
          >
            <Image
              src={`/uploads/${photo.filename}`}
              alt={photo.original_name || '写真'}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, 33vw"
            />
          </button>
        ))}
      </div>

      {/* ライトボックス */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-3xl max-h-full">
            <Image
              src={lightbox}
              alt="写真"
              width={800}
              height={600}
              className="object-contain rounded-lg max-h-[80vh] w-auto"
            />
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-2 right-2 text-white bg-black/50 rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
