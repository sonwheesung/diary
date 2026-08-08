# DATABASE — 로컬 스키마와 마이그레이션

> 일기의 진실은 **기기 로컬 expo-sqlite**다. 서버 DB(조각 서버)는 백업 착수 시점에 설계한다.
> 도메인 규칙은 [`DIARY_SYSTEM.md`](./DIARY_SYSTEM.md), 서버 경계는 [`ARCHITECTURE.md`](./ARCHITECTURE.md).

---

## 1. 서버 DB는 언제 만드는가 (2026-08-07 결정)

**월 결제 기능에 착수할 때 만든다.** 그전에는 만들지 않는다.

- MVP 초반(일기 CRUD·캘린더·검색·설정·잠금)은 서버를 전혀 쓰지 않는다.
- Supabase 프로젝트를 미리 만들면 쓰지도 않으면서 과금(Pro 조직 기준 $10/월)만 발생한다.
- 대신 **로컬 스키마를 처음부터 백업 가능한 형태로 잡는다**(§3) — 나중에 마이그레이션이 없도록.

---

## 2. 저장 방식

- `expo-sqlite` (SDK 54, `~16.0.10`). DB 파일명 `jogak.db`.
- ORM을 쓰지 않는다. 테이블이 적고 쿼리가 단순해서 SQL을 직접 쓰는 편이 읽기 쉽다.
- 모든 쿼리는 `db/` 아래 함수로만 나간다. 화면·컴포넌트에서 SQL을 직접 쓰지 않는다.

---

## 3. 스키마 (v1)

```sql
CREATE TABLE IF NOT EXISTS diaries (
  id          TEXT    PRIMARY KEY NOT NULL,  -- UUID v4
  entry_date  TEXT    NOT NULL,              -- 'YYYY-MM-DD' (기기 로컬 타임존)
  title       TEXT,                          -- 선택
  content     TEXT    NOT NULL,
  emotion     TEXT,                          -- 감정 코드. 선택
  created_at  INTEGER NOT NULL,              -- epoch ms
  updated_at  INTEGER NOT NULL,              -- epoch ms — 백업 최신본 판단 기준
  deleted_at  INTEGER                        -- epoch ms. NULL이면 살아있음 (소프트 삭제)
);

CREATE INDEX IF NOT EXISTS idx_diaries_entry_date ON diaries (entry_date);
CREATE INDEX IF NOT EXISTS idx_diaries_updated_at ON diaries (updated_at);
CREATE INDEX IF NOT EXISTS idx_diaries_deleted_at ON diaries (deleted_at);
```

### 컬럼을 이렇게 잡은 이유

| 컬럼 | 이유 |
|---|---|
| `id`가 **UUID**(정수 자동증가 아님) | 기기 2대에서 각자 쓴 조각이 같은 정수 id를 갖게 되면 백업 병합 시 충돌한다. 지금 UUID로 잡아두면 그때 마이그레이션이 없다 |
| `entry_date`를 **별도 문자열 컬럼**으로 | 캘린더·streak는 "날짜" 단위 질의다. `created_at`(시각)에서 매번 날짜를 뽑으면 인덱스를 못 탄다. `YYYY-MM-DD` 문자열은 사전순 = 날짜순이라 범위 질의가 그대로 된다 |
| `updated_at` | 백업 동기화가 최신본을 고르는 기준. 수정 시 반드시 갱신 |
| `deleted_at` (소프트 삭제) | 하드 삭제하면 지운 일기가 다른 기기에서 되살아난다(DIARY_SYSTEM §7) |
| `emotion`을 **코드 문자열**로 | 로컬 단일 사용자 앱에서 감정 정규화 테이블은 조인 비용만 늘고 이득이 없다 |

> **인덱스는 세 개뿐이다.** 조회 경로가 ① 날짜 범위(캘린더·streak) ② 최신순(홈·목록) ③ 살아있는 것만
> 이 셋이라 그렇다. 검색은 `LIKE '%…%'`라 인덱스를 못 타지만 규모상 문제없다(DIARY_SYSTEM §6).

---

## 4. 마이그레이션 규약

SQLite의 `PRAGMA user_version`을 버전 카운터로 쓴다. 마이그레이션 도구를 쓰지 않는다 —
테이블 하나짜리 로컬 DB에 도구를 얹으면 얻는 것보다 잃는 게 많다.

```
현재 user_version < 목표 버전이면, 부족한 단계를 순서대로 적용하고 user_version을 올린다.
```

**규칙**

1. **적용된 마이그레이션은 절대 수정하지 않는다.** 이미 그 버전을 지난 기기에는 다시 실행되지 않는다.
   잘못됐으면 **새 버전을 추가해서** 고친다.
2. **Expand-only.** 컬럼을 지우거나 이름을 바꾸지 않는다. 추가만 한다.
   사용자가 앱을 건너뛰고 업데이트해도 안전해야 한다.
3. 모든 DDL은 `IF NOT EXISTS`로 멱등하게 쓴다. 중간에 실패한 기기가 재시도해도 깨지지 않게.
4. 마이그레이션은 **앱 시작 시 1회**, 다른 쿼리보다 먼저 끝난다.

| user_version | 내용 |
|---|---|
| 1 | `diaries` 테이블 + 인덱스 3종 (초기) |
| 2 | 본문 블록 · 이미지 · 태그 — `diaries.content_blocks` 추가, `diary_images`·`tags`·`diary_tags` 신설 |

