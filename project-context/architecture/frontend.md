# Next.js App Router フロントエンドアーキテクチャガイド

## 背景と課題

Next.js App Router（Server Component / Client Component）を採用したプロジェクトにおいて、feature 単位で管理されたコンポーネントから別 feature の repository（BFF リクエスト処理）を呼び出す際に、同階層の import が発生し、暗黙の依存関係が生まれる問題があった。

本ガイドでは、FSD（Feature-Sliced Design）の思想に基づき、依存関係を構造的に制御するアーキテクチャを定義する。

---

## 設計原則

### 1. データ取得は Server Component に寄せる

App Router の設計思想に従い、BFF へのデータ取得は Server Component（app/ 配下の page.tsx）で行い、Client Component には props でデータを渡す。これにより、Client Component が repository を直接 import する必要がなくなり、feature 間の跨ぎ問題が構造的に解消される。

### 2. FSD のレイヤー依存ルールを厳守する

依存は**上位レイヤーから下位レイヤーへの一方通行**のみ。同階層のスライス同士は互いを import しない。

```
app → widgets → features → entities → shared
```

- 上位は下位を使える
- 下位は上位を知らない
- **同階層の import は禁止**

### 3. 組み合わせたくなったら上位レイヤーの仕事

同階層のスライスを組み合わせたいという欲求が出たら、それは1つ上のレイヤーが担う責務である。

---

## ディレクトリ構成

```
frontend/src/
  app/                              ← FSD: app + pages
    dashboard/
      page.tsx                         Server Component
    orders/                            データ取得 → 下位レイヤーに props で渡す
      page.tsx
      [id]/
        page.tsx

  widgets/                          ← 画面固有の複合UIブロック
    order-list-panel/
      OrderListPanel.tsx
      OrderListHeader.tsx              内部分割（外部に export しない）
      OrderListItem.tsx
    dashboard-summary/
      DashboardSummary.tsx

  features/                         ← ユーザー操作・アクション単位
    create-order/
      CreateOrderForm.tsx
      CreateOrderButton.tsx
      useCreateOrder.ts
      actions.ts                       "use server" で定義
      types.ts
    update-profile/
      ProfileEditForm.tsx
      actions.ts
    search-product/
      SearchProductInput.tsx

  entities/                         ← リソース単位の再利用コンポーネント＋型＋repository
    user/
      api/
        repository.ts                  BFF の GET /api/users に対応
      ui/
        UserAvatar.tsx
        UserNameLabel.tsx
      model/
        types.ts
    order/
      api/
        repository.ts                  BFF の GET /api/orders に対応
      ui/
        OrderStatusBadge.tsx
      model/
        types.ts
    product/
      api/
        repository.ts                  BFF の GET /api/products に対応
      ui/
        ProductCard.tsx
      model/
        types.ts

  shared/                           ← ドメイン無関係の共通レイヤー
    ui/
      Button.tsx
      Modal.tsx
      DataTable.tsx
    lib/
      formatDate.ts
    api/
      client.ts                        汎用 fetch ラッパー（ドメイン知識なし）
```

---

## 各レイヤーの責務と粒度

### app/（ルーティング + データ取得の orchestration）

Server Component として、必要な repository を呼び出し、取得したデータを widgets / features / entities に props で渡す。

```tsx
// app/dashboard/page.tsx
import { getUsers } from '@/entities/user/api/repository'
import { getOrders } from '@/entities/order/api/repository'
import { DashboardSummary } from '@/widgets/dashboard-summary/DashboardSummary'

export default async function DashboardPage() {
  const [users, orders] = await Promise.all([
    getUsers(),
    getOrders(),
  ])
  return <DashboardSummary users={users} orders={orders} />
}
```

### widgets/（画面固有の複合UIブロック）

粒度の判定基準: **「そのブロックだけ四角で囲んで、ページから切り離せるか？」**

- 複数の entities や features を組み合わせている
- ページをまたいで再利用しうる（1ページ限定でも十分に複合的なら widget）
- データ取得はしない（props で受け取る）
- 名前は名詞で付く（order-list-panel, dashboard-summary, sidebar-navigation）

```
✅ widgets の例
  order-list-panel       注文一覧パネル
  dashboard-summary      ダッシュボードのサマリー領域
  user-profile-card      プロフィール表示カード
  sidebar-navigation     サイドバー
  header                 ヘッダー

❌ widgets ではないもの
  create-order           → 操作 → features
  OrderStatusBadge       → 単一 entity のパーツ → entities
  Button                 → ドメイン知識なし → shared
```

### features/（ユーザー操作・アクション単位）

粒度の判定基準: **「動詞 + 名詞」で命名できるか？**

- 1つのユーザー操作 = 1つの feature
- Server Action と 1対1 になることが多い
- 操作に付随する UI（フォーム、確認モーダル、ボタン等）を含む
- 「注文を作成してさらに決済する」は create-order と process-payment に分ける

