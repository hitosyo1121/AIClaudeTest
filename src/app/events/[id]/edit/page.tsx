import { notFound } from 'next/navigation';
import { getEventById } from '@/lib/db/queries/events';
import EventForm from '@/components/events/EventForm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: Props) {
  const { id } = await params;
  const event = getEventById(Number(id));

  if (!event) notFound();

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">予定を編集</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <EventForm event={event} />
      </div>
    </div>
  );
}
