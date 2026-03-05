import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getEventById } from '@/lib/db/queries/events';
import { EVENT_TYPE_LABELS, EVENT_TYPE_COLORS } from '@/types';
import EventDetailClient from './EventDetailClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const event = getEventById(Number(id));

  if (!event) notFound();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/calendar" className="text-gray-400 hover:text-gray-600 text-sm">
          ← カレンダー
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full border ${EVENT_TYPE_COLORS[event.type]}`}>
              {EVENT_TYPE_LABELS[event.type]}
            </span>
            <h1 className="text-2xl font-bold text-gray-800 mt-2">{event.title}</h1>
            <p className="text-gray-500 mt-1">
              {event.date}
              {event.time && ` ${event.time}`}
            </p>
          </div>
          <Link
            href={`/events/${event.id}/edit`}
            className="text-sm text-blue-600 hover:underline"
          >
            編集
          </Link>
        </div>

        {event.description && (
          <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
        )}
      </div>

      <EventDetailClient event={event} />
    </div>
  );
}
