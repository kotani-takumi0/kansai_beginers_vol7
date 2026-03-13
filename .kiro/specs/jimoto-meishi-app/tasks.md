# Implementation Plan

> **進捗管理について**
> - このファイルは設計書（読み取り専用）です。チェックボックスは更新しません
> - 進捗管理は [GitHub Issues](https://github.com/kotani-takumi0/kansai_beginers_vol7/issues) の open/close で行います
> - Issue番号との対応: タスク X.Y → Issue は下表を参照

| タスク | Issue | 担当 |
|--------|-------|------|
| 1.1 プロジェクト初期設定 | [#1](https://github.com/kotani-takumi0/kansai_beginers_vol7/issues/1) | リード |
| 1.2 サーバー設定 | [#2](https://github.com/kotani-takumi0/kansai_beginers_vol7/issues/2) | リード |
| 2.1 型定義 | [#3](https://github.com/kotani-takumi0/kansai_beginers_vol7/issues/3) | リード |
| 2.2 Encoder | [#4](https://github.com/kotani-takumi0/kansai_beginers_vol7/issues/4) | リード |
| 2.3 比較ロジック | [#5](https://github.com/kotani-takumi0/kansai_beginers_vol7/issues/5) | リード |
| 3.1 AI API | [#6](https://github.com/kotani-takumi0/kansai_beginers_vol7/issues/6) | リード |
| 4.1 出身地選択 | [#7](https://github.com/kotani-takumi0/kansai_beginers_vol7/issues/7) | 相方 |
| 4.2 ネタ生成画面 | [#8](https://github.com/kotani-takumi0/kansai_beginers_vol7/issues/8) | 相方 |
| 4.3 名刺カード | [#9](https://github.com/kotani-takumi0/kansai_beginers_vol7/issues/9) | 相方 |
| 5.1 共有画面 | [#10](https://github.com/kotani-takumi0/kansai_beginers_vol7/issues/10) | 相方 |
| 5.2 受信画面 | [#11](https://github.com/kotani-takumi0/kansai_beginers_vol7/issues/11) | 相方 |
| 6.1 比較表示 | [#12](https://github.com/kotani-takumi0/kansai_beginers_vol7/issues/12) | 相方 |
| 7.1 Socket.IOサーバー | [#13](https://github.com/kotani-takumi0/kansai_beginers_vol7/issues/13) | リード |
| 7.2 bump検知フック | [#14](https://github.com/kotani-takumi0/kansai_beginers_vol7/issues/14) | リード |
| 7.3 Socket.IOクライアント | [#15](https://github.com/kotani-takumi0/kansai_beginers_vol7/issues/15) | リード |
| 8.1 交換画面 | [#16](https://github.com/kotani-takumi0/kansai_beginers_vol7/issues/16) | リード |
| 8.2 交換演出 | [#17](https://github.com/kotani-takumi0/kansai_beginers_vol7/issues/17) | リード |
| 9.1 全体統合 | [#18](https://github.com/kotani-takumi0/kansai_beginers_vol7/issues/18) | リード |
| 9.2 モバイル最適化 | [#19](https://github.com/kotani-takumi0/kansai_beginers_vol7/issues/19) | 相方 |
| 9.3 E2Eテスト | [#20](https://github.com/kotani-takumi0/kansai_beginers_vol7/issues/20) | リード |

---

- [ ] 1. プロジェクト初期セットアップ
- [ ] 1.1 React + Vite + TypeScript プロジェクトの作成と基本設定
  - Vite でReact + TypeScript のプロジェクトを作成する
  - TypeScript strict mode を有効にする
  - Tailwind CSS を導入しモバイルファーストのベース設定を行う
  - React Router を導入しページルーティングの骨格を作る（トップ、ネタ生成、立場選択、名刺プレビュー、共有、交換、比較の各ページ）
  - 共通レイアウトコンポーネント（ヘッダー・ページコンテナ）を作成する
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 1.2 (P) サーバー側プロジェクトの作成と基本設定
  - Express サーバーを作成し、TypeScript で設定する
  - CORS 設定とJSON パースミドルウェアを追加する
  - 環境変数の読み込み設定（ANTHROPIC_API_KEY 等）を行う
  - 開発用の同時起動スクリプト（クライアント + サーバー）を設定する
  - _Requirements: 2.1_

- [ ] 2. 共通データモデルとユーティリティ
- [ ] 2.1 (P) 名刺データの型定義と共有モデルの作成
  - 名刺データ、議論ネタ、立場選択、比較結果の型をデザインに基づいて定義する
  - フロントエンドとバックエンドで共有できる形で配置する
  - _Requirements: 3.3, 7.1_

- [ ] 2.2 (P) 名刺データのURLエンコード・デコード機能の作成
  - 名刺データをBase64 でURLセーフにエンコードする機能を作る
  - エンコードされた文字列から名刺データを復元するデコード機能を作る
  - 名刺データを含む共有用URLを生成する機能を作る
  - エンコード→デコードの可逆性を検証するユニットテストを書く
  - _Requirements: 4.1_

- [ ] 2.3 (P) 2人の名刺を比較して一致・不一致を判定するロジックの作成
  - 同じカテゴリのネタで立場が一致するかを判定する比較ロジックを実装する
  - 一致数・不一致数のサマリーを算出する機能を作る
  - 各ネタごとの比較結果を返す機能を作る
  - 比較ロジックのユニットテストを書く（完全一致、完全不一致、混合パターン）
  - _Requirements: 7.2, 7.3, 7.4_

- [ ] 3. AI議論ネタ生成APIの構築
- [ ] 3.1 AI議論ネタ生成エンドポイントの実装
  - Claude Haiku 4.5 APIを使って、出身地から3〜5個の議論ネタを生成するAPIエンドポイントを作る
  - プロンプトを設計する：「その地域の人が普通だと思っているが、他地域の人には議論になるネタ」をJSON形式で返すよう指示
  - 都道府県名のバリデーションを行い、無効な入力には400エラーを返す
  - AI API障害時のエラーハンドリング（500エラー、再試行案内）を実装する
  - レスポンスがデザインで定義したTopic型に準拠していることを検証する
  - APIエンドポイントの統合テストを書く（Claude APIはモックで代替）
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 4. 名刺作成フロー（フロントエンド）
- [ ] 4.1 出身地選択画面の作成
  - 47都道府県を選択できるUIを作成する（地方別グループ分け等、選びやすい配置にする）
  - 都道府県を選択して確定すると次の画面（ネタ生成）に進めるようにする
  - モバイル画面に最適化されたレイアウトにする
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 4.2 ネタ生成・表示画面の作成
  - 出身地確定後にAI APIを呼び出して議論ネタを取得し、一覧表示する
  - API呼出中はローディング状態（スケルトンやスピナー）を表示する
  - API失敗時はエラーメッセージと再試行ボタンを表示する
  - 各ネタに対して「同意する」「同意しない」の立場選択UIを表示する
  - すべてのネタの立場を選択すると名刺プレビューへ進めるようにする
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2_

- [ ] 4.3 名刺カードコンポーネントと名刺プレビュー画面の作成
  - 出身地、議論ネタ、ユーザーの立場をカード形式で表示する名刺コンポーネントを作成する
  - 名刺完成後のプレビュー画面を作成し、共有と交換への導線を配置する
  - 名刺デザインをモバイル画面で映えるビジュアルに仕上げる
  - _Requirements: 3.2, 3.3_

- [ ] 5. 名刺共有機能（URL/QR）
- [ ] 5.1 共有画面の作成（QRコード表示とURL共有）
  - 名刺完成後に共有ボタンを押すとQRコードと共有URLを表示する画面を作成する
  - qrcode.react を使ってQRコードをSVGで描画する
  - 共有URLをクリップボードにコピーする機能を追加する
  - Web Share API対応端末ではネイティブ共有メニューも利用可能にする
  - _Requirements: 4.1, 4.2_

- [ ] 5.2 共有URLからの名刺受信・作成誘導画面の作成
  - 共有URLにアクセスすると、送信者の名刺を表示する画面を作成する
  - URLパラメータから名刺データをデコードして表示する
  - 「自分の名刺も作る」ボタンで名刺作成フローへ誘導する
  - 名刺作成完了後に比較画面へ遷移する導線を作る
  - _Requirements: 4.3_

- [ ] 6. 比較表示画面
- [ ] 6.1 2人の名刺を並べて比較表示する画面の作成
  - 自分と相手の名刺を横並び（モバイルでは縦並び）で表示する
  - 同じネタで同じ立場を選んだ項目を「一致」として色やアイコンでハイライトする
  - 異なる立場の項目を「不一致」として別の色でハイライトする
  - 一致数/不一致数のサマリーを画面上部に表示する
  - 一致/不一致それぞれに会話を促すメッセージ（「お前もそうなん！」「え、マジで！？」等）を添える
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 7. WebSocketサーバーとぶつけ交換基盤
- [ ] 7.1 Socket.IOによる交換マッチングサーバーの構築
  - Express サーバーにSocket.IO を統合する
  - 交換待機ルームへの参加・離脱イベントを実装する
  - bumpイベントを受信し、3秒以内のタイムスタンプ差で2クライアントをマッチングするロジックを実装する
  - マッチング成立時に両クライアントへ相手の名刺データを送信する
  - タイムアウト時にクライアントへ通知する処理を実装する
  - マッチングロジックの統合テストを書く（2クライアント同時bump → matchedイベント発火）
  - _Requirements: 5.2, 5.3, 5.5_

- [ ] 7.2 (P) DeviceMotion APIによるぶつけ検知フックの作成
  - DeviceMotion APIで加速度を監視し、合成値が閾値を超えたらbump判定するカスタムフックを作成する
  - iOS SafariのDeviceMotionEvent.requestPermission()に対応する許可取得フローを実装する
  - デバウンス処理（500ms）で連続検知を防止する
  - DeviceMotion API非対応デバイスを判定し、非対応フラグを返す
  - _Requirements: 5.2, 5.4_

- [ ] 7.3 Socket.IOクライアント接続管理フックの作成
  - Socket.IOクライアントの接続・切断を管理するカスタムフックを作成する
  - 交換ルームへの参加、bumpイベント送信、ルーム離脱の操作を提供する
  - マッチング成立時に相手の名刺データを受け取る状態管理を実装する
  - 接続状態（接続中・待機中・マッチ済み）を管理する
  - _Requirements: 5.2, 5.3_

- [ ] 8. ぶつけ交換画面と交換演出
- [ ] 8.1 ぶつけ交換画面の作成
  - 交換待機画面を作成し、「スマホをぶつけてください」という案内を表示する
  - DeviceMotion許可取得UIフローを組み込む（ボタン押下 → 許可ダイアログ）
  - bump検知フックとSocket.IOフックを統合し、ぶつけ→マッチングの一連の動作を接続する
  - DeviceMotion非対応時にURL/QR交換へのフォールバック案内を表示する
  - タイムアウト時の再試行UI・URL/QR交換への切り替えUIを実装する
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 8.2 交換演出（ポケモン交換的アニメーション）の作成
  - Motion ライブラリを使って、ぶつけた瞬間の画面反応演出（画面フラッシュ・振動API呼出）を作成する
  - 通信中の「間」を演出するアニメーション（ドキドキ感のあるローディング演出）を作成する
  - 相手の名刺が画面に飛んでくる到着演出を作成する
  - 3段階の演出をシーケンスとして途切れなく連結する
  - 演出完了後に比較表示画面へ自動遷移する
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 9. 全体統合とモバイル最適化
- [ ] 9.1 全画面フローの結合とルーティング最終調整
  - 名刺作成 → 共有/交換選択 → 交換 → 比較の一連のフローが途切れなく動作することを確認する
  - URL/QR共有からの流入フロー（名刺受信 → 自分の名刺作成 → 比較）が正しく動作することを確認する
  - ページ間の状態受け渡しが正しく行われていることを検証する
  - _Requirements: 8.1, 8.2, 8.3_

- [ ] 9.2 モバイルUIの最終調整とレスポンシブ対応
  - 全画面がスマートフォンのブラウザで正しく表示されることを確認する
  - タッチ操作に最適化されたボタンサイズ・余白を調整する
  - 横向き表示や小さい画面サイズでのレイアウト崩れを修正する
  - _Requirements: 8.4_

- [ ] 9.3 E2Eテスト
  - 名刺作成フロー全体のE2Eテストを書く（都道府県選択 → ネタ生成 → 立場選択 → 名刺完成）
  - URL/QR共有フローのE2Eテストを書く（共有URL生成 → 別タブアクセス → 名刺表示）
  - 比較表示のE2Eテストを書く（2つの名刺データで一致/不一致ハイライトを確認）
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 7.1, 7.2, 7.3, 7.4_
