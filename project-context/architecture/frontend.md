# Next.js App Router フロントエンドアーキテクチャガイド

## 概要

各層の責務を明確に分離し、人もAIも判断に迷わない階層構造を目指す。
設計基準が明確で、属人的な判断が入り込みにくい。

FSD（Feature-Sliced Design）に基づく5層構造を採用する。
各層は単一の責務を持ち、依存は上位から下位への一方通行のみ許可する。

```
app → widgets → features → entities → shared
```

---

## 背景と課題

Next.js App Router（Server Component / Client Component）を採用したプロジェクトにおいて、feature 単位で管理されたコンポーネントから別 feature の repository（BFF リクエスト処理）を呼び出す際に、同階層の import が発生し、暗黙の依存関係が生まれる問題があった。

本ガイドでは、FSD（Feature-Sliced Design）の思想に基づき、依存関係を構造的に制御するアーキテクチャを定義する。

---

## 詳細

### 設計原則

#### 1. データ取得は Server Component に寄せる

App Router の設計思想に従い、BFF へのデータ取得は Server Component（app/ 配下の page.tsx）で行い、Client Component には props でデータを渡す。これにより、Client Component が repository を直接 import する必要がなくなり、feature 間の跨ぎ問題が構造的に解消される。

#### 2. FSD のレイヤー依存ルールを厳守する

依存は**上位レイヤーから下位レイヤーへの一方通行**のみ。同階層のスライス同士は互いを import しない。

```
app → widgets → features → entities → shared
```

- 上位は下位を使える
- 下位は上位を知らない
- **同階層の import は禁止**

#### 3. 組み合わせたくなったら上位レイヤーの仕事

同階層のスライスを組み合わせたいという欲求が出たら、それは1つ上のレイヤーが担う責務である。

---

### ディレクトリ構成

```
frontend/src/
├── app/
│   ├── api/                           ← BFF（Route Handlers）
│   │   └── {resource}/
│   │       ├── route.ts               # GET（一覧）/ POST（作成）
│   │       └── [{resource}_id]/
│   │           └── route.ts           # GET（単体）/ PUT（更新）/ DELETE（削除）
│   └── {route}/
│       ├── page.tsx
│       └── [id]/
│           └── page.tsx
├── widgets/
│   └── {widget-name}/                    # kebab-case・名詞
│       ├── {WidgetName}.tsx              # メインコンポーネント（Domain prefix）
│       ├── {WidgetName}{Role}.tsx        # サブコンポーネント（Domain prefix + 役割）
│       └── ...
├── features/
│   └── {verb-noun}/                      # kebab-case・動詞+名詞
│       ├── {FeatureName}.tsx             # メインコンポーネント（Domain prefix）
│       ├── {FeatureName}{Role}.tsx       # サブコンポーネント（Domain prefix + 役割）
│       ├── actions.ts
│       └── types.ts
├── entities/
│   └── {resource}/
│       ├── api/
│       │   └── repository.ts
│       ├── ui/
│       │   └── {ResourceComponent}.tsx
│       └── model/
│           └── types.ts
└── shared/
    ├── ui/
    │   └── {ComponentName}.tsx
    ├── lib/
    │   └── {utilName}.ts
    └── api/
        └── client.ts
```

---

### 各レイヤーの責務と粒度

#### app/（ルーティング + データ取得の orchestration）

Server Component として、必要な repository を呼び出し、取得したデータを widgets / features / entities に props で渡す。

#### widgets/（画面固有の複合UIブロック）

粒度の判定基準: **「そのブロックだけ四角で囲んで、ページから切り離せるか？」**

- 複数の entities や features を組み合わせている
- ページをまたいで再利用しうる（1ページ限定でも十分に複合的なら widget）
- データ取得はしない（props で受け取る）
- 名前は名詞で付く（order-list-panel, dashboard-summary, sidebar-navigation）

**命名規則（BCD Domain 原則）：**

- スライス名（kebab-case）を PascalCase に変換したものが Domain prefix
- メインコンポーネント: `{DomainPrefix}.tsx`
- サブコンポーネント: `{DomainPrefix}{Role}.tsx`（フラット配置）

```
widgets/order-list-panel/
├── OrderListPanel.tsx          # メイン
├── OrderListPanelHeader.tsx    # サブ
└── OrderListPanelItem.tsx      # サブ
```

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

#### features/（ユーザー操作・アクション単位）

粒度の判定基準: **「動詞 + 名詞」で命名できるか？**

- 1つのユーザー操作 = 1つの feature
- Server Action と 1対1 になることが多い
- 操作に付随する UI（フォーム、確認モーダル、ボタン等）を含む
- 「注文を作成してさらに決済する」は create-order と process-payment に分ける

**命名規則（BCD Domain 原則）：**

