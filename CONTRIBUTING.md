# コントリビューションガイド

## 前提条件

- **Node.js** (v20+)
- **pnpm** — パッケージマネージャ
- **Java** — Firestore エミュレータの実行に必要
- **[aqua](https://aquaproj.github.io/)** — CLI バージョンマネージャ（`just` を自動インストール）

## セットアップ

### 1. CLI ツールのインストール

```bash
# aqua が未インストールの場合は公式ドキュメントを参照:
# https://aquaproj.github.io/docs/install

# プロジェクトで使用する CLI ツール (just など) をインストール
aqua install
```

### 2. 依存パッケージのインストール

```bash
pnpm install
```

### 3. 環境変数の設定

```bash
cp .env.example .env
```

`.env` を編集し、以下の値を設定してください:

| 変数名 | 説明 |
|---|---|
| `AUTH_SECRET` | `openssl rand -hex 32` で生成 |
| `AUTH_DISCORD_ID` | Discord Developer Portal → OAuth2 → Client ID |
| `AUTH_DISCORD_SECRET` | Discord Developer Portal → OAuth2 → Client Secret |
| `DISCORD_GUILD_ID` | ユーザーが所属すべき Discord サーバーの ID |
| `FIREBASE_PROJECT_ID` | Firebase / GCP プロジェクト ID |

> **補足**: ローカル開発では Firestore エミュレータを使用するため、`FIREBASE_CLIENT_EMAIL` と `FIREBASE_PRIVATE_KEY` は**不要**です。

### 4. 開発サーバーの起動

```bash
just dev
```

このコマンドで以下が起動します:
- **Firestore エミュレータ** — `localhost:8080`（エミュレータ UI: `localhost:4000`）
- **Next.js 開発サーバー** — `localhost:3000`

エミュレータのデータは**揮発性**です。サーバーを停止するとリセットされます。

## 利用可能なコマンド

`just` を実行するとすべてのレシピを確認できます:

| コマンド | 説明 |
|---|---|
| `just dev` | 開発サーバー + Firestore エミュレータを起動 |
| `just test` | Firestore エミュレータでテストを実行 |
| `just lint` | ESLint によるコード検査 |
| `just format` | Prettier によるコード整形 |
| `just format-check` | コード整形のチェック |
| `just build` | プロダクションビルド |

## 本番 Firestore への接続（上級者向け）

本番データを使用して開発する場合:

1. `.env` の `FIRESTORE_EMULATOR_HOST` をコメントアウト
2. `FIREBASE_CLIENT_EMAIL` と `FIREBASE_PRIVATE_KEY` にサービスアカウントの情報を設定
3. `pnpm dev` を直接実行（`just dev` ではなく）
