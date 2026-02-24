# 要件定義書: 人生でやりたいこと100共有サイト

## プロジェクト概要

ユーザーが「人生でやりたいこと」のリストを作成・管理し、他のユーザーと共有できるWebアプリケーション。

## 技術スタック

### フロントエンド・バックエンド
- Next.js（App Router）
- TypeScript
- React

参考: https://nextjs.org/docs

### データベース
- Supabase（PostgreSQL）

参考: https://supabase.com/docs

### 認証
- Supabase Auth

参考: https://supabase.com/docs/guides/auth

### ストレージ
- Supabase Storage（画像保存）

参考: https://supabase.com/docs/guides/storage

### ホスティング
- Vercel

参考: https://vercel.com/docs

### 構成の特徴
- フロントエンドとバックエンドが単一プロジェクトで完結
- GitHubと連携した自動デプロイ
- 型定義の共有が容易
- 学習コストが低く、Claude Codeでの開発に適した構造

## コスト試算

### MVP段階（個人プロジェクト）
- **月額: $0**
- Vercel Hobby: $0（出典: https://vercel.com/pricing）
- Supabase Free: $0（出典: https://supabase.com/pricing）

### 本格運用段階（商用利用）
- **月額: $45/月**
- Vercel Pro: $20/月（出典: https://vercel.com/pricing）
- Supabase Pro: $25/月（出典: https://supabase.com/pricing）

## リリース計画

### MVP（最初のリリース）

以下の核となる機能のみを実装する。

#### 必須機能
- ユーザー登録・ログイン（メールアドレス + パスワード）
- リストの作成・編集・削除
- アイテムの追加・編集・削除
- リストの公開/非公開設定
- プロフィールページ

### 将来追加予定の機能

- ソーシャルログイン（Google、GitHubなど）
- フォロー機能
- いいね/リアクション機能
- 検索機能
- サイト内通知
- メール通知
- 統計情報（達成率など）

## 機能要件

### 1. ユーザー認証機能

#### 1.1 ユーザー登録
- メールアドレスとパスワードでの登録
- Supabase Authを使用
- メールアドレスの検証

参考: https://supabase.com/docs/guides/auth/auth-email

#### 1.2 ログイン/ログアウト
- メールアドレスとパスワードでのログイン
- Supabase Authのセッション管理
- ログアウト機能

#### 1.3 将来実装予定
- ソーシャルログイン（Google、GitHub等）

参考: https://supabase.com/docs/guides/auth/social-login

### 2. プロフィール機能

#### 2.1 基本情報（MVP）
- ユーザー名
- アイコン画像
- 自己紹介文

#### 2.2 将来追加予定
- フォロー数/フォロワー数
- 達成率統計
- 登録日

### 3. リスト管理機能

#### 3.1 リストの基本操作（MVP）
- リストの作成
- リストの編集
- リストの削除
- 1ユーザーにつき1つのリスト（推測）

#### 3.2 リストの公開設定（MVP）
- 公開/非公開の選択
  - 公開: 全てのユーザーが閲覧可能
  - 非公開: 本人のみ閲覧可能

#### 3.3 将来追加予定
- 友人のみ公開（限定公開）
- 公開アカウント/非公開アカウント設定
  - 公開アカウント: 一方的なフォローで閲覧可能
  - 非公開アカウント: フォロー承認制

### 4. アイテム管理機能（MVP）

#### 4.1 アイテムの基本情報
各「やりたいこと」は以下の情報を持つ:

- **テキスト**（必須）
  - やりたいことの内容
  
- **達成状態**（必須）
  - 未達成/達成済み
  
- **画像**（任意）
  - 達成時の写真など
  - 保存先: Supabase Storage
  
- **メモ/詳細説明**（任意）
  - 補足情報や詳細
  
- **達成日**（任意）
  - 達成した日付
  
- **カテゴリ/タグ**（任意）
  - 分類用のタグ
  
- **優先度**（任意）
  - 重要度の設定

参考: https://supabase.com/docs/guides/storage

#### 4.2 アイテムの操作
- アイテムの追加
- アイテムの編集
- アイテムの削除
- アイテム数の制限: なし（100個は目安）

### 5. フォロー機能（将来実装）

#### 5.1 フォローの仕組み
- **公開アカウント**: 一方的なフォロー可能
- **非公開アカウント**: フォロー申請・承認制

