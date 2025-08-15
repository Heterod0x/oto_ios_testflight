# USDCRewardContract デプロイメントガイド

このガイドでは、USDCRewardContract を様々なネットワークにデプロイする方法を説明します。

## 🌐 サポートされているネットワーク

- **base-sepolia** (デフォルト): Base Sepolia テストネット
- **base**: Base メインネット
- **mainnet**: Ethereum メインネット
- **localhost**: ローカル開発環境

## ⚙️ 環境設定

### 1. 環境変数の設定

`.env`ファイルを作成し、以下の変数を設定してください：

```bash
# 必須
PRIVATE_KEY="your-private-key"
ALCHMEY_API_KEY="your-alchemy-api-key"
USDC_TOKEN_ADDRESS="usdc-token-address-for-target-network"

# オプション
CHAIN_NAME="base-sepolia"  # デフォルトネットワーク
BASESCAN_API_KEY="your-basescan-api-key"
ETHERSCAN_API_KEY="your-etherscan-api-key"

# 初期設定（オプション）
INITIAL_EXCHANGE_RATE="1000000"  # 1 point = 1 USDC (6 decimals)
INITIAL_USDC_DEPOSIT="1000000000"  # 1000 USDC

# 検証用
CONTRACT_ADDRESS="deployed-contract-address"
```

### 2. ネットワーク別 USDC トークンアドレス

```bash
# Base Sepolia (テスト用)
USDC_TOKEN_ADDRESS="0x036CbD53842c5426634e7929541eC2318f3dCF7e"

# Base Mainnet
USDC_TOKEN_ADDRESS="0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"

# Ethereum Mainnet
USDC_TOKEN_ADDRESS="0xA0b86a33E6441b8C4505B4afDcA7FBf074497C23"
```

## 🚀 デプロイ方法

### 方法 1: 自動デプロイ（推奨）

特定のネットワークに直接デプロイ：

```bash
# Base Sepolia にデプロイ
npm run deploy:base-sepolia

# Base Mainnet にデプロイ
npm run deploy:base

# ローカル環境にデプロイ
npm run deploy:localhost
```

### 方法 2: 手動デプロイ

#### ステップ 1: Chain ID 確認

```bash
# 現在の設定を確認
npx hardhat getChainInfo --network base-sepolia

# 特定のチェーンを指定して確認
npx hardhat getChainInfo --chain base-sepolia --network base-sepolia
```

#### ステップ 2: デプロイ実行

```bash
# 環境変数でネットワークを指定
CHAIN_NAME=base-sepolia npx hardhat run scripts/deploy-and-setup.ts --network base-sepolia

# または完全なデプロイ（検証付き）
CHAIN_NAME=base-sepolia npx hardhat run scripts/full-deployment.ts --network base-sepolia
```

#### ステップ 3: デプロイ検証

```bash
# スタンドアロン検証
CONTRACT_ADDRESS=0x... npx hardhat run scripts/verify-deployment.ts

# Hardhatタスクで検証
npx hardhat verifyDeployment --contract 0x... --chain base-sepolia --network base-sepolia
```

## 🔍 Chain ID の動的取得

このシステムでは以下の優先順位で Chain ID を決定します：

1. **明示的指定**: `--chain` パラメータ
2. **Hardhat ネットワーク**: `--network` パラメータ
3. **環境変数**: `CHAIN_NAME`
4. **デフォルト**: `base-sepolia`

### Chain ID 確認コマンド

```bash
# 現在の設定でChain IDを確認
npx hardhat getChainInfo

# 特定のネットワークのChain IDを確認
npx hardhat getChainInfo --network base-sepolia

# 特定のチェーンを指定してChain IDを確認
npx hardhat getChainInfo --chain base --network base
```

## 📋 利用可能なコマンド

### デプロイ関連

```bash
npm run deploy:USDCReward          # Ignitionでデプロイ
npm run deploy:setup               # 初期設定付きデプロイ
npm run deploy:full                # 完全デプロイ（検証付き）
npm run deploy:base-sepolia        # Base Sepoliaに直接デプロイ
npm run deploy:base                # Base Mainnetに直接デプロイ
npm run deploy:localhost           # ローカル環境にデプロイ
```

### 検証関連

```bash
npm run verify:deployment          # スタンドアロン検証
npm run verify:contract            # Hardhatタスク検証
```

### ユーティリティ

```bash
npx hardhat getChainInfo           # Chain情報取得
npx hardhat getBalance             # 残高確認
npx hardhat getUsdcBalance         # USDC残高確認
```

## 🛠️ トラブルシューティング

### Chain ID 不一致エラー

```bash
❌ Chain ID mismatch! Expected: 84532, Actual: 1
```

**解決方法:**

1. 正しいネットワークに接続しているか確認
2. `CHAIN_NAME`環境変数が正しく設定されているか確認
3. Hardhat の`--network`パラメータが正しいか確認

### RPC 接続エラー

```bash
❌ Failed to verify chain ID: HttpRequestError
```

**解決方法:**

1. `ALCHMEY_API_KEY`が正しく設定されているか確認
2. ネットワークが利用可能か確認
3. レート制限に引っかかっていないか確認

### USDC トークンアドレスエラー

```bash
❌ USDC_TOKEN_ADDRESS environment variable is required
```

**解決方法:**

1. 対象ネットワークの正しい USDC アドレスを設定
2. `.env`ファイルが正しく読み込まれているか確認

## 📝 デプロイ後の確認事項

1. **コントラクトアドレス**: デプロイされたアドレスを記録
2. **Owner 確認**: デプロイアカウントが Owner になっているか
3. **USDC 統合**: USDC トークンとの統合が正常か
4. **Exchange Rate**: 必要に応じて交換レートを設定
5. **USDC Deposit**: 必要に応じて初期 USDC を入金

## 🔗 ブロックエクスプローラー

デプロイ後、以下のエクスプローラーでコントラクトを確認できます：

- **Base Sepolia**: https://sepolia.basescan.org
- **Base Mainnet**: https://basescan.org
- **Ethereum Mainnet**: https://etherscan.io
