# フロントエンド コーディングガイドライン

FSD（Feature-Sliced Design）ベースのアーキテクチャに基づくフロントエンド固有のコーディングルール。

**アーキテクチャ詳細**: [`architecture/frontend.md`](../architecture/frontend.md)
**詳細ルール**: `.claude/rules/frontend-architecture.md`

---

## レイヤー依存の方向

```
app → widgets → features → entities → shared
```

- 上位レイヤーは下位レイヤーを import できる
- 下位レイヤーは上位レイヤーを import **してはならない**
- 同階層のスライス同士は互いを import **してはならない**

---

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

---

## データフロー

### 読み取り（Read）

- `app/page.tsx`（Server Component）で repository を呼び出す
- 取得したデータは props で下位レイヤーに渡す
- **Client Component が repository を直接 import してはならない**

### 書き込み（Mutation）

- Client Component から `features/{action}/actions.ts` の Server Action を呼び出す
- Server Action 内で repository を呼び出す

---

## 禁止事項

1. **同階層スライス間の import** — 例: `entities/user/` から `entities/order/` を import
2. **下位レイヤーから上位レイヤーへの参照** — 例: `entities/` から `widgets/` を import
3. **Client Component から repository の直接呼び出し**
4. **Server Action から無関係な entity の repository を import**
