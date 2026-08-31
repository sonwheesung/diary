/**
 * 폰트 고지 — **npm 패키지가 아니라 `assets/fonts/` 의 파일**이라 손으로 든다.
 *
 * 🔴 값의 근거는 [`docs/OPEN_SOURCE_NOTICE.md`](../../docs/OPEN_SOURCE_NOTICE.md) §2 —
 *   번들된 OTF 3개의 `name` 테이블과 저장소 LICENSE(태그 `v1.3.9`)를 **둘 다** 읽어 맞췄다.
 *
 * ⚠ **형제 프로젝트(배구명가)의 고지를 베끼지 마라.** 그쪽은 `Pretendard JP`(일본어 합본)이라
 *   저작권자가 넷이고, 조각의 plain Pretendard 에는 그 상류 셋이 **없다.**
 *
 * ⚠ **폰트 파일을 갈아끼우면 이 상수를 다시 잰다.** 특히 JP·Variable 합본으로 바꾸면
 *   저작권자가 늘어난다 — 파일만 바꾸고 여기를 두면 그 순간 고지가 누락된다.
 *
 * 🚫 이 안의 값은 **번역하지 않는다**(고유명사 + 원문 유지가 고지의 요건, §4).
 */
export interface FontNotice {
  name: string;
  version: string;
  copyright: string;
  reservedFontName: string;
  license: string;
  licenseUrl: string;
}

export const FONT_NOTICES: readonly FontNotice[] = [
  {
    name: 'Pretendard',
    version: '1.3.9',
    copyright: 'Copyright (c) 2021, Kil Hyung-jin (https://github.com/orioncactus/pretendard)',
    reservedFontName: 'Pretendard',
    license: 'SIL Open Font License 1.1',
    licenseUrl: 'https://scripts.sil.org/OFL',
  },
];
