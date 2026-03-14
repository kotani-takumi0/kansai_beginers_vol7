# 技術スタック

## 概要

| カテゴリ | 技術 | バージョン |
|---------|------|-----------|
| 言語 | TypeScript | ~5.9.3 |
| ランタイム | Node.js | v20.20.0 |
| パッケージ管理 | npm | - |
| モジュール形式 | ESM (`"type": "module"`) | - |

## フロントエンド

| カテゴリ | 技術 | バージョン | 用途 |
|---------|------|-----------|------|
| UIライブラリ | React | ^19.2.4 | コンポーネントベースUI構築 |
| ルーティング | React Router DOM | ^7.13.1 | SPA画面遷移 |
| ビルドツール | Vite | ^8.0.0 | 開発サーバー・本番ビルド |
| Viteプラグイン | @vitejs/plugin-react | ^6.0.0 | React Fast Refresh・JSX変換 |
| CSSフレームワーク | Tailwind CSS | ^4.2.1 | ユーティリティファーストCSS |
| CSS処理 | PostCSS | ^8.5.8 | Tailwind CSS統合 |

### TypeScript設定（フロントエンド）

- **ターゲット**: ES2023
- **JSX**: react-jsx
- **strict mode**: 有効
- **モジュール解決**: bundler

## バックエンド

| カテゴリ | 技術 | バージョン | 用途 |
|---------|------|-----------|------|
| Webフレームワーク | Express | ^5.2.1 | REST APIサーバー |
| CORS | cors | ^2.8.6 | クロスオリジン許可 |
| 環境変数 | dotenv | ^17.3.1 | `.env`ファイル読み込み |
| TSランナー | tsx | ^4.21.0 | TypeScript直接実行・ホットリロード |

### サーバー構成

- ポート: `3001`（環境変数 `PORT` で変更可能）
- エンドポイント: `/api/health`（ヘルスチェック）

## 開発ツール

| カテゴリ | 技術 | バージョン | 用途 |
|---------|------|-----------|------|
| リンター | ESLint | ^9.39.4 | コード品質チェック |
| ESLint設定 | @eslint/js | ^9.39.4 | 基本ルール |
| | typescript-eslint | ^8.56.1 | TypeScript用ルール |
| | eslint-plugin-react-hooks | ^7.0.1 | Hooks ルール |
| | eslint-plugin-react-refresh | ^0.5.2 | Fast Refresh対応チェック |
| 同時実行 | concurrently | ^9.2.1 | クライアント/サーバー同時起動 |

## npm scripts

| コマンド | 説明 |
|---------|------|
| `npm run dev` | クライアント(Vite) + サーバー(tsx)を同時起動 |
| `npm run dev:client` | Vite開発サーバーのみ起動 |
| `npm run dev:server` | Expressサーバーのみ起動（ホットリロード付き） |
| `npm run build` | TypeScriptコンパイル + Viteビルド |
| `npm run lint` | ESLintによるコードチェック |
| `npm run preview` | ビルド済みアプリのプレビュー |

## 今後導入予定の技術

| 技術 | 用途 |
|------|------|
| DeviceMotion API | スマホの加速度センサーで「ぶつける」動作を検知 |
| WebSocket (Socket.IO) | 2台のスマホ間でリアルタイム名刺交換 |
| AI API（未定） | 出身地から議論ネタを自動生成 |

## アーキテクチャ

```
┌─────────────────────────────────┐
│  ブラウザ (SPA)                   │
│  React + React Router + Tailwind │
│  Vite (dev server / bundler)     │
└──────────┬──────────────────────┘
           │ HTTP (REST API)
           │ WebSocket (予定)
┌──────────▼──────────────────────┐
│  Express サーバー (Node.js)       │
│  - REST API                      │
│  - AI API連携 (予定)              │
│  - Socket.IO マッチング (予定)     │
└─────────────────────────────────┘
```

next.jsの中でReactを使っている
