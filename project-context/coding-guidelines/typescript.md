# TypeScript/React コーディングガイドライン

型安全で保守性の高い TypeScript/React コードを書くためのガイドライン。

**詳細ルール**: `.claude/rules/typescript-patterns.md`

---

## 型安全の基本

### Branded Types

プリミティブ型の誤用を防ぐために名前的型付けを使用する。

```typescript
declare const BitPositionBrand: unique symbol;
export type BitPosition = (0 | 1 | 2 | 3 | 4 | 5 | 6 | 7) & {
  readonly [BitPositionBrand]: typeof BitPositionBrand;
};
```

### `satisfies never` による網羅性チェック

文字列ユニオンで分岐する際は `satisfies never` でコンパイル時の網羅性を保証する。

```typescript
default: {
  result satisfies never; // 新しいバリアントが追加されるとエラー
  throw new Error(`Unsupported: ${String(result)}`);
}
```

### 禁止事項

| 禁止 | 代替 |
|---|---|
| `any` 型 | `unknown` + 型ガード、ジェネリクス |
| 非 null アサーション `!` | 明示的な null チェック、`?.` / `??` |
| パラメータへの再代入 | 新しい変数を作成 |
| static メンバーのみのクラス | シンプルな named export |

### 必須事項

- すべての関数に**明示的な返り値の型**を指定する
- Props・配列・返り値に `readonly` を積極的に使用する
- 型のみの import には `type` キーワードを使用する
- パス解決には `@/` エイリアスを使用する

---

## 命名規則

| 対象 | 規則 |
|---|---|
| 型名・コンポーネント | PascalCase |
| 関数名 | camelCase |
| 定数（マップ等） | UPPER_SNAKE_CASE |

## 基本設定

- インデント: 2スペース
- セミコロン: 必須
- クォート: ダブルクォート推奨