#### 5.2 機能詳細
- フォローボタン
- フォロー解除
- フォロー申請の承認/拒否（非公開アカウント）
- フォローリスト表示
- フォロワーリスト表示

### 6. いいね/リアクション機能（将来実装）

- 他のユーザーのリストやアイテムにいいね/リアクション
- いいね数の表示
- いいねしたユーザーの一覧（推測）

### 7. 検索機能（将来実装）

#### 7.1 検索方法
複数の検索方法に対応:

- **ユーザー名検索**
  - ユーザー名での検索
  
- **カテゴリ/タグ検索**
  - タグでのフィルタリング
  
- **キーワード検索**
  - やりたいことの内容を検索対象に含む

#### 7.2 検索結果
- 公開されているリストのみ表示
- フォロー状態による絞り込み（推測）

### 8. 通知機能（将来実装）

#### 8.1 サイト内通知（優先実装）
以下のイベントで通知:
- フォローされた時
- いいね/リアクションされた時
- フォロー申請があった時（非公開アカウント）

#### 8.2 メール通知（将来追加）
- サイト内通知と同じイベントでメール送信

### 9. 統計情報機能（将来実装）

#### 9.1 プロフィールページでの表示
- 総アイテム数
- 達成済みアイテム数
- 達成率（パーセンテージ）
- カテゴリ別の統計（推測）

## 非機能要件

### セキュリティ
- パスワードのハッシュ化: Supabase Authが自動処理
- HTTPS通信: Vercelが自動提供
- SQLインジェクション対策: Supabaseのクライアントライブラリが提供
- XSS対策: Next.jsが基本的な対策を提供（推測）
- CSRF対策: Next.jsが基本的な対策を提供（推測）

参考: 
- https://supabase.com/docs/guides/auth/server-side/overview
- https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations

### パフォーマンス
- 具体的な要件は未定

### 可用性
- Vercel: 99.99% SLA（Enterprise、推測）
- Supabase: 具体的なSLAは不明

### スケーラビリティ
- Vercelの自動スケーリング機能
- Supabaseのマネージドサービス

## データモデル

Supabase（PostgreSQL）で管理するテーブル構造

参考: https://supabase.com/docs/guides/database/overview

### users（ユーザー）
Supabase Authが管理する `auth.users` テーブルとは別に、プロフィール情報用のテーブルを作成（推測）

- id（UUID、auth.usersと連携）
- username（ユーザー名）
- icon_url（アイコン画像URL）
- bio（自己紹介）
- is_public（公開/非公開アカウント、将来実装）
- created_at
- updated_at

### lists（リスト）
- id（UUID）
- user_id（UUID、外部キー: users.id）
- is_public（公開/非公開）
- created_at
- updated_at

### items（アイテム）
- id（UUID）
- list_id（UUID、外部キー: lists.id）
- title（テキスト）
- description（メモ/詳細説明）
- is_completed（達成状態）
- completed_at（達成日）
- priority（優先度）
- image_url（画像URL、Supabase Storageへのパス）
- order（表示順、推測）
- created_at
- updated_at

### tags（タグ、将来実装）
- id（UUID）
- name
- created_at

### item_tags（アイテムとタグの中間テーブル、将来実装）
- item_id（UUID、外部キー: items.id）
- tag_id（UUID、外部キー: tags.id）

### follows（フォロー関係、将来実装）
- id（UUID）
- follower_id（UUID、フォローする側のユーザーID）
- followee_id（UUID、フォローされる側のユーザーID）
- status（pending/accepted、非公開アカウント用）
- created_at

### likes（いいね、将来実装）
- id（UUID）
- user_id（UUID、外部キー: users.id）
- item_id（UUID、外部キー: items.id）
- created_at

### notifications（通知、将来実装）
- id（UUID）
- user_id（UUID、通知を受け取るユーザー）
- type（通知タイプ: follow, like, follow_request等）
- related_user_id（UUID、通知の発生元ユーザー）
- related_item_id（UUID、関連アイテム、任意）
- is_read（既読/未読）
- created_at

参考: https://supabase.com/docs/guides/database/tables

## インフラ構成

### 構成図
```
[ユーザー]
    ↓
[Vercel]
 - Next.js アプリケーション
   - フロントエンド（React）
   - バックエンド（API Routes / Server Actions）
    ↓
[Supabase]
 - PostgreSQL（データベース）
 - Supabase Auth（認証）
 - Supabase Storage（画像保存）
```

