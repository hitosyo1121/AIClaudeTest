export default function LoadingSpinner({ text = '読み込み中...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-gray-500 text-sm">{text}</p>
    </div>
  );
}
