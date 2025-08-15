# Oto プロジェクトのための GitHub Copilot インストラクション

## プロジェクト概要

このリポジトリは、スマートコントラクトを基盤とした USDC 報酬システム「Oto」プロジェクトです。管理者がユーザーにポイントを付与し、ユーザーはそのポイントを USDC に交換することができます。すべてのコントラクト関連のロジックは `contract/` ディレクトリ内にあります。

## 技術スタック

- **スマートコントラクト言語**: Solidity `^0.8.28`
- **フレームワーク**: Hardhat `~2.26.1`
- **ライブラリ**: OpenZeppelin Contracts `~5.4.0`
- **スクリプト & テスト**: TypeScript, Viem
- **パッケージマネージャー**: Bun
- **CI/CD**: GitHub Actions

## 主要なファイルとディレクトリ

プロジェクトで作業する際は、`contract/` ディレクトリ内の以下のファイルとディレクトリに特に注意してください：

- `contracts/USDCRewardContract.sol`: スマートコントラクトの中核ロジックです。ポイント、交換レート、USDC 請求を扱います。セキュリティのために OpenZeppelin の `Ownable`, `Pausable`, `ReentrancyGuard` を継承しています。
- `hardhat.config.ts`: Hardhat のすべての設定が含まれています。ネットワーク設定（Base Sepolia, Base Mainnet など）、Solidity コンパイラのバージョン、Etherscan の API キーなどが定義されています。
- `package.json`: プロジェクトのすべての依存関係とスクリプトを定義しています。`compile`, `test`, `deploy` などの共通コマンドについては `scripts` セクションを参照してください。
- `test/USDCRewardContract.test.ts`: スマートコントラクトのテストスイートです。すべての新機能には、ここでのテストを伴うべきです。
- `tasks/`: デプロイされたコントラクトと対話するためのカスタム Hardhat タスクが含まれています（例：`addPoints`, `claimUSDC`）。コントラクト操作を依頼された場合は、ここのタスクを使用または作成することを優先してください。
- `scripts/`: `full-deployment.ts` のようなデプロイおよびセットアップスクリプトを保持します。
- `ignition/modules/`: Hardhat Ignition のデプロイメントモジュールを定義します。
- `.github/workflows/ci.yml`: テストを自動的に実行するための CI/CD パイプラインです。

## 開発ワークフロー

1.  **作業ディレクトリ**: すべてのコマンドは `contract/` ディレクトリから実行してください。
2.  **インストール**: `bun install` を使用して依存関係をインストールします。
3.  **コンパイル**: `bun run compile` でスマートコントラクトをコンパイルします。
4.  **テスト**: `bun run test` でテストスイートを実行します。これはコミット前の重要なステップです。
5.  **デプロイ**: `scripts/` ディレクトリ内のスクリプトを使用してデプロイします（例：`bun run deploy:full --network base-sepolia`）。
6.  **環境変数**: プロジェクトは秘密鍵や API キーなどの機密情報に `.env` ファイルを使用します。テンプレートとして `.env.example` ファイルが提供されています。

## コーディング規約

- **Solidity**: 公式の Solidity スタイルガイドに従ってください。リンティングには `solhint` を使用します（`.solhint.json`で設定済み）。セキュリティは最優先事項です。常にベストプラクティスを使用し、可能な限り OpenZeppelin コントラクトを活用してください。
- **TypeScript**: 標準的な TypeScript のベストプラクティスに従ってください。コードフォーマットには `prettier` を使用します（`.prettierrc.json`で設定済み）。
- **コミット**: 明確で説明的なコミットメッセージを書いてください。
- **Hardhat タスク**: 新しいコントラクトの対話処理については、再利用性と一貫性を確保するために `tasks/` ディレクトリに新しい Hardhat タスクを作成することを検討してください。
