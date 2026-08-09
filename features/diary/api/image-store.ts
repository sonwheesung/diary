import * as Crypto from 'expo-crypto';
import { Directory, File, Paths } from 'expo-file-system';
import { SaveFormat, manipulateAsync } from 'expo-image-manipulator';

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
 *
 * 복사 전에 **긴 변 기준으로 줄인다**(아래 MAX_EDGE). 이유는 두 가지다:
 * ① 요즘 폰 사진은 장당 2~4MB라 일기 몇 백 개면 기기 용량이 눈에 띄게 준다.
 * ② ⚠ **백업이 E2EE라 서버가 사진을 줄일 수 없다** — 서버에 닿을 땐 이미 암호문이다.
 *    기기에서, 암호화하기 전에 줄이는 것 말고는 방법이 없다(CLAUDE.md §5.1).
 *    그래서 백업보다 **먼저** 넣었다. 나중에 넣으면 그 전에 저장된 사진은 원본 크기로 남는다.
 */

const IMAGE_DIR_NAME = 'diary-images';

/**
 * 저장할 사진의 긴 변 최대 픽셀.
 *
 * 1600은 폰 화면(1080~1440)보다 넉넉해 확대해도 뭉개지지 않으면서, 4000px 원본 대비
 * 파일이 대략 한 자릿수 배 작아진다. 일기에 넣는 사진은 인화용이 아니라 보는 용이다.
 */
const MAX_EDGE = 1600;

/** JPEG 압축률. 0.8 아래로 내리면 하늘·피부 같은 완만한 그라데이션에서 띠가 보이기 시작한다. */
const COMPRESS = 0.8;

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
 * 긴 변이 MAX_EDGE를 넘으면 줄인다. 넘지 않으면 **손대지 않는다** —
 * 이미 작은 사진을 다시 인코딩하면 화질만 깎이고 용량은 줄지 않는다.
 *
 * 실패하면 원본을 그대로 쓴다. 사진을 줄이지 못한 것보다 **사진을 잃는 것이 훨씬 나쁘다.**
 */
async function shrinkIfNeeded(params: {
  uri: string;
  width?: number | null;
  height?: number | null;
}): Promise<{ uri: string; width: number | null; height: number | null }> {
  const { uri, width = null, height = null } = params;
  const longEdge = Math.max(width ?? 0, height ?? 0);

  // 크기를 모르면(둘 다 0/null) 손대지 않는다 — 어느 변을 줄여야 할지 알 수 없다
  if (longEdge <= MAX_EDGE) {
    return { uri, width, height };
  }

  try {
    // 긴 변만 지정하면 나머지는 비율대로 계산된다(ActionResize 문서)
    const resize = (width ?? 0) >= (height ?? 0) ? { width: MAX_EDGE } : { height: MAX_EDGE };
    const result = await manipulateAsync(uri, [{ resize }], {
      compress: COMPRESS,
      format: SaveFormat.JPEG,
    });
    return { uri: result.uri, width: result.width, height: result.height };
  } catch {
    return { uri, width, height };
  }
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
  const shrunk = await shrinkIfNeeded({
    uri: params.sourceUri,
    width: params.width,
    height: params.height,
  });

  /*
   * 확장자는 **줄인 뒤의 URI**에서 뽑는다. 줄였다면 결과는 JPEG인데 원본이 PNG·HEIC였을 수 있다 —
   * 원본 확장자를 붙이면 내용과 이름이 어긋난 파일이 남는다.
   */
  const fileName = `${id}${extensionOf(shrunk.uri)}`;

  const source = new File(shrunk.uri);
  const destination = new File(imageDirectory(), fileName);
  source.copy(destination);

  const image: DiaryImage = {
    id,
    diaryId: params.diaryId,
    // 줄였으면 줄인 뒤 크기를 넣는다. DB 값이 실제 파일과 어긋나면 레이아웃이 틀어진다
    fileName,
    width: shrunk.width,
    height: shrunk.height,
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
