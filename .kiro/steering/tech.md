# Technology Stack

## Architecture

Webブラウザだけで完結するSPA。ネイティブアプリ不要。
ハッカソン向けのため、ログイン/アカウント機能・DB永続化は意図的に省略。

## Core Technologies

- **Language**: TypeScript
- **Framework**: 未決定（Spec Designフェーズで確定）
- **Runtime**: Node.js

## Key Libraries（候補）

- DeviceMotion API — 加速度センサーでぶつける動作を検知
- WebSocket — 同タイミングで動作検知された2台をマッチング
- AI API（未決定）— 出身地から議論ネタを生成

## Development Standards

### Type Safety
- TypeScript strict mode
- 画面間のデータ受け渡しは型定義で管理

### Code Quality
- Conventional Commits形式（feat/fix/style）
- 日本語コミットメッセージOK

## Development Environment

### Common Commands
```bash
# Dev: npm run dev（予定）
# Build: npm run build（予定）
```

## Key Technical Decisions

| 決定事項 | 選択 | 理由 |
|---------|------|------|
| ネイティブアプリ | 不採用 | Webで全機能実現可能 |
| ログイン/アカウント | 不採用 | 技術点にならない、時間を使うべきでない |
| DB永続化 | 不採用 | MVP範囲外 |
| スマホぶつけ交換 | DeviceMotion + WebSocket | 技術的挑戦としてインパクト大 |

## MVP Priority

| 優先度 | 機能 | 必要技術 |
|--------|------|---------|
| Must (Day 1) | 名刺生成 + URL/QR共有 + 比較表示 | AI API, 基本UI |
| Should (Day 2) | ぶつけて交換 + 交換演出 | DeviceMotion, WebSocket, Animation |
| Could | デザインカスタマイズ, 交換履歴 | ローカルストレージ |

---
_Document standards and patterns, not every dependency_