- スライス名（kebab-case）を PascalCase に変換したものが Domain prefix
- メインコンポーネント: `{DomainPrefix}.tsx`
- サブコンポーネント: `{DomainPrefix}{Role}.tsx`（フラット配置）

```
features/create-order/
├── CreateOrder.tsx             # メイン
├── CreateOrderForm.tsx         # サブ
├── CreateOrderConfirm.tsx      # サブ
├── actions.ts
└── types.ts
```

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

#### entities/（リソース単位の再利用パーツ + repository）

粒度の判定基準: **BFF に独立したエンドポイント群があるか？**

- BFF の API レスポンス型と 1対1 で対応する
- 独立した API エンドポイントがないもの（例：order の中に含まれる order_items）は entity にしない
- `api/repository.ts` で `app/api/{resource}/route.ts`（BFF Route Handler）を呼び出す
- `model/types.ts` でドメイン型を定義する
- `ui/` で特定リソースの型を受け取って表示する再利用コンポーネントを提供する

```
BFF Route Handler                        entity             repository
app/api/users/route.ts               → entities/user/    → entities/user/api/repository.ts
app/api/orders/route.ts              → entities/order/   → entities/order/api/repository.ts
app/api/products/route.ts            → entities/product/ → entities/product/api/repository.ts
(order_items は app/api/orders に含まれる)                  → entity にしない
```

#### shared/（ドメイン無関係の共通機能）

- ui/: ドメイン知識のない汎用UIコンポーネント
- lib/: ユーティリティ関数
- api/client.ts: 汎用 fetch ラッパー（認証ヘッダー付与等）。ドメイン知識を持たない

---

### データフローの全体像

#### 読み取り（Read）

```
app/page.tsx (Server Component)
  │
  ├─ entities/user/api/repository.ts ──→ app/api/users/route.ts ──→ 外部API
  ├─ entities/order/api/repository.ts ──→ app/api/orders/route.ts ──→ 外部API
  │
  └─ props でデータを渡す
       │
       widgets/  ──→  features/  ──→  entities/  ──→  shared/ui/
```

#### 書き込み（Mutation）

```
features/ (Client Component)
  │
  └─ Server Action を呼び出す
       │
       features/create-order/actions.ts ("use server")
         │
         └─ entities/order/api/repository.ts ──→ app/api/orders/route.ts ──→ 外部API
```

---

### コンポーネント配置の判定フローチャート

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

### feature と repository の対応関係

画面ブロック（widgets + features）と repository は N:M の関係になる。1対1にする必要はない。

- 1つの widget が複数の repository のデータを必要とする（よくある）
- 1つの repository のデータが複数の widget から使われる（よくある）

両者を繋ぐのが app/page.tsx（Server Component）であり、widget や feature が repository を直接知らないため、粒度が異なっていても混乱しない。

---

### Server Component / Client Component の判断基準

#### 基本方針

Server/Client の境界はレイヤーという「責務の種類」ではなく、**「そのコンポーネントがブラウザの機能を必要とするか」** で決まる。どのレイヤーに属していても、この基準でコンポーネント単位に判断する。

#### 判断基準

| 条件 | 判定 |
|---|---|
| `useState` / `useReducer` / `useEffect` などを使う | Client Component |
| `onClick` / `onChange` などイベントハンドラを持つ | Client Component |
| `window` / `document` などブラウザ API を使う | Client Component |
| 上記に該当しない | Server Component（デフォルト） |

#### `"use client"` の付け方

ファイル単位で付ける。ブラウザ機能が必要になった時点でそのファイルの先頭に追加する。

---

### ルーティング設計

基本的な App Router のファイルベースルーティング（`page.tsx` / `layout.tsx` / `error.tsx` / `not-found.tsx`）を使用する。

Parallel Routes・Intercepting Routes・Route Groups などの高度な機能は現時点では使用しない。プロジェクトの要件に応じて導入を検討する場合は [`architecture/routing-advanced.md`](./routing-advanced.md) を参照。

---

### 禁止事項

1. **同階層スライス間の import 禁止**: entities/user/ から entities/order/ を import しない
2. **下位レイヤーから上位レイヤーの参照禁止**: entities から widgets を import しない
3. **Client Component から repository の直接呼び出し禁止**: データ取得は必ず Server Component 経由
4. **Server Action から、その操作に直接関係しない entity の repository を import しない**

---

## 関連ドキュメント

- [フロントエンド運用方針](../operations/frontend.md) — テスト戦略・状態管理・キャッシュ・エラーハンドリング・環境変数
- [フロントエンド実装例](./frontend_example.md) — データフローの Read / Mutation パターン実装例
- [BCD Design 命名規則](./bcd-design.md) — コンポーネント命名の分類概念・Domain prefix ルール
