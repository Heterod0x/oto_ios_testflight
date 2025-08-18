# USDC Reward System - Smart Contract

USDC 報酬システムは、会話データをアップロードしたユーザーにポイントベースの報酬を提供するスマートコントラクトです。管理者がユーザーのポイントを管理し、ユーザーがポイントを USDC に交換できる仕組みを実装しています。

## 🌟 主な機能

- **ポイント管理**: 管理者によるユーザーポイントの追加・送金
- **交換レート設定**: ポイントから USDC への変換レート管理
- **USDC 請求**: ユーザーによるポイントの USDC 交換
- **USDC 供給管理**: 管理者によるコントラクト内 USDC 残高管理
- **アクセス制御**: 管理者権限とセキュリティ機能
- **一時停止機能**: 緊急時のシステム停止機能

## 🛠️ 技術スタック

- **Solidity**: 0.8.28
- **フレームワーク**: Hardhat 2.26.1
- **ライブラリ**: OpenZeppelin Contracts v5.0.0
- **開発ツール**: Viem, TypeScript, Prettier
- **ネットワーク**: Base Sepolia (ChainID: 84532)

## 📋 前提条件

- Node.js >= 23
- Bun (推奨) または npm
- Base Sepolia テストネット用の ETH
- USDC トークン（テスト用）

## ⚙️ セットアップ

### 1. 依存関係のインストール

```bash
bun install
```

### 2. 環境変数の設定

`.env`ファイルを作成して以下の値を設定してください：

```bash
# 必須設定
PRIVATE_KEY="your-private-key-here"
ALCHEMY_API_KEY="your-alchemy-api-key"
USDC_TOKEN_ADDRESS="0x036CbD53842c5426634e7929541eC2318f3dCF7e"  # Base Sepolia USDC

# オプション設定
BASESCAN_API_KEY="your-basescan-api-key"
ETHERSCAN_API_KEY="your-etherscan-api-key"
CHAIN_NAME="base-sepolia"

# 初期設定値（オプション）
INITIAL_EXCHANGE_RATE="1000000"      # 1 point = 0.001 USDC
INITIAL_USDC_DEPOSIT="1000000000"    # 1000 USDC

# デプロイ後の検証用
CONTRACT_ADDRESS="deployed-contract-address"
```

### 3. コンパイル

```bash
bun run compile
```

## 🚀 デプロイ

### クイックデプロイ（推奨）

```bash
# ネットワーク毎にUSDCのコントラクトを設定(ここの値はネットワーク毎に切り替える)
export USDC_TOKEN_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e
# Base Sepoliaに自動デプロイ（初期設定付き）
bun run deploy:full --network base-sepolia
```

### デプロイ後に環境変数に設定

```bash
export CONTRACT_ADDRESS=<デプロイしたアドレス>
```

さらに、 `deployed_addresses.json` に　 USDC のアドレスを設定する

```json
{
  "USDCModule#USDC": "0x036CbD53842c5426634e7929541eC2318f3dCF7e"
}
```

### コントラクトの検証

```bash
bun run verify chain-84532
```

詳細なデプロイ手順は [DEPLOYMENT.md](./DEPLOYMENT.md) を参照してください。

## 🧪 テスト

### 全テスト実行

```bash
bun run test
```

### カバレッジ確認

```bash
bun run coverage
```

## 📖 コントラクトの使用方法

### 管理者機能

#### ポイント管理

```bash
# ユーザーにポイントを追加
bun run addPoints --user 0x51908F598A5e0d8F1A3bAbFa6DF76F9704daD072 --amount 1000 --network base-sepolia

# ユーザーからポイントを
bun run subtractPoints --user 0x51908F598A5e0d8F1A3bAbFa6DF76F9704daD072 --amount 500 --network base-sepolia
```

#### 交換レート設定

```bash
# 交換レートを設定（1ポイント = 0.1 USDC）
bun run setExchangeRate --rate 100000 --network base-sepolia
```

#### USDC 供給管理

```bash
# コントラクトにUSDCを入金
bun run depositUSDC --amount 10 --network base-sepolia

# コントラクトからUSDCを出金
bun run withdrawUSDC --amount 1 --network base-sepolia
```

#### システム管理

