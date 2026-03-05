import EventForm from '@/components/events/EventForm';

interface Props {
  searchParams: Promise<{ date?: string }>;
}

export default async function NewEventPage({ searchParams }: Props) {
  const params = await searchParams;
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">予定を追加</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <EventForm defaultDate={params.date} />
      </div>
    </div>
  );
}