### デプロイフロー
1. GitHubにコードをプッシュ
2. Vercelが自動的にビルド・デプロイ
3. プレビュー環境も自動生成

参考: 
- https://vercel.com/docs/deployments/overview
- https://supabase.com/docs/guides/getting-started/quickstarts/nextjs

### 環境変数
以下の環境変数をVercelに設定（推測）:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`（サーバーサイド専用）

参考: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs

## プロジェクト構造（推測）

Next.js App Routerの推奨構造に従う
```
/
├── app/
│   ├── layout.tsx          # ルートレイアウト
│   ├── page.tsx            # トップページ
│   ├── login/
│   │   └── page.tsx        # ログインページ
│   ├── register/
│   │   └── page.tsx        # 登録ページ
│   ├── profile/
│   │   └── [userId]/
│   │       └── page.tsx    # プロフィールページ
│   ├── my-list/
│   │   └── page.tsx        # マイリストページ
│   └── api/                # API Routes（必要に応じて）
├── components/             # Reactコンポーネント
├── lib/
│   └── supabase.ts         # Supabaseクライアント設定
├── types/                  # TypeScript型定義
└── public/                 # 静的ファイル
```

参考: https://nextjs.org/docs/app/building-your-application/routing

## API設計（推測）

Next.jsのServer ActionsまたはAPI Routesを使用

### 認証
- Supabase Auth SDKを使用
- `supabase.auth.signUp()`
- `supabase.auth.signInWithPassword()`
- `supabase.auth.signOut()`

参考: https://supabase.com/docs/reference/javascript/auth-signup

### データ操作
- Supabase Client SDKを使用
- `supabase.from('lists').select()`
- `supabase.from('items').insert()`
- `supabase.from('items').update()`
- `supabase.from('items').delete()`

参考: https://supabase.com/docs/reference/javascript/select

### 画像アップロード
- Supabase Storage SDKを使用
- `supabase.storage.from('images').upload()`

参考: https://supabase.com/docs/reference/javascript/storage-from-upload

## 画面構成（推測）

### MVP
1. ログイン画面（`/login`）
2. ユーザー登録画面（`/register`）
3. マイリスト画面（`/my-list`）
4. プロフィール画面（`/profile/[userId]`）
5. アイテム詳細/編集モーダル（推測）

### 将来追加
6. タイムライン画面（フォローしているユーザーのアクティビティ）
7. 検索画面
8. 通知画面
9. 設定画面

## セットアップ手順（推測）

1. Supabaseプロジェクトの作成
   - https://supabase.com でプロジェクト作成
   - データベーステーブル作成
   - Storageバケット作成

2. Next.jsプロジェクトの作成
```bash
   npx create-next-app@latest
```

3. Supabaseクライアントのインストール
```bash
   npm install @supabase/supabase-js
```

4. 環境変数の設定（`.env.local`）
```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

5. Vercelへのデプロイ
   - GitHubリポジトリと連携
   - 環境変数を設定
   - 自動デプロイ

参考: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs

## セキュリティ設定（推測）

### Row Level Security (RLS)
Supabaseで各テーブルにRLSポリシーを設定

例（推測）:
- `lists`: ユーザーは自分のリストのみ編集可能、公開リストは全員が閲覧可能
- `items`: リストの所有者のみ編集可能

参考: https://supabase.com/docs/guides/auth/row-level-security

### Storage Policies
画像アップロード用のバケットにポリシーを設定

参考: https://supabase.com/docs/guides/storage/security/access-control

## 備考

### 一次ソースについて
- Next.js公式ドキュメント: https://nextjs.org/docs
- Supabase公式ドキュメント: https://supabase.com/docs
- Vercel公式ドキュメント: https://vercel.com/docs
- 実装詳細は上記公式ドキュメントに基づいて進める

### 推測部分について
- プロジェクト構造、API設計、セキュリティ設定は一般的なベストプラクティスに基づく推測
- 実装時に公式ドキュメントを参照して詳細化が必要

### 今後の検討事項
- 具体的なパスワードポリシー（Supabase Authのデフォルト設定を確認）
- 画像のサイズ制限、形式制限
- レート制限
- バックアップ戦略（Supabaseの自動バックアップ機能を確認）
- モニタリング・ログ管理（Vercel Analytics、Supabase Logs）
- CI/CDパイプライン（Vercelの自動デプロイで基本的にカバー）

### 開発環境
- Claude Codeで全ての開発を実施
- 単一プロジェクト構成により、Claude Codeでの管理が容易