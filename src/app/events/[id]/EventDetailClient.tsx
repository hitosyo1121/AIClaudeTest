'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PhotoGallery from '@/components/events/PhotoGallery';
import PhotoUploader from '@/components/events/PhotoUploader';
import TravelPlanForm from '@/components/ai/TravelPlanForm';
import TravelPlanDisplay from '@/components/ai/TravelPlanDisplay';
import Button from '@/components/ui/Button';
import type { Event, Photo, TravelPlan } from '@/types';

interface Props {
  event: Event;
}

export default function EventDetailClient({ event }: Props) {
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>(event.photos || []);
  const [travelPlan, setTravelPlan] = useState<TravelPlan | null>(null);
  const [showTravelForm, setShowTravelForm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handlePhotoUploaded = (newPhotos: Photo[]) => {
    setPhotos((prev) => [...prev, ...newPhotos]);
  };

  const handleDeleteEvent = async () => {
    if (!confirm('この予定を削除してもよいですか？')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/events/${event.id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/calendar');
        router.refresh();
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 写真セクション */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-bold text-gray-800 mb-4">📷 写真</h2>
        {photos.length > 0 && (
          <div className="mb-4">
            <PhotoGallery photos={photos} />
          </div>
        )}
        <PhotoUploader eventId={event.id} onUploaded={handlePhotoUploaded} />
      </div>

      {/* 旅行プランセクション（旅行タイプのみ） */}
      {event.type === 'travel' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">✈️ AIおすすめ旅行プラン</h2>
            {!showTravelForm && !travelPlan && (
              <Button
                onClick={() => setShowTravelForm(true)}
                size="sm"
              >
                プランを作成する
              </Button>
            )}
          </div>

          {showTravelForm && !travelPlan && (
            <TravelPlanForm
              defaultStartDate={event.date}
              onPlanGenerated={(plan) => {
                setTravelPlan(plan);
                setShowTravelForm(false);
              }}
            />
          )}

          {travelPlan && (
            <div>
              <TravelPlanDisplay plan={travelPlan} />
              <Button
                variant="secondary"
                size="sm"
                className="mt-4"
                onClick={() => { setTravelPlan(null); setShowTravelForm(true); }}
              >
                プランを作り直す
              </Button>
            </div>
          )}

          {!showTravelForm && !travelPlan && (
            <p className="text-gray-400 text-sm text-center py-4">
              目的地や日程を入力してAIが旅行プランを作成します
            </p>
          )}
        </div>
      )}

      {/* 削除ボタン */}
      <div className="flex justify-end">
        <Button variant="danger" size="sm" onClick={handleDeleteEvent} disabled={deleting}>
          {deleting ? '削除中...' : '予定を削除'}
        </Button>
      </div>
    </div>
  );
}
