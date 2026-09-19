# BCD Design コンポーネント命名規則

## 概要

BCD Design は、コンポーネント名に使う**単語の意味・性質**に基づいてコンポーネントを体系的に分類する設計思想。
主観や属人的判断を排し、「名前を見れば所属レイヤーと役割がわかる」状態を目指す。

> 参考: [BCD Design によるコンポーネントの分類](https://qiita.com/misuken/items/19f9f603ab165e228fe1)

---

## 4つの分類概念

| 分類 | 意味 | 特徴 |
|---|---|---|
| **Base** | 機能そのもの・汎用型 | ドメイン知識を持たない。どこでも使える |
| **Case** | 状態・バリエーション | Base や Domain に付随する状態表現 |
| **Common** | 複数ドメインで共有されるパーツ | 特定ドメインに依存しないが汎用でもない |
| **Domain** | 特定の関心対象（人・物・操作） | ドメイン知識を持つ。名前にドメインが入る |

---

## このプロジェクトでの適用

FSD レイヤーと BCD 分類を対応させる。

| BCD 分類 | FSD レイヤー | 例 |
|---|---|---|
| Base | `shared/ui/` | `Button`, `Input`, `Dialog` |
| Case | 各レイヤーのサブコンポーネント | `ButtonLoading`, `InputDisabled` |
| Common | `shared/ui/`（ドメイン横断） | `PageHeader`, `EmptyState` |
| Domain（名詞） | `widgets/`, `entities/ui/` | `OrderListPanel`, `UserProfileCard` |
| Domain（動詞+名詞） | `features/` | `CreateOrder`, `UpdateProfile` |

---

## Domain prefix ルール

`widgets/` と `features/` のコンポーネントは **Domain prefix** で命名する。

**Domain prefix** = スライス名（kebab-case）を PascalCase に変換したもの

```
widgets/order-list-panel/  →  OrderListPanel
features/create-order/     →  CreateOrder
```

### ファイル構成

メインコンポーネントとサブコンポーネントはスライス直下に**フラット配置**する。
サブコンポーネントは `{DomainPrefix}{Role}` の形式で命名し、名前だけで所属スライスがわかるようにする。

```
widgets/order-list-panel/
├── OrderListPanel.tsx          # メイン
├── OrderListPanelHeader.tsx    # サブ: ヘッダー部
└── OrderListPanelItem.tsx      # サブ: 行アイテム

features/create-order/
├── CreateOrder.tsx             # メイン
├── CreateOrderForm.tsx         # サブ: フォーム
├── CreateOrderConfirm.tsx      # サブ: 確認モーダル
├── actions.ts
└── types.ts
```

---

## 命名の判断フローチャート

```
コンポーネントを命名したい
  │
  ├─ ドメイン知識がない（Button, Input など）？
  │    → Base → shared/ui/{ComponentName}.tsx
  │
  ├─ 複数ドメインで使うが汎用ではない？
  │    → Common → shared/ui/{ComponentName}.tsx
  │
  ├─ 特定リソースの状態・型に依存する？
  │    → Domain → entities/{resource}/ui/{ResourceName}.tsx
  │
  ├─ 「動詞+名詞」で表現できる操作？
  │    → Domain（操作）→ features/{verb-noun}/{FeatureName}.tsx
  │
  └─ 複数 entities/features を組み合わせた画面ブロック？
       → Domain（表示）→ widgets/{widget-name}/{WidgetName}.tsx
```

---

## NG パターン

```
❌ ドメインなしの名前を features/widgets に置く
  Panel.tsx           → どのスライスか不明
  Form.tsx            → どのスライスか不明

❌ Domain prefix なしのサブコンポーネント
  features/create-order/Form.tsx        → CreateOrderForm.tsx にする
  widgets/order-list-panel/Item.tsx     → OrderListPanelItem.tsx にする

❌ 役割が広すぎる動詞
  manage-order        → 何をするか不明 → create / update / delete に分ける
  handle-payment      → handle は意味が曖昧 → process-payment にする
```

---

## 関連ドキュメント

- [フロントエンドアーキテクチャガイド](./frontend.md) — FSD レイヤー構造・依存ルール・データフロー