```
✅ features の例
  create-order           注文を作成する
  update-profile         プロフィールを更新する
  search-product         商品を検索する
  delete-comment         コメントを削除する
  toggle-favorite        お気に入りを切り替える

❌ features ではないもの
  order-management       → 動詞がない → widgets
  user-info              → 動詞がない → entities
  dashboard              → 動詞がない → widgets
```

### entities/（リソース単位の再利用パーツ + repository）

粒度の判定基準: **BFF に独立したエンドポイント群があるか？**

- BFF の API レスポンス型と 1対1 で対応する
- 独立した API エンドポイントがないもの（例：order の中に含まれる order_items）は entity にしない
- `api/repository.ts` でそのリソースの BFF リクエスト処理を担う
- `model/types.ts` でドメイン型を定義する
- `ui/` で特定リソースの型を受け取って表示する再利用コンポーネントを提供する

```
BFF エンドポイント              entity             repository
GET /api/users             → entities/user/    → entities/user/api/repository.ts
GET /api/orders            → entities/order/   → entities/order/api/repository.ts
GET /api/products          → entities/product/ → entities/product/api/repository.ts
(order_items は /api/orders に含まれる)          → entity にしない
```

### shared/（ドメイン無関係の共通機能）

- ui/: ドメイン知識のない汎用UIコンポーネント
- lib/: ユーティリティ関数
- api/client.ts: 汎用 fetch ラッパー（認証ヘッダー付与等）。ドメイン知識を持たない

---

## データフローの全体像

### 読み取り（Read）

```
app/page.tsx (Server Component)
  │
  ├─ entities/user/api/repository.ts ──→ BFF GET /api/users
  ├─ entities/order/api/repository.ts ──→ BFF GET /api/orders
  │
  └─ props でデータを渡す
       │
       widgets/  ──→  features/  ──→  entities/  ──→  shared/ui/
```

### 書き込み（Mutation）

```
features/ (Client Component)
  │
  └─ Server Action を呼び出す
       │
       features/create-order/actions.ts ("use server")
         │
         └─ entities/order/api/repository.ts ──→ BFF POST /api/orders
```

```tsx
// features/create-order/actions.ts
'use server'
import { createOrder } from '@/entities/order/api/repository'

export async function createOrderAction(formData: FormData) {
  await createOrder(/* ... */)
  // revalidatePath, redirect 等
}
```

---

## コンポーネント配置の判定フローチャート

```
コンポーネントを作りたい
  │
  ├─ ドメイン知識がない？
  │    → shared/ui/
  │
  ├─ 1つのリソースの型だけに依存する再利用パーツ？
  │    → entities/xxx/ui/
  │
  ├─ 「動詞+名詞」で命名できるユーザー操作？
  │    → features/
  │
  ├─ 複数の entities/features を組み合わせた画面ブロック？
  │    → widgets/
  │
  └─ ページ全体の構成・データ取得？
       → app/
```

---

## feature と repository の対応関係

画面ブロック（widgets + features）と repository は N:M の関係になる。1対1にする必要はない。

- 1つの widget が複数の repository のデータを必要とする（よくある）
- 1つの repository のデータが複数の widget から使われる（よくある）

両者を繋ぐのが app/page.tsx（Server Component）であり、widget や feature が repository を直接知らないため、粒度が異なっていても混乱しない。

---

## 環境変数の管理

### ファイル構成

| ファイル | 用途 | git 管理 |
|---|---|---|
| `.env` | 実際の値 | 管理外（`.gitignore`） |
| `.env.template` | 必要な変数の一覧・説明 | 管理内 |

Next.js は dotenv を内部で使用しており、`.env` を自動でロードするため追加ライブラリは不要。Next.js を介さないスクリプト（seed スクリプト等）では dotenv を明示的に使用する。

### `NEXT_PUBLIC_` の使い分け

- `NEXT_PUBLIC_` プレフィックスあり → クライアント（ブラウザ）からアクセス可能
- プレフィックスなし → サーバー専用（クライアントには公開されない）

---

## テスト戦略

### レイヤー別テスト方針

| レイヤー | 役割 | Vitest | Storybook |
|---|---|---|---|
| `shared/ui/` | 汎用UIパーツ | アクセシビリティ・インタラクション | 全バリアントの網羅 |
| `entities/ui/` | リソース表示パーツ | props による表示確認 | モックデータでの見た目確認 |
| `entities/api/` | BFF リクエスト処理 | **重点テスト**（MSW でモック） | - |
| `features/` | ユーザー操作・Server Action | Server Action のロジックテスト | フォーム操作（play 関数） |
| `widgets/` | 複合UIブロック | 最小限（下位レイヤーで担保） | 統合レベルの見た目確認 |
| `app/` | ルーティング・orchestration | - | - |

### CI/CD パイプライン

