# 高度なルーティング機能 比較検討資料

現時点では使用しないが、プロジェクト要件に応じて導入を検討するための参考資料。

---

## Parallel Routes

### 概要

同一ページ内に複数の独立したスロット（`@slot`）を配置し、それぞれが独立してナビゲーションできる。

```
app/
  dashboard/
    layout.tsx
    page.tsx
    @analytics/
      page.tsx
    @team/
      page.tsx
```

```tsx
// app/dashboard/layout.tsx
export default function Layout({
  children,
  analytics,
  team,
}: {
  children: React.ReactNode
  analytics: React.ReactNode
  team: React.ReactNode
}) {
  return (
    <div>
      {children}
      {analytics}
      {team}
    </div>
  )
}
```

### 向いているケース

- ダッシュボードの複数パネルをそれぞれ独立してローディング・エラーハンドリングしたい
- タブ切り替えで URL を変えつつ、レイアウトは維持したい
- モーダルを URL 付きで表示したい（Intercepting Routes と組み合わせ）

### 注意点

- スロットが増えると `layout.tsx` が複雑になる
- 各スロットに `default.tsx` が必要になる場合がある

---

## Intercepting Routes

### 概要

現在のレイアウトを維持しつつ、別ルートのコンテンツをオーバーレイ表示する。ブラウザの URL は変わるが、ページ遷移は起きない。

```
app/
  feed/
    page.tsx
    (..)photo/
      [id]/
        page.tsx    ← feed ページ上にモーダルとして表示
  photo/
    [id]/
      page.tsx      ← 直接アクセス時はフルページ表示
```

### 向いているケース

- 一覧から詳細をモーダルで表示し、URL も変えたい（画像ギャラリー、投稿詳細など）
- 共有 URL をコピーしたとき、受け取った人にはフルページで表示したい

### 注意点

- Parallel Routes と組み合わせて使うことが多く、設定がやや複雑
- シンプルなモーダルであれば、URL 変更不要なら通常の state 管理で十分

---

## Route Groups

### 概要

`(group)` フォルダで URL に影響を与えずにルートをグルーピングし、レイアウトを分割できる。

```
app/
  (marketing)/
    layout.tsx      ← マーケティング用レイアウト
    about/
      page.tsx      → /about
    blog/
      page.tsx      → /blog
  (app)/
    layout.tsx      ← アプリ用レイアウト（認証済みユーザー向け）
    dashboard/
      page.tsx      → /dashboard
```

### 向いているケース

- 認証済み／未認証でレイアウトを完全に分けたい
- マーケティングページとアプリページでヘッダー・フッターが異なる
- ルートグループごとに異なるミドルウェアを適用したい

### 注意点

- フォルダ名が URL に含まれないため、ファイル構成と URL の対応が分かりにくくなることがある
- 単純にレイアウトを分けたいだけなら `layout.tsx` のネストで対応できる場合も多い

---

## 選択フローチャート

```
モーダルを URL 付きで表示したい
  → Parallel Routes + Intercepting Routes

ページ内に独立してロードされる複数のセクションがある
  → Parallel Routes

認証済み／未認証でレイアウトを完全に分けたい
  → Route Groups

上記に該当しない
  → 通常の page.tsx / layout.tsx で対応
```
