import panda from '@pandacss/eslint-plugin';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import command from 'eslint-plugin-command/config';
import oxlint from 'eslint-plugin-oxlint';
import react from 'eslint-plugin-react';
import reactCompiler from 'eslint-plugin-react-compiler';
import reactYouMightNotNeedAnEffect from 'eslint-plugin-react-you-might-not-need-an-effect';
import storybook from 'eslint-plugin-storybook';
import { defineConfig, globalIgnores } from 'eslint/config';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'styled-system/**',
    '!.storybook',
  ]),
  {
    plugins: {
      react,
    },
    // biomeのuseSortedAttributes相当のものを実現するための設定
    rules: {
      'react/jsx-sort-props': [
        'error',
        {
          callbacksLast: true,
          ignoreCase: true,
          reservedFirst: true,
        },
      ],
    },
  },
  // react-compilerのための設定
  reactCompiler.configs.recommended,
  // 不要なuseEffectを抑制するための設定
  reactYouMightNotNeedAnEffect.configs.recommended,
  // Panda CSS用の設定
  {
    name: 'panda/recommended',
    plugins: { '@pandacss': panda },
    rules: {
      ...panda.configs.recommended.rules,
      '@pandacss/no-hardcoded-color': 'off',
    },
  },
  // Storybook用の設定
  ...storybook.configs['flat/recommended'],
  // eslint-plugin-command用の設定(おまけ)
  command(),
  // ESLint側のフォーマット関連のルールを無効化するための設定
  eslintConfigPrettier,
  // oxlintとの競合を防ぐための設定
  ...oxlint.buildFromOxlintConfigFile('.oxlintrc.json'),
]);

export default eslintConfig;
