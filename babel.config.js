module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    env: {
      // 릴리즈(production) 번들에서만 console.log/info/debug 제거 — error·warn은 남겨 런타임 문제 신호 보존.
      // 일기 본문·PIN 등 민감값이 프로덕션 로그캣에 흘러가는 걸 원천 차단(volleyball과 동일 정책).
      production: {
        plugins: [['transform-remove-console', { exclude: ['error', 'warn'] }]],
      },
    },
  };
};
