# 開発プロセス詳細ガイド

このドキュメントは、開発の全ステップを具体的なコマンド・操作レベルまで分解したものです。

---

## Phase 0: Kiro で仕様を固める

### Step 0-1: Kiroでプロジェクトを開く

1. Kiroを起動する
2. プロジェクトのフォルダを開く
3. Spec Modeに切り替える

### Step 0-2: Requirements（何を作るか）を生成する

1. Kiroのチャットに自然言語でアイデアを入力する
   ```
   例：「新生活で遠方に行った人が、自分の地元を紹介できる名刺アプリを作りたい。
   体験型の質問に答えると、AIが地元の感性を言語化して名刺カードを生成する。」
   ```
2. Kiroが `.kiro/specs/xxx/requirements.md` を生成する
3. 生成された内容を2人で読む
4. 修正したい点があればKiroに伝える
   ```
   例：「ユーザーストーリーにシェア機能も追加して」
   ```
5. 2人とも納得したら次へ進む

### Step 0-3: Design（どう作るか）を生成する

1. Requirementsが確定した状態で、Kiroに設計を依頼する
2. Kiroが `.kiro/specs/xxx/design.md` を生成する
   - 技術スタック
   - 画面構成
   - データフロー
   - API設計
3. 生成された内容を2人で読む
4. 修正したい点があればKiroに伝える
5. 2人とも納得したら次へ進む

### Step 0-4: Tasks（作業リスト）を生成する

1. Designが確定した状態で、Kiroにタスク分解を依頼する
2. Kiroが `.kiro/specs/xxx/tasks.md` を生成する
3. 生成された内容を2人で読む
4. 各タスクに担当を決める
   ```
   例：
   - [自分] プロジェクト初期セットアップ
   - [自分] 質問画面 - スライダーUI
   - [相方] 結果カード画面 - レイアウト
   - [相方] 結果カード画面 - シェアボタン
   ```
5. 担当割り振りが決まったら次へ進む

---

## Phase 1: GitHub リポジトリとIssueの準備

### Step 1-1: GitHubリポジトリを作成する

1. GitHubにログインする
2. 右上の「+」→「New repository」をクリック
3. 以下を入力する
   - Repository name: プロジェクト名（例：`jimoto-meishi`）
   - Description: 地元紹介名刺アプリ
   - Public を選択
   - Add a README file にチェック
   - Add .gitignore → Node を選択（技術スタックに応じて変更）
4. 「Create repository」をクリック

### Step 1-2: リポジトリをローカルにクローンする

```bash
# 自分のPC
git clone https://github.com/ユーザー名/jimoto-meishi.git
cd jimoto-meishi
```

### Step 1-3: 相方をコラボレーターに追加する

1. GitHubのリポジトリページを開く
2. Settings → Collaborators → 「Add people」
3. 相方のGitHubユーザー名を入力して招待
4. 相方がメールまたはGitHub通知から招待を承諾

### Step 1-4: 相方がリポジトリをクローンする

```bash
# 相方のPC
git clone https://github.com/ユーザー名/jimoto-meishi.git
cd jimoto-meishi
```

### Step 1-5: ラベルを作成する

```bash
# Claude Codeまたはターミナルで実行
gh label create "画面:質問" --color "1d76db" --description "質問画面に関するIssue"
gh label create "画面:結果" --color "0e8a16" --description "結果画面に関するIssue"
gh label create "共通" --color "e4e669" --description "共通部品・設定"
gh label create "優先:高" --color "d93f0b" --description "先にやるべき"
gh label create "優先:低" --color "c2e0c6" --description "余裕があれば"
```

### Step 1-6: Claude CodeでIssueを一括作成する

1. Claude Codeを開く
2. 以下のように指示する
   ```
   「tasks.mdの内容をもとに、GitHub Issueを作成してください。
   各Issueには以下を含めてください：
   - 概要（なぜやるか）
   - やること（チェックリスト形式）
   - 完了条件
   - 担当者
   - 相方担当のIssueにはヒント欄を追加
   ラベルも適切に付けてください。」
   ```
3. Claude Codeが `gh issue create` コマンドでIssueを作成する
4. GitHubのIssuesタブを開いて、2人で内容を確認する
5. 修正が必要なIssueはGitHub上で直接編集する

### Step 1-7: 2人でIssueを確認する

1. GitHubのIssuesタブを開く
2. 一覧で全Issueを確認する
3. 確認ポイント：
   - 自分の担当Issueの内容が明確か
   - 相方の担当Issueにヒントが十分にあるか
   - 優先順位（ラベル）が正しいか
   - 依存関係（先にやらないといけないIssue）が明確か
4. 問題なければ開発開始

---

## Phase 2: 初期セットアップ（自分が担当）

### Step 2-1: プロジェクトを初期化する

