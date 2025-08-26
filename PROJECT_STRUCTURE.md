# プロジェクト構造

## 概要

このプロジェクトは、React Native + Expo + Solanaブロックチェーンを使用したiOSアプリケーションです。

## ディレクトリ構造

### ルートディレクトリ

```
oto_ios_testflight/
├── .git/                    # Gitリポジトリ
├── .github/                 # GitHub Actions設定
├── .kiro/                   # Kiro設定
├── .vscode/                 # VSCode設定
├── frontend/                # React Nativeフロントエンド
├── contract/                # Solanaスマートコントラクト
├── README.md                # プロジェクト概要
├── .gitignore              # Git除外設定
└── .cursorignore           # Cursor除外設定
```

### フロントエンド (frontend/)

```
frontend/
├── app/                     # Expo Router アプリケーション
│   ├── (tabs)/             # タブナビゲーション
│   ├── conversation/        # 会話関連画面
│   ├── _layout.tsx         # レイアウト設定
│   ├── index.tsx           # ホーム画面
│   └── login.tsx           # ログイン画面
├── components/              # Reactコンポーネント
│   ├── ui/                 # 基本UIコンポーネント
│   ├── recording/          # 録音関連コンポーネント
│   ├── trends/             # トレンド関連コンポーネント
│   ├── profile/            # プロフィール関連コンポーネント
│   ├── analysis/           # 分析関連コンポーネント
│   ├── clips/              # クリップ関連コンポーネント
│   ├── conversation/       # 会話関連コンポーネント
│   ├── history/            # 履歴関連コンポーネント
│   ├── LoginScreen.tsx     # ログイン画面コンポーネント
│   └── UserScreen.tsx      # ユーザー画面コンポーネント
├── services/               # APIサービス
├── hooks/                  # カスタムReactフック
├── lib/                    # ユーティリティライブラリ
├── contexts/               # React Context
├── contracts/              # コントラクト関連
├── blockchain/             # ブロックチェーン関連
├── types/                  # TypeScript型定義
├── polyfills/              # ポリフィル
├── assets/                 # 静的アセット
├── package.json            # 依存関係
├── tailwind.config.js      # Tailwind CSS設定
├── metro.config.js         # Metro設定
├── app.config.ts           # Expo設定
└── README.md               # フロントエンド説明
```

### スマートコントラクト (contract/)

```
contract/
├── contracts/              # Solanaスマートコントラクト
├── test/                   # テストファイル
├── scripts/                # デプロイスクリプト
├── utils/                  # ユーティリティ
├── helpers/                # ヘルパー関数
├── docs/                   # ドキュメント
├── ignition/               # Ignition設定
├── tasks/                  # Hardhatタスク
├── package.json            # 依存関係
├── hardhat.config.ts       # Hardhat設定
├── tsconfig.json           # TypeScript設定
└── README.md               # コントラクト説明
```

## 主要技術スタック

### フロントエンド

- **React Native**: モバイルアプリ開発
- **Expo**: 開発・ビルドツール
- **TypeScript**: 型安全な開発
- **Tailwind CSS**: スタイリング
- **NativeWind**: React Native用Tailwind
- **React Navigation**: ナビゲーション
- **Solana Web3.js**: ブロックチェーン連携
- **Privy**: ウォレット認証

### スマートコントラクト

- **Hardhat**: 開発・テスト・デプロイ
- **TypeScript**: 型安全な開発
- **Solana**: ブロックチェーンプラットフォーム

## 命名規則

### UIコンポーネント

- 基本UI: `ui/` ディレクトリ内
- 機能別: `{機能名}/` ディレクトリ内
- ファイル名: PascalCase (例: `LoginScreen.tsx`)

### ページ・画面

- ファイル名: kebab-case (例: `login.tsx`)
- ディレクトリ名: kebab-case (例: `conversation/`)

### 設定ファイル

- 設定ファイル: camelCase (例: `tailwind.config.js`)
- 型定義: `.d.ts` 拡張子

## 開発ガイドライン

1. **コンポーネント作成**: `components/` ディレクトリ内の適切なサブディレクトリに配置
2. **ページ作成**: `app/` ディレクトリ内に配置
3. **型定義**: `types/` ディレクトリ内に配置
4. **ユーティリティ**: `lib/` ディレクトリ内に配置
5. **API呼び出し**: `services/` ディレクトリ内に配置

## 注意事項

- 新しいUIライブラリを追加する際は、命名規則に従ってコンポーネント名を設定
- 例: `{UI library abbreviation}{Component name}` → `ShadTab`, `MagicDock`
- グラデーション色は使用しない
- 英語フォント: Hanken Grotesk Bold/ExtraBold
- 日本語フォント: Noto Sans JP
