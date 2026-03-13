# Research & Design Decisions

---
**Purpose**: ディスカバリーフェーズの調査結果と設計判断の根拠を記録する。
---

## Summary
- **Feature**: `jimoto-meishi-app`
- **Discovery Scope**: New Feature（グリーンフィールド）
- **Key Findings**:
  - DeviceMotion APIはHTTPS必須かつユーザー許可が必要。iOS SafariではDeviceMotionEvent.requestPermission()が必須
  - React + Vite + TypeScriptがSPA構築の2026年標準スタック。Socket.IOがWebSocket通信の最適解
  - Motion（旧Framer Motion）v12.xがカード交換演出に適した宣言的アニメーションライブラリ

## Research Log

### DeviceMotion API — ぶつけ検知
- **Context**: スマホをぶつけて名刺交換するコア体験の技術的実現性
- **Sources Consulted**: [MDN DeviceMotionEvent](https://developer.mozilla.org/en-US/docs/Web/API/DeviceMotionEvent), [MDN devicemotion event](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicemotion_event)
- **Findings**:
  - `DeviceMotionEvent`で加速度（acceleration）と重力込み加速度（accelerationIncludingGravity）を取得可能
  - iOS 13+では`DeviceMotionEvent.requestPermission()`でユーザー許可が必要（ユーザージェスチャー起点）
  - HTTPS必須（セキュアコンテキストのみ）
  - 加速度の合成値が閾値を超えた場合に「ぶつけた」と判定する方式が適切
  - Generic Sensor API（Accelerometer）も存在するがブラウザサポートが限定的
- **Implications**: DeviceMotion APIを使用。iOS向けにpermission requestフローが必要。非対応デバイスにはURL/QRフォールバック

### WebSocket通信 — リアルタイムマッチング
- **Context**: 同タイミングにぶつけた2台をマッチングする通信基盤
- **Sources Consulted**: [Socket.IO](https://socket.io/), [ws library](https://github.com/websockets/ws)
- **Findings**:
  - Socket.IOはイベントベース通信、自動再接続、ルーム管理を内蔵。バンドルサイズ10.4KB(gzip)
  - ws/µWebSocketsはより軽量だが、ルーム管理やフォールバック機能を自前実装する必要あり
  - ハッカソン開発速度を考慮するとSocket.IOが最適
  - マッチングロジック: 「交換待機ルーム」にjoinし、一定時間窓内にbumpイベントを送信した2クライアントをペアリング
- **Implications**: Socket.IO採用。Express + Socket.IOで軽量WebSocketサーバーを構築

### フロントエンドスタック
- **Context**: TypeScript SPAフレームワーク選定
- **Sources Consulted**: [Vite for React SPA](https://dev.to/tak089/vite-for-react-spa-3do9), [Vite vs Next.js 2026](https://designrevision.com/blog/vite-vs-nextjs)
- **Findings**:
  - React + Vite + TypeScriptが2026年のSPA標準構成
  - SSR不要（SEO不要のハッカソン作品）のためNext.jsは過剰
  - ViteのHMRで高速開発サイクル
  - React Router v7でクライアントサイドルーティング
- **Implications**: React 19 + Vite 6 + TypeScript strict mode

### アニメーションライブラリ
- **Context**: ポケモン交換的な交換演出の実現
- **Sources Consulted**: [Motion](https://motion.dev/), [Motion Layout Animations](https://motion.dev/docs/react-layout-animations)
- **Findings**:
  - Motion（旧Framer Motion）v12.xが最新。宣言的API
  - `layoutId`でコンポーネント間の共有要素アニメーション可能
  - `AnimatePresence`で退出アニメーション
  - カードフリップ、スライドイン等の演出が容易
- **Implications**: Motion v12採用。交換演出のカード飛来・通信中のドキドキ演出に使用

### QRコード生成
- **Context**: 名刺共有のためのQRコード表示
- **Sources Consulted**: [qrcode.react npm](https://www.npmjs.com/package/qrcode.react)
- **Findings**:
  - qrcode.react v4.2.0。SVG/Canvas両方サポート
  - サイズ・色・ロゴ埋め込みカスタマイズ可能
  - npm上で1200+プロジェクトが使用する安定ライブラリ
- **Implications**: qrcode.react採用。名刺共有URLのQRコード表示に使用

### AI API — 議論ネタ生成
- **Context**: 出身地から地域特有の議論ネタを自動生成
- **Sources Consulted**: [Claude API Docs](https://platform.claude.com/docs/en/api/supported-regions)
- **Findings**:
  - Claude API（Anthropic）は日本からアクセス可能
  - claude-haiku-4-5がコスト効率と速度のバランスが良い
  - プロンプトで「出身地を入力として、その地域特有の議論ネタを生成」を指示
  - ハッカソンではAPIキーをサーバーサイドで管理し、フロントからは自前APIを経由
- **Implications**: Claude Haiku 4.5をバックエンドAPI経由で使用。APIキーはサーバー環境変数で管理

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| SPA + 軽量APIサーバー | React SPA + Express APIサーバー | シンプル、ハッカソン向き、2人で分担容易 | サーバー管理が必要 | 採用 |
| フルサーバーレス | Cloudflare Workers等 | サーバー不要 | WebSocket対応が複雑、デプロイ設定の学習コスト | 不採用 |
| Next.js SSR | フルスタックフレームワーク | 一体型 | SPA用途には過剰、WebSocket統合が煩雑 | 不採用 |

## Design Decisions

### Decision: フロントエンドフレームワーク
- **Context**: TypeScript SPAの構築基盤
- **Alternatives Considered**:
  1. React + Vite — 軽量SPA標準
  2. Next.js — SSR/SSG対応フルスタック
  3. Vue + Vite — 学習コスト低
- **Selected Approach**: React + Vite
- **Rationale**: SSR不要。Reactのエコシステム（Motion、qrcode.react等）が充実。2人チームでの生産性
- **Trade-offs**: Reactの学習曲線はVueより高いが、アニメーションライブラリの選択肢が豊富
- **Follow-up**: React 19の安定性を確認

### Decision: リアルタイム通信
- **Context**: ぶつけマッチングの同期通信
- **Alternatives Considered**:
  1. Socket.IO — 高機能WebSocketラッパー
  2. ws — 軽量WebSocket
  3. WebRTC — P2P通信
- **Selected Approach**: Socket.IO
- **Rationale**: ルーム管理・自動再接続が内蔵。開発速度重視
- **Trade-offs**: wsより重いがハッカソン規模では問題なし
- **Follow-up**: サーバーデプロイ先の選定（Render/Railway等）

### Decision: AI API
- **Context**: 議論ネタ生成エンジン
- **Alternatives Considered**:
  1. Claude API (Haiku 4.5) — 高速・低コスト
  2. OpenAI GPT-4o-mini — 汎用
  3. 固定データセット — API不要
- **Selected Approach**: Claude Haiku 4.5
- **Rationale**: 日本語の品質が高い。Haiku 4.5はコスト効率と応答速度が良好
- **Trade-offs**: API依存（オフライン不可）。固定データセットならAPI不要だが、ネタの多様性が失われる
- **Follow-up**: プロンプト設計とレスポンス形式の決定

### Decision: データ永続化なし
- **Context**: MVP範囲でDB不要と明記
- **Selected Approach**: URLパラメータ + インメモリ（サーバー）
- **Rationale**: 名刺データはURL内にエンコード（Base64等）。交換セッションはサーバーのインメモリで管理
- **Trade-offs**: サーバー再起動で交換セッションは消失するが、名刺自体はURL内に保存されるため問題なし

## Risks & Mitigations
- **DeviceMotion API非対応デバイス** — URL/QR交換へのフォールバックで対応
- **iOS Safari許可ダイアログ** — ユーザーに分かりやすい許可取得UIフローを設計
- **WebSocketサーバーの可用性** — ハッカソン規模では問題ないが、デモ時の安定性を事前テスト
- **AI APIレート制限** — Haiku 4.5は高スループット。ハッカソン規模では問題なし
- **名刺データサイズ** — URLエンコード可能なサイズに制限。議論ネタ数を制限（3-5個）

## References
- [MDN DeviceMotionEvent](https://developer.mozilla.org/en-US/docs/Web/API/DeviceMotionEvent)
- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [Motion (Framer Motion)](https://motion.dev/)
- [qrcode.react](https://www.npmjs.com/package/qrcode.react)
- [Vite](https://vite.dev/)
- [React](https://react.dev/)
