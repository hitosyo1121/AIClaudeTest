import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { insertPhoto } from '@/lib/db/queries/photos';
import { saveFile, validateFile } from '@/lib/storage/uploads';
import { getEventById } from '@/lib/db/queries/events';

const MAX_PHOTOS_PER_EVENT = 10;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const eventId = Number(id);

    const event = getEventById(eventId);
    if (!event) {
      return NextResponse.json({ error: 'イベントが見つかりません' }, { status: 404 });
    }

    const currentPhotoCount = event.photos?.length ?? 0;

    const formData = await request.formData();
    const files = formData.getAll('photos') as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: '写真が選択されていません' }, { status: 400 });
    }

    if (currentPhotoCount + files.length > MAX_PHOTOS_PER_EVENT) {
      return NextResponse.json(
        { error: `写真は最大${MAX_PHOTOS_PER_EVENT}枚までです（現在${currentPhotoCount}枚）` },
        { status: 400 },
      );
    }

    const savedPhotos = [];
    for (const file of files) {
      const validationError = validateFile(file);
      if (validationError) {
        return NextResponse.json({ error: validationError }, { status: 400 });
      }

      const ext = file.name.split('.').pop() || 'jpg';
      const filename = `${uuidv4()}.${ext}`;
      await saveFile(file, filename);

      const photo = insertPhoto({
        event_id: eventId,
        filename,
        original_name: file.name,
      });
      savedPhotos.push(photo);
    }

    return NextResponse.json({ photos: savedPhotos }, { status: 201 });
  } catch (error) {
    console.error('POST /api/events/[id]/photos error:', error);
    return NextResponse.json({ error: '写真のアップロードに失敗しました' }, { status: 500 });
  }
}