1. Claude Codeに指示する
   ```
   「Next.js（またはKiroのdesign.mdで決めた技術スタック）で
   プロジェクトを初期化してください。」
   ```
2. 生成されたファイルを確認する

### Step 2-2: ディレクトリ構造を作る

```bash
# Claude Codeに指示するか、手動で作成
mkdir -p src/components/questions   # 自分の担当
mkdir -p src/components/results     # 相方の担当
mkdir -p src/components/common      # 共通部品
```

### Step 2-3: CLAUDE.mdを作成する

1. プロジェクトルートに `CLAUDE.md` を作成する
2. 内容（Kiroのdesign.mdをもとに記載）：
   ```markdown
   # CLAUDE.md

   ## プロジェクト概要
   地元紹介名刺アプリ（ハッカソン）

   ## 技術スタック
   （design.mdの内容を転記）

   ## ディレクトリルール
   - src/components/questions/ → 自分の担当
   - src/components/results/  → 相方の担当
   - src/components/common/   → 自分が管理

   ## コミットルール
   - Conventional Commits形式（feat/fix/style）
   - 日本語OK

   ## 触ってはいけないファイル
   - 相手の担当ディレクトリは直接編集しない
   ```

### Step 2-4: デザイントークンを定義する（2人で）

1. 一緒に配色を決める（Coolors等を使う）
2. `src/components/common/theme.ts` に定義する
   ```typescript
   // 例
   export const colors = {
     primary: '#xxxx',
     secondary: '#xxxx',
     background: '#xxxx',
   }
   export const fonts = {
     main: 'Noto Sans JP',
   }
   ```

### Step 2-5: 画面間のデータ形式を決める（2人で）

1. 質問画面 → 結果画面に渡すデータのJSON構造を決める
   ```json
   {
     "name": "たくみ",
     "hometown": "大阪",
     "answers": {
       "distance": 5,
       "evening_time": 18,
       "taste_strength": 3,
       "morning_sound": "birds",
       "sky_color": "#87CEEB"
     }
   }
   ```
2. このJSONの構造を `src/types/index.ts` 等に型定義する

### Step 2-6: 初期セットアップをコミット・pushする

```bash
git add .
git commit -m "feat: プロジェクト初期セットアップ"
git push origin main
```

### Step 2-7: 相方がpullして最新を取り込む

```bash
# 相方のPC
cd jimoto-meishi
git pull origin main
```

---

## Phase 3: 開発サイクル（Issue単位で繰り返す）

以下のステップを、各Issueごとに繰り返す。

### Step 3-1: 担当Issueを確認する

1. GitHubのIssuesタブを開く
2. 自分に割り当てられた「優先:高」のIssueを選ぶ
3. 「やること」リストを読んで、何をするか把握する

### Step 3-2: ブランチを作成する

```bash
# mainが最新であることを確認
git checkout main
git pull origin main

# Issueに対応するブランチを作成
git checkout -b feature/#3-result-card-layout
```

命名規則：`feature/#Issue番号-短い説明`

### Step 3-3: Draft PRを即座に作成する

```bash
# まずブランチをpush
git push -u origin feature/#3-result-card-layout

# Draft PRを作成
gh pr create --draft \
  --title "feat: 結果カード - レイアウト作成" \
  --body "Closes #3

## やること
- [ ] カードのレイアウト
- [ ] 背景色・フォントの適用
- [ ] レスポンシブ対応"
```

### Step 3-4: 開発する

1. Claude Code（またはKiro）で実装する
   ```
   例：「Issue #3の内容に従って、結果カードのレイアウトを作成してください。
   src/components/results/ 配下に作ってください。
   デザイントークンは src/components/common/theme.ts を使ってください。」
   ```
2. 生成されたコードを確認する
3. ブラウザで動作確認する

### Step 3-5: こまめにコミットする

```bash
# 変更したファイルを確認
git status

# ファイルを指定してステージング
git add src/components/results/ResultCard.tsx

# 論理単位でコミット
git commit -m "feat: 結果カードの基本レイアウト作成"
```

1つの作業が区切れるたびにコミットする。まとめない。

### Step 3-6: pushする

```bash
git push
```

Draft PRに自動的に反映される。

### Step 3-7: Step 3-4〜3-6を繰り返す

Issueの「やること」リストが全部終わるまで繰り返す。

```bash
# 2つ目の作業
git add src/components/results/ResultCard.tsx
git commit -m "style: カードの背景色とフォントを適用"
git push

# 3つ目の作業
git add src/components/results/ResultCard.tsx
git commit -m "style: スマホ幅でのレスポンシブ対応"
git push
```

---

## Phase 4: 説明し合い

### Step 4-1: 説明タイムを始める

1. 2人で集まる（対面 or 画面共有）
2. GitHubのDraft PRを開く

### Step 4-2: 自分の画面を相方に説明する

