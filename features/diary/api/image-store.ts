import * as Crypto from 'expo-crypto';
import { Directory, File, Paths } from 'expo-file-system';

import { getDatabase } from '@/db/client';
import type { DiaryImage, DiaryImageRow } from '@/features/diary/types';

/**
 * 조각 이미지 저장소 (DIARY_SYSTEM §1.2).
 *
 * 사용자가 고른 사진을 **앱 전용 디렉터리로 복사**한다. 갤러리 URI만 참조하면
 * 사용자가 원본을 지우는 순간 일기가 깨진다 — 일기는 오래 남는 기록이라
 * 외부 파일의 수명에 의존하면 안 된다.
 *
 * DB에는 **파일명만** 저장한다. iOS·Android 모두 앱 재설치·업데이트 시 컨테이너 절대 경로가
 * 바뀌므로, 절대 경로를 넣어두면 어느 날 모든 이미지가 한꺼번에 깨진다.
 */

const IMAGE_DIR_NAME = 'diary-images';

function imageDirectory(): Directory {
  const dir = new Directory(Paths.document, IMAGE_DIR_NAME);
  if (!dir.exists) {
    dir.create({ intermediates: true, idempotent: true });
  }
  return dir;
}

/** 파일명 → 지금 이 기기에서 유효한 절대 URI. 화면에서 이미지를 그릴 때 쓴다. */
export function resolveImageUri(fileName: string): string {
  return new File(imageDirectory(), fileName).uri;
}

function extensionOf(uri: string): string {
  const withoutQuery = uri.split('?')[0];
  const match = /\.([a-zA-Z0-9]+)$/.exec(withoutQuery);
  return match ? `.${match[1].toLowerCase()}` : '.jpg';
}

/**
 * 고른 사진을 앱 디렉터리로 복사하고 DB에 등록한다.
 * 아직 조각이 저장되기 전에도 호출된다(작성 중 삽입) — 그래서 diaryId를 먼저 받는다.
 */
export async function saveImage(params: {
  diaryId: string;
  sourceUri: string;
  width?: number | null;
  height?: number | null;
}): Promise<DiaryImage> {
  const id = Crypto.randomUUID();
  const fileName = `${id}${extensionOf(params.sourceUri)}`;

  const source = new File(params.sourceUri);
  const destination = new File(imageDirectory(), fileName);
  source.copy(destination);

  const image: DiaryImage = {
    id,
    diaryId: params.diaryId,
    fileName,
    width: params.width ?? null,
    height: params.height ?? null,
    createdAt: Date.now(),
  };

  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO diary_images (id, diary_id, file_name, width, height, created_at, deleted_at)
     VALUES (?, ?, ?, ?, ?, ?, NULL)`,
    image.id,
    image.diaryId,
    image.fileName,
    image.width,
    image.height,
    image.createdAt,
  );

  return image;
}

function toDiaryImage(row: DiaryImageRow): DiaryImage {
  return {
    id: row.id,
    diaryId: row.diary_id,
    fileName: row.file_name,
    width: row.width,
    height: row.height,
    createdAt: row.created_at,
  };
}

export async function getImagesForDiary(diaryId: string): Promise<DiaryImage[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<DiaryImageRow>(
    'SELECT * FROM diary_images WHERE diary_id = ? AND deleted_at IS NULL ORDER BY created_at ASC',
    diaryId,
  );
  return rows.map(toDiaryImage);
}

/** 여러 조각의 이미지를 한 번에. 목록 썸네일에서 N+1을 피한다. */
export async function getImagesForDiaries(diaryIds: string[]): Promise<Map<string, DiaryImage[]>> {
  const result = new Map<string, DiaryImage[]>();
  if (diaryIds.length === 0) {
    return result;
  }

  const db = await getDatabase();
  const placeholders = diaryIds.map(() => '?').join(', ');
  const rows = await db.getAllAsync<DiaryImageRow>(
    `SELECT * FROM diary_images
     WHERE diary_id IN (${placeholders}) AND deleted_at IS NULL
     ORDER BY created_at ASC`,
    ...diaryIds,
  );

  for (const row of rows) {
    const image = toDiaryImage(row);
    const images = result.get(row.diary_id);
    if (images) {
      images.push(image);
    } else {
      result.set(row.diary_id, [image]);
    }
  }
  return result;
}

/**
 * 저장하지 않고 나간 작성 화면의 이미지를 정리한다.
 *
 * 여기서만 **하드 삭제**한다 — 조각이 애초에 만들어지지 않았으므로 되살릴 대상이 없고,
 * 그냥 두면 사용자가 작성을 취소할 때마다 사진이 기기에 영구히 쌓인다.
 */
export async function discardDraftImages(diaryId: string): Promise<void> {
  const images = await getImagesForDiary(diaryId);
  deleteFiles(images.map((image) => image.fileName));

  const db = await getDatabase();
  await db.runAsync('DELETE FROM diary_images WHERE diary_id = ?', diaryId);
}

function deleteFiles(fileNames: string[]): void {
  for (const fileName of fileNames) {
    try {
      const file = new File(imageDirectory(), fileName);
      if (file.exists) {
        file.delete();
      }
    } catch {
      // 파일 삭제 실패가 화면 이탈을 막으면 안 된다. DB 행은 호출부가 지운다.
    }
  }
}

/**
 * 이번 편집에서 넣었다가 저장 전에 빠진 이미지를 지운다. **하드 삭제**다.
 *
 * 저장된 적이 없으므로 되살릴 대상이 없다 — 소프트 삭제로 남기면 아무도 참조하지 않는
 * 파일이 기기와 백업 용량만 먹는다.
 */
export async function discardImages(imageIds: string[]): Promise<void> {
  if (imageIds.length === 0) {
    return;
  }
  const db = await getDatabase();
  const placeholders = imageIds.map(() => '?').join(', ');
  const rows = await db.getAllAsync<DiaryImageRow>(
    `SELECT * FROM diary_images WHERE id IN (${placeholders})`,
    ...imageIds,
  );
  deleteFiles(rows.map((row) => row.file_name));
  await db.runAsync(`DELETE FROM diary_images WHERE id IN (${placeholders})`, ...imageIds);
}

/**
 * 이미 저장됐던 이미지를 본문에서 뺐을 때. **파일은 남긴다**(§1.2와 같은 이유 —
 * 지금 지우면 되살릴 방법이 없다).
 */
export async function softDeleteImages(imageIds: string[]): Promise<void> {
  if (imageIds.length === 0) {
    return;
  }
  const db = await getDatabase();
  const placeholders = imageIds.map(() => '?').join(', ');
  await db.runAsync(
    `UPDATE diary_images SET deleted_at = ? WHERE id IN (${placeholders}) AND deleted_at IS NULL`,
    Date.now(),
    ...imageIds,
  );
}

/**
 * 이미지를 소프트 삭제한다. **실제 파일은 지우지 않는다.**
 * 지금 지우면 조각을 되살릴 방법이 없고, 백업 복원 시에도 빈 자리가 된다.
 * 실제 파일 정리 시점은 백업 착수 시 정한다(DIARY_SYSTEM §1.2).
 */
export async function softDeleteImagesForDiary(diaryId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE diary_images SET deleted_at = ? WHERE diary_id = ? AND deleted_at IS NULL',
    Date.now(),
    diaryId,
  );
}
