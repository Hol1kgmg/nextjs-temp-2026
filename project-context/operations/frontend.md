# フロントエンド運用方針

Next.js App Router フロントエンドにおける、テスト・状態管理・キャッシュ・エラーハンドリング・環境変数の運用方針を定義する。

アーキテクチャの思想・構造については [architecture/frontend.md](../architecture/frontend.md) を参照。

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
