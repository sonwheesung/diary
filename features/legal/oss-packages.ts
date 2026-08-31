/**
 * 번들에 들어가는 오픈소스 패키지 — **생성 파일이다. 손으로 고치지 마라.**
 *
 * 만드는 곳: `scripts/make-licenses.mjs` (`npm run licenses:build`)
 * 어긋남 검사: `npm run check:licenses` — 의존성을 더하고 이 파일을 안 만들면 실패한다
 *
 * 폰트는 여기 없다(npm 패키지가 아니다) — `features/legal/licenses.ts` 참조.
 */

export interface OssPackage {
  name: string;
  version: string;
  license: string;
  copyright: string;
}

export const OSS_PACKAGES: readonly OssPackage[] = [
  {
    name: '@noble/ciphers',
    version: '2.3.0',
    license: 'MIT',
    copyright: 'Copyright (c) 2022 Paul Miller (https://paulmillr.com)',
  },
  {
    name: '@noble/hashes',
    version: '2.3.0',
    license: 'MIT',
    copyright: 'Copyright (c) 2022 Paul Miller (https://paulmillr.com)',
  },
  {
    name: '@react-native-google-signin/google-signin',
    version: '16.1.4',
    license: 'MIT',
    copyright: 'Copyright (c) 2015 Apptailor',
  },
  { name: 'babel-preset-expo', version: '54.0.12', license: 'MIT', copyright: '' },
  {
    name: 'dayjs',
    version: '1.11.21',
    license: 'MIT',
    copyright: 'Copyright (c) 2018-present, iamkun',
  },
  { name: 'expo', version: '54.0.36', license: 'MIT', copyright: '' },
  { name: 'expo-asset', version: '12.0.13', license: 'MIT', copyright: '' },
  { name: 'expo-constants', version: '18.0.13', license: 'MIT', copyright: '' },
  { name: 'expo-crypto', version: '15.0.9', license: 'MIT', copyright: '' },
  { name: 'expo-file-system', version: '19.0.23', license: 'MIT', copyright: '' },
  { name: 'expo-font', version: '14.0.12', license: 'MIT', copyright: '' },
  { name: 'expo-image', version: '3.0.11', license: 'MIT', copyright: '' },
  { name: 'expo-image-manipulator', version: '14.0.8', license: 'MIT', copyright: '' },
  { name: 'expo-image-picker', version: '17.0.11', license: 'MIT', copyright: '' },
  { name: 'expo-linking', version: '8.0.12', license: 'MIT', copyright: '' },
  { name: 'expo-localization', version: '17.0.9', license: 'MIT', copyright: '' },
  { name: 'expo-notifications', version: '0.32.17', license: 'MIT', copyright: '' },
  { name: 'expo-router', version: '6.0.24', license: 'MIT', copyright: '' },
  { name: 'expo-screen-capture', version: '8.0.9', license: 'MIT', copyright: '' },
  { name: 'expo-secure-store', version: '15.0.8', license: 'MIT', copyright: '' },
  { name: 'expo-splash-screen', version: '31.0.13', license: 'MIT', copyright: '' },
  { name: 'expo-sqlite', version: '16.0.10', license: 'MIT', copyright: '' },
  { name: 'expo-status-bar', version: '3.0.9', license: 'MIT', copyright: '' },
  { name: 'expo-system-ui', version: '6.0.9', license: 'MIT', copyright: '' },
  {
    name: 'i18next',
    version: '26.3.6',
    license: 'MIT',
    copyright: 'Copyright (c) 2011-present i18next',
  },
  {
    name: 'lucide-react-native',
    version: '1.30.0',
    license: 'ISC',
    copyright: 'Copyright (c) 2026 Lucide Icons and Contributors',
  },
  {
    name: 'react',
    version: '19.1.0',
    license: 'MIT',
    copyright: 'Copyright (c) Meta Platforms, Inc. and affiliates.',
  },
  {
    name: 'react-dom',
    version: '19.1.0',
    license: 'MIT',
    copyright: 'Copyright (c) Meta Platforms, Inc. and affiliates.',
  },
  {
    name: 'react-i18next',
    version: '17.0.11',
    license: 'MIT',
    copyright: 'Copyright (c) 2015-present i18next',
  },
  {
    name: 'react-native',
    version: '0.81.5',
    license: 'MIT',
    copyright: 'Copyright (c) Meta Platforms, Inc. and affiliates.',
  },
  {
    name: 'react-native-google-mobile-ads',
    version: '16.0.0',
    license: 'Apache-2.0',
    copyright: 'Copyright (c) 2021-present Invertase Limited <oss@invertase.io>',
  },
  {
    name: 'react-native-purchases',
    version: '10.7.0',
    license: 'MIT',
    copyright: 'Copyright (c) 2023 RevenueCat',
  },
  {
    name: 'react-native-safe-area-context',
    version: '5.6.2',
    license: 'MIT',
    copyright: 'Copyright (c) 2019 Th3rd Wave',
  },
  {
    name: 'react-native-screens',
    version: '4.16.0',
    license: 'MIT',
    copyright: 'Copyright (c) 2018 Software Mansion <swmansion.com>',
  },
  {
    name: 'react-native-web',
    version: '0.21.2',
    license: 'MIT',
    copyright: 'Copyright (c) Nicolas Gallagher.',
  },
  {
    name: 'zustand',
    version: '5.0.14',
    license: 'MIT',
    copyright: 'Copyright (c) 2019 Paul Henschel',
  },
];
