# Development Roadmap

## リードの作業フロー

### 1タスクの流れ

```bash
# 1. Issueを確認する
#    → GitHub Issue を開く
#    → 「ブロック」欄の前提Issueがcloseされているか確認

# 2. ブランチを切る
git pull
git checkout -b feature/#3-type-definitions

# 3. Claude Code で実装
/kiro:spec-impl jimoto-meishi-app 2.1
#   → spec-impl が design.md の型定義・インターフェースを読んで実装してくれる
#   → 完了したら動作確認

# 4. push して merge
git add .
git commit -m "feat: Issue #3 名刺データの型定義を追加"
git push -u origin feature/#3-type-definitions
gh pr create --title "Issue #3: 型定義" --body "closes #3"
gh pr merge --merge
git checkout main
git pull

# 5. 相方に「pull して」と声をかける（型定義など共有ファイルを変えた場合）
```

### Issue を進める順番

```
#1 プロジェクト初期設定
 ↓
#2 サーバー設定（#1と並行可）
 ↓
#3 型定義                          ← ここで相方に「pull して #7 始めて」と声をかける
 ↓
#4 Encoder  ┐
#5 比較     ├ 3つ並行可
#6 AI API   ┘                      ← ここで相方に「pull して #8 始めて」と声をかける
 ↓
#13 Socket.IOサーバー ┐
#14 bump検知フック    ┘ 並行可
 ↓
#15 Socket.IOクライアント
 ↓
#16 ぶつけ交換画面
 ↓
#17 交換演出
 ↓
#18 全体統合（相方の全タスク完了を待つ）
 ↓
#20 E2Eテスト
```

### 相方への声かけタイミング

| 自分が完了したもの | 相方に伝えること |
|-------------------|-----------------|
| #1 プロジェクト初期設定 | 「pull して。npm install して npm run dev で動くよ」 |
| #3 型定義 | 「pull して。src/types/ に型が入ったから #7 始めて」 |
| #6 AI API | 「pull して。API動くようになったから #8 始めて」 |
| #4 MeishiEncoder | 「pull して。#10, #11 で使う encoder が入ったよ」 |
| #5 比較ロジック | 「pull して。#12 で使う比較関数が入ったよ」 |

### 困ったときの判断

| 状況 | どうする |
|------|---------|
| spec-impl が変なコードを生成した | design.md の該当箇所を読み直して、手動で修正 |
| 相方が詰まっている | 自分のタスクを一旦止めて横について5分サポート |
| テストが通らない | まず動く状態を優先。テストは後で直す |
| 予定より遅れている | Should機能（#13〜#17）を後回しにしてMust機能の統合を優先 |

---

## 相方のgit操作（これだけでOK）

```bash
# 1. 作業前に毎回やる
git pull

# 2. AIと一緒にコードを書く

# 3. 書き終わったら保存してpush
git add .
git commit -m "Issue #7: 出身地選択画面を作成"
git push
```

- ブランチを切る必要はない（mainに直接push）
- 作業前の `git pull` は絶対忘れない（リードの変更を取り込むため）
- 担当外のファイルを触らなければコンフリクトは起きない

---

## 作業順序と担当

### Phase 0: 基盤セットアップ

