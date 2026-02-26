# CLAUDE.md

## プロジェクト概要

「人生でやりたいこと100共有サイト」- ユーザーが「人生でやりたいこと」のリストを作成・管理し、他のユーザーと共有できるWebアプリケーション。

## 技術スタック

- **フレームワーク:** Next.js 16 (App Router, Turbopack) + TypeScript + React 19
- **スタイリング:** Tailwind CSS 4
- **データベース:** Supabase (PostgreSQL)
- **認証:** Supabase Auth (メール + パスワード)
- **ストレージ:** Supabase Storage (画像保存)
- **ホスティング:** Vercel (GitHub連携の自動デプロイ)
- **構成:** フロントエンド・バックエンド単一プロジェクト (モノリシック)

## プロジェクト構造

```
app/
  layout.tsx               # ルートレイアウト (Header + ToastProvider + Footer)
  page.tsx                 # ホーム (ログイン時: フィード, 未ログイン: ランディング)
  page-client.tsx          # ホーム Client Component (検索バー + タブ切替)
  page-queries.ts          # ホーム用クエリ (フォロー中フィード, みつける)
  globals.css              # グローバルCSS (Tailwind + カスタムプロパティ)
  login/page.tsx           # ログイン
  register/page.tsx        # 新規登録
  auth/callback/route.ts   # 認証コールバック
  my-list/
    page.tsx               # マイダッシュボード (Server Component)
    client.tsx             # マイダッシュボード (Client Component - 統計表示)
    actions.ts             # Server Actions (アイテム CRUD)
    queries.ts             # データ取得 (リスト・いいね)
  search/
    page.tsx               # 検索 (Server Component)
    client.tsx             # 検索 (Client Component)
    queries.ts             # 検索クエリ (ユーザー・アイテム)
  likes/actions.ts         # いいね Server Actions
  follows/actions.ts       # フォロー Server Actions
  notifications/
    page.tsx               # 通知 (Server Component)
    client.tsx             # 通知 (Client Component)
    actions.ts             # 通知 Server Actions (既読マーク)
    queries.ts             # 通知データ取得
  profile/[userId]/
    page.tsx               # プロフィール (Server Component - データ取得)
    client.tsx             # プロフィール (Client Component - アイテム管理統合)
  settings/profile/page.tsx  # プロフィール編集 (保存後にプロフィールへ遷移)
components/
  header.tsx               # 共通ヘッダー
  item-list.tsx            # アイテム一覧 (いいねボタン含む)
  item-form.tsx            # アイテム追加/編集フォーム (画像アップロード含む)
  image-upload.tsx         # 画像アップロード
  like-button.tsx          # いいねボタン
  follow-button.tsx        # フォローボタン
  toast.tsx                # トースト通知 (ToastProvider + useToast)
  confirm-dialog.tsx       # 確認ダイアログ
lib/supabase/
  client.ts                # ブラウザ用 Supabase クライアント
  server.ts                # サーバー用 Supabase クライアント
types/
  database.ts              # Supabase DB 型定義
middleware.ts              # 認証ミドルウェア
supabase/migrations/       # SQL マイグレーション
docs/
  requirements.md          # 要件定義書
```

## 開発コマンド

```bash
npm run dev          # 開発サーバー起動 (Turbopack)
npm run build        # プロダクションビルド
npm run start        # プロダクションサーバー起動
npm run lint         # ESLint 実行
```

## 環境変数

`.env.local` に設定 (テンプレート: `env.local.example`):

```
NEXT_PUBLIC_SUPABASE_URL=<Supabase プロジェクト URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Supabase Anon Key>
SUPABASE_SERVICE_ROLE_KEY=<Supabase Service Role Key (サーバーサイド専用)>
```

## データモデル

- **users** - プロフィール情報 (id, username, icon_url, bio, created_at, updated_at)
- **lists** - リスト (id, user_id, is_public, created_at, updated_at)
- **items** - やりたいこと (id, list_id, title, description, is_completed, completed_at, priority, image_url, order, created_at, updated_at)
- **likes** - いいね (id, user_id, item_id, created_at)
- **follows** - フォロー関係 (id, follower_id, followee_id, created_at)
- **notifications** - 通知 (id, user_id, type, related_user_id, related_item_id, is_read, created_at)

## 実装済み機能

### MVP

1. ユーザー登録・ログイン (メール + パスワード)
2. リストの作成・編集
3. アイテムの追加・編集・削除 (画像アップロード含む)
4. リストの公開/非公開設定
5. プロフィールページ

### 追加機能

1. 検索機能 (ユーザー名・キーワード)
2. いいね/リアクション機能
3. フォロー/アンフォロー機能
4. サイト内通知 (フォロー・いいね時に通知、未読バッジ)

### UXリニューアル

1. ホーム画面: ログイン時はフォロー中フィード + みつけるタブ + 検索バー統合
2. マイリスト → マイダッシュボード: 達成率・統計・最近のアクティビティを表示
3. プロフィールにアイテム管理を統合: 自分のプロフィールからアイテムの追加・編集・削除が可能
4. プロフィール編集後はプロフィールページへ自動遷移
5. デザイン統一: rounded-xl カード, tracking-tight 見出し, グラデーションアバター

## コーディング規約

- 言語: TypeScript (strict mode)
- コンポーネント: React 関数コンポーネント
- データ取得: Supabase Client SDK / Server Actions
- Supabase クライアント: ブラウザ → `lib/supabase/client.ts`, サーバー → `lib/supabase/server.ts`
- セキュリティ: Supabase RLS (Row Level Security) を必ず設定
- `.env` / 認証情報をコミットしない
- **Git:** 適切な単位でコミットを作成する (機能追加・設定変更などの論理的なまとまりごと)

## 重要な参考ドキュメント

- 要件定義書: `docs/requirements.md`
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Vercel: https://vercel.com/docs
