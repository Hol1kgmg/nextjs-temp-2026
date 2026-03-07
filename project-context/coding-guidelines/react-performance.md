# React / Next.js パフォーマンスガイドライン

Vercel Engineering が提供する React/Next.js パフォーマンス最適化ルール集を参照する。

**ルール一覧・詳細**: `.claude/skills/vercel-react-best-practices/`

```
.claude/skills/vercel-react-best-practices/
├── SKILL.md      # カテゴリ別ルール一覧・クイックリファレンス
├── AGENTS.md     # 全ルールの詳細（AI エージェント向けコンパイル版）
└── rules/        # ルールごとの個別ファイル（57ルール）
```

## カテゴリ概要

| 優先度 | カテゴリ | インパクト |
|---|---|---|
| 1 | Eliminating Waterfalls | CRITICAL |
| 2 | Bundle Size Optimization | CRITICAL |
| 3 | Server-Side Performance | HIGH |
| 4 | Client-Side Data Fetching | MEDIUM-HIGH |
| 5 | Re-render Optimization | MEDIUM |
| 6 | Rendering Performance | MEDIUM |
| 7 | JavaScript Performance | LOW-MEDIUM |
| 8 | Advanced Patterns | LOW |

詳細は [`SKILL.md`](../../.claude/skills/vercel-react-best-practices/SKILL.md) を参照。