### v2 (2026-08-07) — 본문 블록 · 이미지 · 태그

```sql
-- 본문 정본은 블록 JSON. 기존 content는 '검색용 파생 평문'으로 역할을 바꾼다.
-- Expand-only 규약대로 컬럼을 지우거나 이름을 바꾸지 않고 추가만 한다.
ALTER TABLE diaries ADD COLUMN content_blocks TEXT;

CREATE TABLE IF NOT EXISTS diary_images (
  id          TEXT    PRIMARY KEY NOT NULL,  -- UUID. 본문 블록이 이 값을 참조한다
  diary_id    TEXT    NOT NULL,
  file_name   TEXT    NOT NULL,              -- 앱 이미지 디렉터리 기준 '상대 경로'. 절대 경로 금지
  width       INTEGER,
  height      INTEGER,
  created_at  INTEGER NOT NULL,
  deleted_at  INTEGER
);
CREATE INDEX IF NOT EXISTS idx_diary_images_diary ON diary_images (diary_id);

CREATE TABLE IF NOT EXISTS tags (
  id          TEXT    PRIMARY KEY NOT NULL,
  name        TEXT    NOT NULL COLLATE NOCASE,   -- 대소문자 무시 유일
  created_at  INTEGER NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tags_name ON tags (name COLLATE NOCASE);

CREATE TABLE IF NOT EXISTS diary_tags (
  diary_id  TEXT NOT NULL,
  tag_id    TEXT NOT NULL,
  PRIMARY KEY (diary_id, tag_id)
);
CREATE INDEX IF NOT EXISTS idx_diary_tags_tag ON diary_tags (tag_id);
```

**설계 근거**

| 결정 | 이유 |
|---|---|
| `content`는 남기고 **파생 평문**으로 역할 변경 | 블록 JSON을 `LIKE`로 긁으면 `"type"`·`"image"` 같은 구조 문자열이 검색에 걸린다. 정본은 `content_blocks`, `content`는 항상 블록에서 재생성되는 검색용 사본 |
| `content_blocks`는 **NULL 허용** | Expand-only. v1에 저장된 조각은 이 값이 없다 — 읽을 때 평문 하나짜리 블록으로 간주한다 |
| 이미지에 **절대 경로 금지** | 앱 업데이트·재설치 시 앱 컨테이너 절대 경로가 바뀐다. 저장해두면 어느 날 모든 이미지가 한꺼번에 깨진다 |
| 태그를 **정규화**(`tags` + `diary_tags`) | 자동완성 후보·사용 빈도·태그별 목록이 필요하다. 문자열 컬럼에 몰아넣으면 이 셋이 전부 전체 스캔이 된다 |
| `COLLATE NOCASE` 유일 인덱스 | `여행`/`Travel`/`travel`이 각각 따로 생기는 걸 DB 층에서 막는다 |
| `diary_tags`에 소프트 삭제 없음 | 연결은 조각에 종속이다. 조각이 살아있는지로 판단하면 충분하고, 묘비를 두면 복잡도만 는다 |

### v3 — 앱 설정 (2026-08-08)

```sql
CREATE TABLE IF NOT EXISTS app_settings (
  key         TEXT    PRIMARY KEY NOT NULL,
  value       TEXT    NOT NULL,
  updated_at  INTEGER NOT NULL
);
```

| 결정 | 이유 |
|---|---|
| 설정을 **DB 키-값**으로 | 알림 토글·다크모드·잠금 대기시간처럼 늘어날 값들이다. 컬럼을 만들면 하나 늘 때마다 마이그레이션이 붙는다 |
| **SecureStore와 분리** | SecureStore는 비밀(PIN 해시·암호화 키) 전용으로 남긴다. 섞으면 무엇이 비밀인지 흐려지고, 백업에 실어도 되는 값인지 판단할 수 없게 된다 |
| 값은 **문자열 하나로** | 불리언·숫자·enum을 한 컬럼에 담는다. 타입은 읽는 쪽이 안다(`getBoolSetting` 등) |
| 소프트 삭제 없음 | 설정은 기기에 종속이고 되살릴 이유가 없다 |

---

## 5. 백업 대비 (아직 구현 안 함)

지금 스키마로 나중에 백업을 붙일 때 필요한 것과 이미 준비된 것.

| 필요한 것 | 상태 |
|---|---|
| 기기 간 충돌 없는 id | ✅ UUID |
| 최신본 판단 기준 | ✅ `updated_at` |
| 삭제 전파(묘비) | ✅ `deleted_at` |
| 마지막 백업 시각 | ❌ 백업 착수 시 추가(별도 메타 테이블) |
| 암호화 메타(알고리즘·버전) | ❌ 백업 착수 시 추가 |

> 백업 단위(전체 스냅샷 vs 증분)와 복원 충돌 규칙은 미결정 — [`ARCHITECTURE.md`](./ARCHITECTURE.md) §8.

---

## 6. 구현 현황

| 항목 | 상태 |
|---|---|
| 스키마 v1 결정 | ✅ 2026-08-07 |
| `db/` 구현(연결·마이그레이션) | ✅ `db/client.ts`(단일 커넥션·WAL) · `db/migrations.ts`(user_version) |
| 쿼리 계층 | ✅ `features/diary/api/diary-repository.ts` |
| 조각 서버 DB | ❌ — 월 결제 착수 시(§1) |
