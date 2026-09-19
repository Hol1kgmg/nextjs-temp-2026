---
description: FSD (Feature-Sliced Design) based architecture rules for Next.js App Router. Applies when creating or editing frontend source files.
alwaysApply: false
paths: 'frontend/src/**/*.ts,frontend/src/**/*.tsx'
globs: '*.ts,*.tsx'
---

# Frontend Architecture Rules (FSD)

詳細は `project-context/architecture/frontend.md` を参照。

## レイヤー依存の方向

```
app → widgets → features → entities → shared
```

- 上位レイヤーは下位レイヤーを import できる
- 下位レイヤーは上位レイヤーを import **してはならない**
- 同階層のスライス同士は互いを import **してはならない**

## ファイル配置の判断基準

| 何を作るか | 配置先 |
|---|---|
| ドメイン知識のない汎用UIコンポーネント | `shared/ui/` |
| 汎用ユーティリティ関数 | `shared/lib/` |
| 汎用 fetch ラッパー（認証ヘッダー等） | `shared/api/client.ts` |
| 特定リソースの型・表示パーツ | `entities/{resource}/model/` `entities/{resource}/ui/` |
| 特定リソースの BFF リクエスト処理 | `entities/{resource}/api/repository.ts` |
| ユーザー操作（動詞+名詞で命名できる） | `features/{action}/` |
| 操作に伴う Server Action | `features/{action}/actions.ts` |
| 複数の entities/features を組み合わせた画面ブロック | `widgets/{name}/` |
| ページ構成・データ取得の orchestration | `app/` |

## コンポーネント命名規則（BCD Domain 原則）

スライス名（kebab-case）を PascalCase に変換したものを **Domain prefix** とする。

- メインコンポーネント: `{DomainPrefix}.tsx`
- サブコンポーネント: `{DomainPrefix}{Role}.tsx`
- サブコンポーネントはスライス直下にフラット配置（サブディレクトリを作らない）

```
# widgets の例
widgets/order-list-panel/
├── OrderListPanel.tsx
├── OrderListPanelHeader.tsx
└── OrderListPanelItem.tsx

# features の例
features/create-order/
├── CreateOrder.tsx
├── CreateOrderForm.tsx
├── CreateOrderConfirm.tsx
├── actions.ts
└── types.ts
```

## データフロー

### 読み取り（Read）
- `app/page.tsx`（Server Component）で `entities/{resource}/api/repository.ts` を呼び出す
- 取得したデータは props で下位レイヤーに渡す
- Client Component が repository を直接 import **してはならない**

### 書き込み（Mutation）
- Client Component から `features/{action}/actions.ts` の Server Action を呼び出す
- Server Action 内で `entities/{resource}/api/repository.ts` を呼び出す

```tsx
// app/example/page.tsx
import { getItems } from '@/entities/item/api/repository'
import { ExampleWidget } from '@/widgets/example/ExampleWidget'

export default async function ExamplePage() {
  const items = await getItems()
  return <ExampleWidget items={items} />
}
```

```ts
// features/create-item/actions.ts
'use server'
import { createItem } from '@/entities/item/api/repository'

export async function createItemAction(formData: FormData) {
  await createItem(/* ... */)
}
```

## 禁止事項

1. 同階層スライス間の import（例: `entities/user/` から `entities/order/` を import）
2. 下位レイヤーから上位レイヤーへの参照（例: `entities/` から `widgets/` を import）
3. Client Component から repository の直接呼び出し
4. Server Action から、その操作に直接関係しない entity の repository を import
