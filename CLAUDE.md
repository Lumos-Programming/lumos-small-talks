# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリを操作する際のガイダンスを提供します。

## プロジェクト概要

Lumos Small Talks は、毎週月曜日 21:00 の Lightning Talk (LT) プログラム管理アプリケーションです。Next.js 16 で構築されています。

- **フロントエンド**: React 19, Next.js App Router, TailwindCSS
- **バックエンド**: Next.js Server Actions, Firebase Admin SDK
- **データベース**: Firestore (weeks コレクションに talks 配列を埋め込み)
- **認証**: NextAuth v5 + Discord OAuth (ギルドメンバーシップ検証)
- **テスト**: Vitest + Firebase Emulator

## コマンド

### 前提条件

- [aqua](https://aquaproj.github.io/) — `just` などの CLI ツールをインストール
- Java — Firestore エミュレータの実行に必要

```bash
aqua install         # CLI ツールのインストール (just など)
pnpm install         # Node.js パッケージのインストール
```

### 開発 (just 経由)

```bash
just dev            # 開発サーバー + Firestore エミュレータを起動（推奨）
just test           # Firestore エミュレータでテストを実行
just lint           # ESLint 実行
just format         # Prettier でコード整形
just format-check   # コード整形のチェック
just build          # プロダクションビルド
```

`just dev` は Firestore エミュレータ (ポート 8080, UI はポート 4000) と Next.js (ポート 3000) を起動します。

### pnpm コマンド (直接実行)

```bash
pnpm dev            # Next.js のみ起動（FIRESTORE_EMULATOR_HOST の設定に従う）
pnpm build          # プロダクションビルド（version.json にコミット SHA とビルド日時を生成）
pnpm start          # プロダクションサーバー起動
```

## アーキテクチャ

### データモデル

**非正規化 Firestore 構造**を使用し、各週のドキュメントに talks 配列を埋め込んでいます。

```
weeks/{weekId}
  ├─ weekString: "2026-W09"
  ├─ eventStartTime: "21:00"
  └─ talks: [
       {
         id: uuid,
         title: string,
         description: string (markdown),
         presenterUid: string,
         presenterName: string,
         presenterAvatar: string,
         order: number,
         createdAt: Timestamp
       }
     ]
```

Week ID は ISO 週形式: `YYYY-Www`（例: `2026-W09`）。`lib/utils.ts` の `getWeekId()` が date-fns を使って生成します。

### コアデータ操作 (lib/firebase.ts)

すべての CRUD 操作は**Firestore トランザクション**を使用して競合状態を防止します:

- `getWeekData(weekId)`: 週のドキュメントを取得。存在しない場合は空の構造を返す
- `addTalk(weekId, talkData, userId)`: 配列に発表を追加し、order を自動付与
- `updateTalk(weekId, talkId, updates, userId)`: 所有権チェック付きで発表を更新
- `deleteTalk(weekId, talkId, userId)`: 所有権チェック付きで発表を削除

**重要**: すべての変更操作は `presenterUid === userId` を検証して所有権を確認します。

**Firebase 初期化**:

- **ローカル開発（デフォルト）**: `FIRESTORE_EMULATOR_HOST` 経由で Firestore エミュレータを使用（`just dev` で自動起動）
- **本番 Firestore（任意）**: サービスアカウントキー (`FIREBASE_PRIVATE_KEY` + `FIREBASE_CLIENT_EMAIL`) を使用 — `.env` の `FIRESTORE_EMULATOR_HOST` をコメントアウト
- **Cloud Run/GCE**: `FIREBASE_PRIVATE_KEY` 未設定時は Application Default Credentials (ADC) を自動使用

### 認証フロー (lib/auth.ts)

NextAuth は Discord プロバイダーとカスタムコールバックで構成:

1. Discord OAuth でサインイン（スコープ: `identify` + `guilds`）
2. `signIn` コールバックが Discord API でギルドメンバーシップを取得
3. `DISCORD_GUILD_ID` のメンバーのみアクセスを許可
4. `session` コールバックがユーザー ID をセッションに追加（所有権チェック用）

必要な環境変数:

- `AUTH_SECRET`, `AUTH_DISCORD_ID`, `AUTH_DISCORD_SECRET`
- `DISCORD_GUILD_ID`（未設定時はギルドチェックをスキップ）
- `FIREBASE_PROJECT_ID`（常に必要）
- `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`（ローカルで本番 Firestore に接続する場合のみ; Cloud Run では不要）

### ページ構成

**公開ページ (`app/page.tsx`)**:

- 指定された週のすべての発表を表示（`order` 順）
- 認証不要
- `?week=2026-W09` クエリパラメータで週を切り替え
- `getWeekData()` によるサーバーサイドレンダリング

**投稿/管理ページ (`app/submit/page.tsx`)**:

- Discord 認証が必要
- 選択した週のユーザー自身の発表のみ表示
- Server Actions による追加/更新/削除
- 変更後に `revalidatePath()` で `/submit` と `/` を更新

**パターン**: 両ページは `WeekNavigator` コンポーネントで週ナビゲーションを行います。

### コンポーネント構成

- **LTCard**: 個別の発表を表示（react-markdown + remark-gfm でMarkdown対応）
  - `isOwner={true}` の場合のみ編集/削除ボタンを表示
- **SubmitForm**: 新規作成と編集モードを処理
  - タイトル + Markdown 説明のフォーム
  - `editingTalk` prop でモード切替
- **ManageTalks**: ユーザーの発表一覧 + 投稿フォームのコンテナ
  - `editingTalk` 状態でインライン編集を管理
- **WeekNavigator**: `getRelativeWeekId()` を使った前後の週ナビゲーション

### UI コンポーネント (`components/ui/index.tsx`)

shadcn スタイルのコンポーネントを一括エクスポート:

- Badge, Button, Card (CardHeader, CardTitle, CardContent)
- Input, Textarea
- すべて `class-variance-authority` でバリアント管理

クラス名のマージには `lib/utils.ts` の `cn()` ユーティリティを使用。

## テスト戦略

テストは `lib/firebase.test.ts` にあり、以下を使用:

- Firebase Rules Unit Testing SDK (`@firebase/rules-unit-testing`)
- Firestore エミュレータ（`vitest.config.ts` のセットアップで自動起動）
- テスト分離: 各テストでエミュレータのデータをクリア

テスト作成時:

1. `initializeTestEnvironment()` でテスト用 Firestore を初期化
2. `testEnv.authenticatedContext(userId)` で認証をシミュレーション
3. トランザクション動作をテスト（並行追加、所有権チェック）

## デプロイ

**Google Cloud Run** へのデプロイ用に設計されています:

1. Firestore をネイティブモードで有効化
2. `Cloud Datastore User` ロールを持つサービスアカウントを作成
3. Cloud Run に環境変数を設定
4. Docker イメージをビルドしてデプロイ

詳細な gcloud コマンドは README.md を参照。

## 主要な規約

- **Week ID**: 常に `lib/utils.ts` の `getWeekId()` または `getRelativeWeekId(offset)` を使用
- **所有権**: `lib/firebase.ts` のすべての変更操作で `presenterUid` チェックを実施
- **再検証**: データ変更後は `revalidatePath('/submit')` と `revalidatePath('/')` を呼び出す
- **Markdown**: 発表の説明は react-markdown で GitHub Flavored Markdown をサポート
- **トランザクション**: 配列の変更は常に Firestore トランザクションを使用して競合状態を防止
