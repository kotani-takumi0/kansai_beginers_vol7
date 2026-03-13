# Project Structure

## Organization Philosophy

画面単位の分担開発。2人が同じファイルを触らないことでコンフリクトを防止する。
各メンバーが担当ディレクトリを持ち、共通部品はリードが管理する。

## Directory Patterns

```
src/
├── types/                    # 共有型定義（リード管理）
├── components/
│   ├── common/               # 共通部品（リード管理）
│   └── MeishiCard.tsx        # 名刺カードコンポーネント
├── pages/
│   ├── PrefectureSelectPage.tsx   # 相方担当
│   ├── TopicGenerationPage.tsx    # 相方担当
│   ├── StanceSelectPage.tsx       # 相方担当
│   ├── SharePage.tsx              # 相方担当
│   ├── ReceivePage.tsx            # 相方担当
│   ├── ComparisonPage.tsx         # 相方担当
│   ├── ExchangePage.tsx           # リード担当
│   └── ExchangeAnimation.tsx      # リード担当
├── hooks/
│   ├── useBumpDetection.ts        # リード担当
│   └── useExchangeSocket.ts       # リード担当
├── utils/
│   ├── meishiEncoder.ts           # リード担当
│   └── comparison.ts              # リード担当
└── App.tsx                        # ルーティング定義（リード管理）

server/
├── index.ts                       # Expressサーバー（リード担当）
├── routes/
│   └── generateTopics.ts          # AI API（リード担当）
└── socket/
    └── exchangeHandler.ts         # Socket.IOマッチング（リード担当）
```

## 担当別ファイルマップ

### リード担当（触っていいファイル）
- `src/types/` — 全型定義
- `src/components/common/` — 共通部品
- `src/hooks/` — カスタムフック
- `src/utils/` — ユーティリティ
- `src/pages/ExchangePage.tsx` — 交換画面
- `src/pages/ExchangeAnimation.tsx` — 交換演出
- `src/App.tsx` — ルーティング
- `server/` — サーバー全般

### 相方担当（触っていいファイル）
- `src/pages/PrefectureSelectPage.tsx` — 出身地選択
- `src/pages/TopicGenerationPage.tsx` — ネタ生成・立場選択
- `src/pages/StanceSelectPage.tsx` — 立場選択
- `src/components/MeishiCard.tsx` — 名刺カード
- `src/pages/SharePage.tsx` — 共有画面
- `src/pages/ReceivePage.tsx` — 名刺受信画面
- `src/pages/ComparisonPage.tsx` — 比較表示

## Naming Conventions

- **Files**: PascalCase（コンポーネント・ページ）、camelCase（ユーティリティ・フック）
- **Components**: PascalCase（例: MeishiCard, ComparisonPage）
- **ブランチ**: `feature/#Issue番号-短い説明`（例: `feature/#7-prefecture-select`）

## Code Organization Principles

- **同じファイルを同時に編集しない** — 最大のコンフリクト防止策
- `common/` や `types/` の変更はリードが実施 → 相方はpullで取り込む
- Issue単位でブランチを切る（1ブランチ = 1つの小さな機能）
- コミットは論理単位で分割（AIで一気に生成してもコミットは分ける）

---
_Document patterns, not file trees. New files following patterns shouldn't require updates_