```
Push / PR
  ├── pnpm lint            # oxlint + ESLint + Markuplint
  ├── pnpm test:unit       # Vitest ユニットテスト
  ├── pnpm test:storybook  # Storybook インタラクションテスト
  └── pnpm build           # ビルド確認
```

### 方針の意図

- **ロジック層（`entities/api/`・`features/actions`）** を重点テスト → AI 実装でも CI で品質担保
- **UI 層** は Storybook で見た目を担保 → ビジュアルリグレッションを CI で検出
- `widgets/` と `app/` はユニットテストを最小限にして下位レイヤーへの信頼で担保

---

## 状態管理方針

### TanStack Query との役割分担

| 手段 | 管理対象 |
|---|---|
| TanStack Query | サーバーデータ（API から取得するデータ） |
| Jotai | UI 状態・クライアント状態（モーダル開閉・選択状態・フィルター条件など） |

### アトムの配置ルール（FSD との統合）

アトムは「**そのアトムを必要とする最小のスコープ**」のレイヤーに配置する。

| 配置先 | 用途 |
|---|---|
| `shared/lib/store/` | アプリ全体で使うアトム（テーマ・言語設定など） |
| `features/{action}/model/store.ts` | その feature 内の UI 状態（フォームの開閉など） |
| `entities/{resource}/model/store.ts` | リソース固有の選択状態（選択中のアイテムなど） |
| `widgets/{name}/model/store.ts` | その widget 固有の状態 |

### 原則

- グローバルアトム（`shared/`）は最小限に抑える
- FSD の依存ルールはアトムにも適用する（下位レイヤーのアトムを上位から参照するのはOK、逆は禁止）
- `widgets/` はなるべく props で受け取ることを優先し、アトムは最終手段

---

## キャッシュ戦略

### 役割分担

| 場面 | 手段 |
|---|---|
| Server Component 内の重複排除 | `React.cache()` でリポジトリ関数をラップ |
| クロスリクエストキャッシュ | `unstable_cache` / `use cache` |
| Client Component のデータ取得・キャッシュ | TanStack Query（`@tanstack/react-query`） |
| データ更新後の再検証 | `revalidatePath`（ページ単位） |

### 方針

- Client Component での非同期データ取得は**すべて TanStack Query** を使う
- Server Action 後のキャッシュ破棄は `revalidatePath` でページ単位に行う

---

## エラーハンドリング方針

### エラーの2分類

| 種類 | 定義 | 対処 |
|---|---|---|
| **予期されたエラー** | ビジネスロジック上起こりうるエラー（リソース未発見・権限不足など） | `Result` 型で返す（`@praha/byethrow`） |
| **予期しないエラー** | インフラ起因の障害（DB接続失敗・ネットワークタイムアウトなど） | `throw` → エラーバウンダリが捕捉 |

### 各場所での方針

**`error.tsx` / `not-found.tsx`**
- ルートに1つだけ配置（グローバル）
- 予期しないエラーの最終捕捉場所

**`entities/api/repository.ts`**
- 予期されたエラー（404など）→ `Result.fail()` で返す
- 予期しないエラー → `throw` させる

**`features/*/actions.ts`（Server Action）**
- repository から受け取った `Result` を呼び出し元（Client Component）に返す
- 予期しないエラーは `throw` → `error.tsx` へ

---

## Server Component / Client Component の判断基準

### 基本方針

Server/Client の境界はレイヤーという「責務の種類」ではなく、**「そのコンポーネントがブラウザの機能を必要とするか」** で決まる。どのレイヤーに属していても、この基準でコンポーネント単位に判断する。

### 判断基準

| 条件 | 判定 |
|---|---|
| `useState` / `useReducer` / `useEffect` などを使う | Client Component |
| `onClick` / `onChange` などイベントハンドラを持つ | Client Component |
| `window` / `document` などブラウザ API を使う | Client Component |
| 上記に該当しない | Server Component（デフォルト） |

### `"use client"` の付け方

ファイル単位で付ける。ブラウザ機能が必要になった時点でそのファイルの先頭に追加する。

---

## ルーティング設計

基本的な App Router のファイルベースルーティング（`page.tsx` / `layout.tsx` / `error.tsx` / `not-found.tsx`）を使用する。

Parallel Routes・Intercepting Routes・Route Groups などの高度な機能は現時点では使用しない。プロジェクトの要件に応じて導入を検討する場合は [`architecture/routing-advanced.md`](./routing-advanced.md) を参照。

---

## 禁止事項

1. **同階層スライス間の import 禁止**: entities/user/ から entities/order/ を import しない
2. **下位レイヤーから上位レイヤーの参照禁止**: entities から widgets を import しない
3. **Client Component から repository の直接呼び出し禁止**: データ取得は必ず Server Component 経由
4. **Server Action から、その操作に直接関係しない entity の repository を import しない**