1. PRの「Files changed」タブを開く
2. 変更したファイルを上から順に説明する
3. 説明のテンプレート：
   ```
   「このファイルは○○をするためのもので、
   ここで△△をやっていて、
   ここのデータが□□に渡される。
   ここはAIに任せたけど、こういう仕組みで動いてる。」
   ```
4. 相方からの質問に答える

### Step 4-3: 相方の画面を聞く

1. 相方のDraft PRの「Files changed」を開く
2. 相方に説明してもらう
3. 質問する・フィードバックする
   ```
   「ここの色、デザイントークンの値を使った方がいいかも」
   「この部分いい感じだね」
   「ここはこう変えた方が使いやすいかも」
   ```
4. **「わからない部分」が出たら一緒に調べる** → これが一番の学び

### Step 4-4: 修正点があれば対応する

1. フィードバックをもとに修正する
2. 修正をコミット・pushする
   ```bash
   git add 修正したファイル
   git commit -m "fix: レビューで指摘された配色を修正"
   git push
   ```

---

## Phase 5: マージ（2人で一緒にやる）

### Step 5-1: PRをReadyにする

```bash
# 自分のPR
gh pr ready

# 相方のPR
# 相方が実行：gh pr ready
```

### Step 5-2: 先にマージする方を決める

```
ルール：依存関係が少ない方を先にマージする

例：
  自分の質問画面 → 相方の結果画面にデータを渡す
  → 自分を先にマージした方が安全
```

### Step 5-3: 1つ目のPRをマージする

1. GitHubでPRを開く
2. 「Squash and merge」を選択する（ドロップダウンで切り替え）
3. マージコミットのメッセージを確認する
4. 「Confirm squash and merge」をクリック
5. 「Delete branch」をクリック（使い終わったブランチを削除）

### Step 5-4: 2人ともローカルを更新する

```bash
# 自分のPC
git checkout main
git pull origin main

# 相方のPC
git checkout main
git pull origin main
```

### Step 5-5: 2つ目のPRにmainを取り込む

```bash
# まだマージしていない方のブランチで
git checkout feature/#3-result-card-layout
git merge main
```

#### コンフリクトが起きた場合

1. `git status` でコンフリクトファイルを確認する
2. ファイルを開く。以下のような表示がある：
   ```
   <<<<<<< HEAD
   自分の変更
   =======
   mainから取り込まれた変更
   >>>>>>> main
   ```
3. 2人で相談して、正しい方（または両方を統合した内容）に書き換える
4. `<<<<<<<` `=======` `>>>>>>>` の行を削除する
5. 保存してコミットする
   ```bash
   git add コンフリクトを解決したファイル
   git commit -m "merge: mainの変更を取り込み"
   git push
   ```

#### コンフリクトが起きなかった場合

```bash
git push
```

### Step 5-6: 2つ目のPRをマージする

1. Step 5-3と同じ手順でマージする

### Step 5-7: 動作確認する

```bash
# 2人ともmainを最新にする
git checkout main
git pull origin main

# アプリを起動して動作確認
npm run dev  # （技術スタックに応じて変更）
```

1. 質問画面 → 結果画面の遷移が正しく動くか
2. デザインが崩れていないか
3. エラーが出ていないか

---

## Phase 6: 次のIssueへ

### Step 6-1: 完了したIssueを閉じる

PRのマージ時に `Closes #番号` を書いていれば自動で閉じられる。
閉じられていない場合はGitHub上で手動で閉じる。

### Step 6-2: 次のIssueを選ぶ

1. GitHubのIssuesタブを開く
2. 残っているIssueの中から次にやるものを選ぶ
3. 依存関係を確認する（先にやるべきIssueが残っていないか）

### Step 6-3: Phase 3に戻る

Phase 3〜6 を全Issueが完了するまで繰り返す。

---

## 困ったときの対処法

### 「今どのブランチにいるかわからない」

```bash
git branch
# * がついているのが今いるブランチ
```

### 「変な変更をしてしまった、元に戻したい」

```bash
# まだコミットしていない場合
git checkout -- ファイル名

# コミットしてしまった場合 → 相手に相談してから対処
```

### 「pushできない」

```bash
# リモートに新しい変更がある可能性
git pull origin 今いるブランチ名
# その後もう一度push
git push
```

### 「なんかおかしくなった」

```bash
# まず状態を確認
git status
git log --oneline -5

# それでもわからなければ
# → Claude Codeに「git statusの結果がこうなんだけど、どうすればいい？」と聞く
# → または相方に相談する
```

### 「相方が作業中にエラーで詰まった」

1. 相方の画面を一緒に見る
2. エラーメッセージを読む
3. Claude Codeにエラーメッセージを貼り付けて聞く
4. 解決したら、なぜエラーが起きたかを一緒に理解する
