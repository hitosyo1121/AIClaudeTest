import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic'];

export function ensureUploadDir(): void {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

export async function saveFile(file: File, filename: string): Promise<void> {
  ensureUploadDir();
  const buffer = Buffer.from(await file.arrayBuffer());
  const filePath = path.join(UPLOAD_DIR, filename);
  await writeFile(filePath, buffer);
}

export async function deleteFile(filename: string): Promise<void> {
  const filePath = path.join(UPLOAD_DIR, filename);
  try {
    await unlink(filePath);
  } catch {
    // ファイルが存在しない場合は無視
  }
}

export function validateFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) {
    return `ファイルサイズが大きすぎます（最大${MAX_FILE_SIZE / 1024 / 1024}MB）`;
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return '対応していないファイル形式です（JPEG、PNG、WebP、GIFのみ）';
  }
  return null;
}