```bash
# コントラクトを一時停止
bun run pauseContract --network base-sepolia

# コントラクトの一時停止を解除
bun run unpauseContract --network base-sepolia

# 所有権を移転
bun run transferOwnership --newowner 0x1431ea8af860C3862A919968C71f901aEdE1910E --network base-sepolia
```

### ユーザー機能

#### 残高確認

```bash
# ポイント残高とUSDC残高を確認
bun run getBalances --user 0x51908F598A5e0d8F1A3bAbFa6DF76F9704daD072 --network base-sepolia
```

#### USDC 請求

コントラクトの `claimUSDC` 関数を直接呼び出すか、フロントエンドアプリケーションを通じて実行します。

```bash
# USDCを請求(デフォルトだと 1ポイント = 1USDC)
bun run claimUSDC --points 1 --network base-sepolia
```

## 🔧 開発ツール

### コードフォーマット

```bash
bun run format
```

### コンパイル

```bash
bun run compile
```

### クリーンアップ

```bash
bun run clean
```

### ローカル開発環境

```bash
# ローカルHardhatノードを起動
bun run local

# 別ターミナルでローカル環境にデプロイ
bun run deploy:localhost
```

## 📊 コントラクト仕様

### 主要関数

#### 管理者専用関数

- `addPoints(address user, uint256 amount)`: ユーザーにポイントを追加
- `subtractPoints(address user, uint256 amount)`: ユーザーからポイントを減算
- `setExchangeRate(uint256 rate)`: 交換レートを設定
- `depositUSDC(uint256 amount)`: コントラクトに USDC を入金
- `withdrawUSDC(uint256 amount)`: コントラクトから USDC を出金
- `pause()`: コントラクトを一時停止
- `unpause()`: 一時停止を解除

#### ユーザー関数

- `claimUSDC(uint256 pointAmount)`: ポイントを USDC に交換
- `getPointBalance(address user)`: ポイント残高を確認
- `calculateUSDCAmount(uint256 pointAmount)`: ポイントに対応する USDC 金額を計算

### イベント

- `PointsAdded(address indexed user, uint256 amount)`
- `PointsRemoved(address indexed user, uint256 amount)`
- `ExchangeRateSet(uint256 newRate)`
- `USDCClaimed(address indexed user, uint256 pointsUsed, uint256 usdcAmount)`
- `USDCDeposited(uint256 amount)`
- `USDCWithdrawn(uint256 amount)`
- `ContractPaused()`
- `ContractUnpaused()`

### カスタムエラー

- `InsufficientPoints(uint256 required, uint256 available)`
- `InsufficientUSDCBalance(uint256 required, uint256 available)`
- `InvalidAddress()`
- `InvalidAmount()`
- `ExchangeRateNotSet()`
- `Unauthorized()`
- `ContractPaused()`

## 🔒 セキュリティ機能

- **アクセス制御**: OpenZeppelin Ownable による管理者権限管理
- **リエントランシー防止**: ReentrancyGuard による攻撃防止
- **一時停止機能**: Pausable による緊急停止機能
- **入力検証**: ゼロアドレス・ゼロ金額の検証
- **整数オーバーフロー防止**: Solidity 0.8.x の組み込み保護

## 🌐 ネットワーク情報

### Base Sepolia（テストネット）

- **Chain ID**: 84532
- **RPC URL**: Alchemy 経由
- **USDC Address**: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- **Explorer**: https://sepolia.basescan.org

### Base Mainnet

- **Chain ID**: 8453
- **USDC Address**: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- **Explorer**: https://basescan.org

## 🐛 トラブルシューティング

### よくある問題

1. **Chain ID 不一致エラー**

   ```bash
   ❌ Chain ID mismatch! Expected: 84532, Actual: 1
   ```

   → 正しいネットワークに接続しているか確認してください

2. **USDC 残高不足エラー**

   ```bash
   ❌ InsufficientUSDCBalance
   ```

   → コントラクトに USDC を入金してください

3. **権限エラー**
   ```bash
   ❌ Unauthorized
   ```
   → 管理者アカウントで実行しているか確認してください

## 📚 参考資料

- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Base Network Documentation](https://docs.base.org/)
- [Viem Documentation](https://viem.sh/)
