# Lumos Small Talks

毎週月曜日 21:00 開始の LT プログラム管理アプリ。

## デプロイ手順 (Google Cloud Run)

### 1. Google Cloud プロジェクトの準備

- Firestore を Native Mode で有効化。
- サービスアカウントを作成し、`Cloud Datastore User` 権限を付与。

### 2. 環境変数の設定

`.env.example` を参考に、Secret Manager または Cloud Run の環境変数に以下を設定：

- `AUTH_SECRET`, `AUTH_DISCORD_ID`, `AUTH_DISCORD_SECRET`
- `DISCORD_GUILD_ID` (対象のサーバーID)
- `FIREBASE_PROJECT_ID`

### 3. デプロイ実行

Docker を使用して Artifact Registry にプッシュし、Cloud Run にデプロイします。

```bash
# イメージのビルドとプッシュ (gcloud builds を使用する場合)
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/lumos-lt

# Cloud Run へのデプロイ
gcloud run deploy lumos-lt \
  --image gcr.io/YOUR_PROJECT_ID/lumos-lt \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars="DISCORD_GUILD_ID=...,AUTH_SECRET=..."
```

## ローカル開発とテスト

```bash
pnpm install
# テスト (Javaが必要)
pnpm test
# 開発サーバー
pnpm dev
```
