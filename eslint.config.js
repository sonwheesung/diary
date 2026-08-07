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
];
