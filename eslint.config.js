// ESLint 9 flat config. eslint-config-expo가 RN·Expo·expo-router 규칙을 담당하고,
// eslint-config-prettier는 서식 규칙만 끈다(서식은 Prettier가 유일한 진실).
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
  ...expoConfig,
  prettierConfig,
  {
    ignores: ['node_modules/**', '.expo/**', 'dist/**', 'android/**', 'ios/**', 'server/**'],
  },
  {
    // @typescript-eslint 플러그인은 expo 설정의 TS 대상 블록에서만 등록된다.
    // files를 안 좁히면 .js 파일에도 적용되어 "plugin not found"로 죽는다.
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      // CLAUDE.md §10 "any 절대 금지" — 린트로 강제한다.
      '@typescript-eslint/no-explicit-any': 'error',
      // 미사용 변수는 오류. _ 접두사는 의도적 미사용으로 허용.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    /*
     * common_server에서 **복사해 온** SDK. 손으로 고치지 않는 것이 규약이므로
     * (고치면 다음 복사 때 조용히 되돌아간다) 우리 린트 규칙을 강요하지 않는다.
     * `client.ts`는 우리가 쓴 접착 코드라 제외 대상이 아니다.
     */
    files: ['lib/common-server/index.ts', 'lib/common-server/types.ts'],
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
  {
    /*
     * `scripts/`는 **Node에서 도는 검증 도구**다(앱 번들에 안 들어간다).
     * 기본 설정이 RN 환경이라 Buffer·process 같은 Node 전역을 모른다.
     */
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: { Buffer: 'readonly', process: 'readonly', console: 'readonly' },
    },
  },
];
