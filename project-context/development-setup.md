# Development Setup

## 前提条件

- Node.js（`.node-version` または `.nvmrc` に記載のバージョン）
- pnpm

## セットアップ

```bash
cd frontend
pnpm install
```

Panda CSS のコード生成（初回・スキーマ変更時）:

```bash
pnpm prepare
```

## 開発サーバー

```bash
cd frontend
pnpm dev
```

`http://localhost:3000` で起動する。

## コマンド一覧

### テスト

```bash
# 全テスト実行
pnpm test

# ユニットテストのみ
pnpm test:unit

# Storybook テストのみ
pnpm test:storybook
```

### Storybook

```bash
pnpm storybook
```

`http://localhost:6006` で起動する。

### Lint / Format

```bash
# Lint（oxlint + ESLint + Markuplint）
pnpm lint

# フォーマット（oxfmt）
pnpm format

# Lint + Format まとめて実行
pnpm check
```

### ビルド

```bash
pnpm build
```

## Git フック

Lefthook によりコミット前に自動で lint が実行される。設定は `lefthook.yml` を参照。