| 順番 | Issue | タスク | 担当 | ブロック |
|------|-------|--------|------|---------|
| 1 | [#1](https://github.com/kotani-takumi0/kansai_beginers_vol7/issues/1) | プロジェクト初期設定 | リード | なし |
| 2 | [#2](https://github.com/kotani-takumi0/kansai_beginers_vol7/issues/2) | サーバー設定 | リード | なし（#1と並行可） |

### Phase 1: データモデル・API

| 順番 | Issue | タスク | 担当 | ブロック |
|------|-------|--------|------|---------|
| 3 | [#3](https://github.com/kotani-takumi0/kansai_beginers_vol7/issues/3) | 型定義 | リード | #1 完了後 |
| 4 | [#4](https://github.com/kotani-takumi0/kansai_beginers_vol7/issues/4) | MeishiEncoder | リード | #3 完了後 |
| 4 | [#5](https://github.com/kotani-takumi0/kansai_beginers_vol7/issues/5) | 比較ロジック | リード | #3 完了後（#4と並行可） |
| 4 | [#6](https://github.com/kotani-takumi0/kansai_beginers_vol7/issues/6) | AI議論ネタ生成API | リード | #2, #3 完了後（#4,#5と並行可） |

### Phase 2: コア機能

ここからリードと相方が並行して動く。

**リード:**

| 順番 | Issue | タスク | 担当 | ブロック |
|------|-------|--------|------|---------|
| 5 | [#13](https://github.com/kotani-takumi0/kansai_beginers_vol7/issues/13) | Socket.IOサーバー | リード | #2, #3 完了後 |
| 5 | [#14](https://github.com/kotani-takumi0/kansai_beginers_vol7/issues/14) | bump検知フック | リード | #1 完了後（#13と並行可） |
| 6 | [#15](https://github.com/kotani-takumi0/kansai_beginers_vol7/issues/15) | Socket.IOクライアント | リード | #13 完了後 |

**相方:**

| 順番 | Issue | タスク | 担当 | ブロック |
|------|-------|--------|------|---------|
| 5 | [#7](https://github.com/kotani-takumi0/kansai_beginers_vol7/issues/7) | 出身地選択画面 | 相方 | #1 完了後 |
| 6 | [#8](https://github.com/kotani-takumi0/kansai_beginers_vol7/issues/8) | ネタ生成・立場選択画面 | 相方 | #6（AI API）完了後 |
| 7 | [#9](https://github.com/kotani-takumi0/kansai_beginers_vol7/issues/9) | 名刺カード・プレビュー | 相方 | #8 完了後 |

### Phase 3: 交換・共有

**リード:**

| 順番 | Issue | タスク | 担当 | ブロック |
|------|-------|--------|------|---------|
| 7 | [#16](https://github.com/kotani-takumi0/kansai_beginers_vol7/issues/16) | ぶつけ交換画面 | リード | #14, #15 完了後 |
| 8 | [#17](https://github.com/kotani-takumi0/kansai_beginers_vol7/issues/17) | 交換演出 | リード | #16 完了後 |

**相方:**

| 順番 | Issue | タスク | 担当 | ブロック |
|------|-------|--------|------|---------|
| 8 | [#10](https://github.com/kotani-takumi0/kansai_beginers_vol7/issues/10) | 共有画面（QR/URL） | 相方 | #4, #9 完了後 |
| 8 | [#11](https://github.com/kotani-takumi0/kansai_beginers_vol7/issues/11) | 受信画面 | 相方 | #4, #9 完了後（#10と並行可） |

### Phase 4: 比較・統合

| 順番 | Issue | タスク | 担当 | ブロック |
|------|-------|--------|------|---------|
| 9 | [#12](https://github.com/kotani-takumi0/kansai_beginers_vol7/issues/12) | 比較表示画面 | 相方 | #5, #9 完了後 |
| 9 | [#18](https://github.com/kotani-takumi0/kansai_beginers_vol7/issues/18) | 全体統合 | リード | 全機能完了後 |

### Phase 5: 仕上げ

| 順番 | Issue | タスク | 担当 | ブロック |
|------|-------|--------|------|---------|
| 10 | [#19](https://github.com/kotani-takumi0/kansai_beginers_vol7/issues/19) | モバイルUI最適化 | 相方 | 全機能完了後 |
| 10 | [#20](https://github.com/kotani-takumi0/kansai_beginers_vol7/issues/20) | E2Eテスト | リード | #18, #19 完了後 |

---

## 担当まとめ

**リード（13件）:** #1, #2, #3, #4, #5, #6, #13, #14, #15, #16, #17, #18, #20

**相方（7件）:** #7, #8, #9, #10, #11, #12, #19

---

## クリティカルパス

全体の進行を左右する最長経路：

```
#1 → #3 → #6 → #8 → #9 → #10 → #12 → #18
```

この流れのどこかが遅れると全体が遅れる。特に：
- **#3 型定義** — ほぼ全タスクが依存
- **#6 AI API** — 相方の #8 がブロックされる
- **#9 名刺カード** — 共有・比較の両方がブロックされる

## 依存関係図

```
#1 プロジェクト初期設定 ──┬── #3 型定義 ──┬── #4 Encoder ──────── #10 共有画面
#2 サーバー設定 ─────────┤              ├── #5 比較ロジック ──── #12 比較表示
                          │              └── #6 AI API ────────── #8 ネタ生成画面
                          │                                        ↓
                          │                  #7 出身地選択        #9 名刺カード ─┬─ #10
                          │                                                      ├─ #11 受信画面
                          │                                                      └─ #12
                          │
                          ├── #13 Socket.IOサーバー ── #15 クライアント ── #16 交換画面 ── #17 演出
                          └── #14 bump検知フック ──────────────────────────┘
                                                                                    ↓
                                                                 #18 全体統合 ── #19 モバイル最適化
                                                                                 ↓
                                                                              #20 E2E
```
