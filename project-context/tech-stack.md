# Tech Stack

## コア

| 技術 | バージョン | 用途 |
|---|---|---|
| [Next.js](https://nextjs.org/) | 16.1.4 | フレームワーク（App Router） |
| [React](https://react.dev/) | 19.2.3 | UI ライブラリ |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | 言語 |

## スタイリング

| 技術 | バージョン | 用途 |
|---|---|---|
| [Panda CSS](https://panda-css.com/) | 1.x | CSS-in-JS（ゼロランタイム） |

## テスト

| 技術 | バージョン | 用途 |
|---|---|---|
| [Vitest](https://vitest.dev/) | 4.x | ユニットテスト・コンポーネントテスト |
| [Storybook](https://storybook.js.org/) | 10.x | コンポーネント開発・ビジュアルテスト |
| [Playwright](https://playwright.dev/) | 1.x | ブラウザテスト（Vitest browser mode） |
| [@testing-library/react](https://testing-library.com/) | 16.x | React コンポーネントテスト |

## 品質管理

| 技術 | バージョン | 用途 |
|---|---|---|
| [oxlint](https://oxc.rs/docs/guide/usage/linter.html) | 1.x | 高速 Linter（メイン） |
| [ESLint](https://eslint.org/) | 9.x | oxlint 非対応ルールの補完 |
| [oxfmt](https://oxc.rs/) | 0.26.x | フォーマッター |
| [Markuplint](https://markuplint.dev/) | 4.x | HTML/JSX マークアップ検証 |
| [Lefthook](https://github.com/evilmartians/lefthook) | 2.x | Git フック管理 |

## データフェッチ・状態管理

| 技術 | バージョン | 用途 |
|---|---|---|
| [TanStack Query](https://tanstack.com/query) | - | Client Component のデータ取得・キャッシュ管理 |
| [Jotai](https://jotai.org/) | - | UI 状態・クライアント状態管理 |

## エラーハンドリング

| 技術 | バージョン | 用途 |
|---|---|---|
| [@praha/byethrow](https://github.com/praha-inc/byethrow) | 0.10.0 | Result 型によるエラーハンドリング |

## パッケージ管理

| 技術 | 用途 |
|---|---|
| [pnpm](https://pnpm.io/) | パッケージマネージャー |

## アーキテクチャ方針

- **FSD（Feature-Sliced Design）**: レイヤー依存を構造的に制御
- **App Router**: Server Component でデータ取得、Client Component に props で渡す
- **React Compiler**: `babel-plugin-react-compiler` による自動最適化
