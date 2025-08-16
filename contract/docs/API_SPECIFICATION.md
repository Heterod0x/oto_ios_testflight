# USDCRewardContract API 仕様書

## 概要

USDCRewardContract は、会話データをアップロードしたユーザーにポイントベースの報酬を提供するスマートコントラクトです。管理者がユーザーのポイントを管理し、ユーザーがポイントを USDC に交換できる機能を提供します。

## コントラクト情報

- **コントラクト名**: USDCRewardContract
- **Solidity バージョン**: ^0.8.28
- **継承**: Ownable, Pausable, ReentrancyGuard
- **ライセンス**: MIT

## 状態変数

### プライベート変数

| 変数名          | 型                            | 説明                                                                   |
| --------------- | ----------------------------- | ---------------------------------------------------------------------- |
| `pointBalances` | `mapping(address => uint256)` | ユーザーアドレスとポイント残高のマッピング                             |
| `exchangeRate`  | `uint256`                     | ポイントから USDC への交換レート（1 ポイント = exchangeRate USDC wei） |
| `usdcToken`     | `IERC20`                      | USDC トークンコントラクトのインターフェース                            |

## 関数仕様

### コンストラクタ

#### `constructor(address _usdcToken)`

コントラクトを初期化します。

**パラメータ:**

- `_usdcToken` (address): USDC トークンコントラクトのアドレス

**制約:**

- `_usdcToken`はゼロアドレスであってはならない

**エラー:**

- `InvalidAddress()`: USDC トークンアドレスがゼロアドレスの場合

**初期化:**

- `exchangeRate`は 0 に設定（管理者による設定が必要）
- デプロイヤーが初期所有者として設定

---

### ポイント管理関数

#### `addPoints(address user, uint256 amount)` 🔒

ユーザーのポイント残高を増加させます。

**アクセス制御:** `onlyOwner`

**パラメータ:**

- `user` (address): ポイントを追加するユーザーのアドレス
- `amount` (uint256): 追加するポイント数

**制約:**

- `user`はゼロアドレスであってはならない
- `amount`は 0 より大きくなければならない

**エラー:**

- `InvalidAddress()`: ユーザーアドレスがゼロアドレスの場合
- `InvalidAmount()`: 金額が 0 の場合

**イベント:**

- `PointsAdded(address indexed user, uint256 amount)`

**使用例:**

```solidity
// ユーザーに1000ポイントを追加
contract.addPoints(0x1234567890123456789012345678901234567890, 1000);
```

---

#### `removePoints(address user, uint256 amount)` 🔒

ユーザーのポイント残高を減算します（ポイント削除処理）。

**アクセス制御:** `onlyOwner`

**パラメータ:**

- `user` (address): ポイントを削除するユーザーのアドレス
- `amount` (uint256): 削除するポイント数

**制約:**

- `user`はゼロアドレスであってはならない
- `amount`は 0 より大きくなければならない
- ユーザーの残高は`amount`以上でなければならない

**エラー:**

- `InvalidAddress()`: ユーザーアドレスがゼロアドレスの場合
- `InvalidAmount()`: 金額が 0 の場合
- `InsufficientPoints(uint256 required, uint256 available)`: ポイント残高不足の場合

**イベント:**

- `PointsRemoved(address indexed user, uint256 amount)`

**使用例:**

```solidity
// ユーザーから300ポイントを削除
contract.removePoints(0x1234567890123456789012345678901234567890, 300);
```

---

#### `getPointBalance(address user)` 👁️

ユーザーのポイント残高を取得します。

**アクセス制御:** なし（view 関数）

**パラメータ:**

- `user` (address): 残高を確認するユーザーのアドレス

**戻り値:**

- `uint256`: ユーザーのポイント残高

**使用例:**

```solidity
// ユーザーのポイント残高を確認
uint256 balance = contract.getPointBalance(0x1234567890123456789012345678901234567890);
```

---

### 交換レート管理関数

#### `setExchangeRate(uint256 rate)` 🔒

ポイントから USDC への交換レートを設定します。

**アクセス制御:** `onlyOwner`

**パラメータ:**

- `rate` (uint256): 新しい交換レート（1 ポイント = rate USDC wei）

**注意:**

- `rate`が 0 の場合、USDC 請求が無効になります
- USDC は 6 桁の精度を持つため、適切なレート設定が重要です

**イベント:**

- `ExchangeRateSet(uint256 newRate)`

**使用例:**

```solidity
// 1ポイント = 0.001 USDC (1,000,000 wei) に設定
contract.setExchangeRate(1000000);

// 1ポイント = 1 USDC (1,000,000,000,000 wei) に設定
contract.setExchangeRate(1000000000000);
```

---

#### `calculateUSDCAmount(uint256 pointAmount)` 👁️

指定されたポイント数に対応する USDC 金額を計算します。

**アクセス制御:** なし（view 関数）

**パラメータ:**

- `pointAmount` (uint256): 変換するポイント数

**戻り値:**

- `uint256`: 対応する USDC 金額（wei 単位）

**注意:**

- 交換レートが 0 の場合、常に 0 を返します

**使用例:**

```solidity
// 1000ポイントに対応するUSDC金額を計算
uint256 usdcAmount = contract.calculateUSDCAmount(1000);
```

---

### USDC 請求関数

#### `claimUSDC(uint256 pointAmount)` ⏸️🔒

ユーザーがポイントを USDC に交換します。

**アクセス制御:** `whenNotPaused`, `nonReentrant`

**パラメータ:**

- `pointAmount` (uint256): 交換するポイント数

**制約:**

- コントラクトが一時停止されていない
- `pointAmount`は 0 より大きくなければならない
- 交換レートが設定されている（0 でない）
- ユーザーの残高は`pointAmount`以上でなければならない
- コントラクトの USDC 残高は計算された USDC 金額以上でなければならない

**エラー:**

- `InvalidAddress()`: 呼び出し者がゼロアドレスの場合
- `InvalidAmount()`: ポイント数が 0 の場合
- `ExchangeRateNotSet()`: 交換レートが設定されていない場合
- `InsufficientPoints(uint256 required, uint256 available)`: ポイント残高不足の場合
- `InsufficientUSDCBalance(uint256 required, uint256 available)`: コントラクトの USDC 残高不足の場合

**イベント:**

- `USDCClaimed(address indexed user, uint256 pointsUsed, uint256 usdcAmount)`

**処理フロー:**

1. 入力値の検証
2. 交換レートの確認
3. ユーザーのポイント残高確認
4. USDC 金額の計算
5. コントラクトの USDC 残高確認
6. ユーザーのポイント残高減少
7. USDC の転送
8. イベントの発行

**使用例:**

```solidity
// 500ポイントをUSDCに交換
contract.claimUSDC(500);
```

---

### USDC 供給管理関数

#### `depositUSDC(uint256 amount)` 🔒

コントラクトに USDC を入金します。

**アクセス制御:** `onlyOwner`

**パラメータ:**

- `amount` (uint256): 入金する USDC 金額（wei 単位）

**制約:**

- `amount`は 0 より大きくなければならない
- 所有者はコントラクトに対して USDC の使用許可を与えている必要があります

**エラー:**

- `InvalidAmount()`: 金額が 0 の場合
- `InsufficientUSDCBalance(uint256 required, uint256 available)`: 所有者の USDC 残高不足または許可不足の場合

**イベント:**

- `USDCDeposited(uint256 amount)`

**事前準備:**

```solidity
// 事前にUSDCコントラクトでapproveが必要
usdcToken.approve(contractAddress, amount);
```

**使用例:**

```solidity
// 1000 USDC (1,000,000,000 wei) を入金
contract.depositUSDC(1000000000);
```

---

#### `withdrawUSDC(uint256 amount)` 🔒

コントラクトから USDC を出金します。

**アクセス制御:** `onlyOwner`

**パラメータ:**

- `amount` (uint256): 出金する USDC 金額（wei 単位）

**制約:**

- `amount`は 0 より大きくなければならない
- コントラクトの USDC 残高は`amount`以上でなければならない

**エラー:**

- `InvalidAmount()`: 金額が 0 の場合
- `InsufficientUSDCBalance(uint256 required, uint256 available)`: コントラクトの USDC 残高不足の場合

**イベント:**

- `USDCWithdrawn(uint256 amount)`

**使用例:**

```solidity
// 500 USDC (500,000,000 wei) を出金
contract.withdrawUSDC(500000000);
```

---

### 一時停止管理関数

#### `pause()` 🔒

コントラクトを一時停止します。

**アクセス制御:** `onlyOwner`

**効果:**

- `claimUSDC`関数が無効になります
- 管理者機能は引き続き利用可能です

**イベント:**

- `ContractPaused()`

**使用例:**

```solidity
// コントラクトを一時停止
contract.pause();
```

---

#### `unpause()` 🔒

コントラクトの一時停止を解除します。

**アクセス制御:** `onlyOwner`

**効果:**

- すべての機能が正常に動作します

**イベント:**

- `ContractUnpaused()`

**使用例:**

```solidity
// 一時停止を解除
contract.unpause();
```

---

## イベント仕様

### `PointsAdded(address indexed user, uint256 amount)`

ユーザーにポイントが追加された時に発行されます。

**パラメータ:**

- `user` (address, indexed): ポイントが追加されたユーザーのアドレス
- `amount` (uint256): 追加されたポイント数

---

### `PointsTransferred(address indexed user, uint256 amount)`

ユーザーからポイントが送金された時に発行されます。

**パラメータ:**

- `user` (address, indexed): ポイントが送金されたユーザーのアドレス
- `amount` (uint256): 送金されたポイント数

---

### `ExchangeRateSet(uint256 newRate)`

交換レートが設定された時に発行されます。

**パラメータ:**

- `newRate` (uint256): 新しい交換レート

---

### `USDCClaimed(address indexed user, uint256 pointsUsed, uint256 usdcAmount)`

ユーザーが USDC を請求した時に発行されます。

**パラメータ:**

- `user` (address, indexed): USDC を請求したユーザーのアドレス
- `pointsUsed` (uint256): 使用されたポイント数
- `usdcAmount` (uint256): 請求された USDC 金額（wei 単位）

---

### `USDCDeposited(uint256 amount)`

コントラクトに USDC が入金された時に発行されます。

**パラメータ:**

- `amount` (uint256): 入金された USDC 金額（wei 単位）

---

### `USDCWithdrawn(uint256 amount)`

コントラクトから USDC が出金された時に発行されます。

**パラメータ:**

- `amount` (uint256): 出金された USDC 金額（wei 単位）

---

### `ContractPaused()`

コントラクトが一時停止された時に発行されます。

**パラメータ:** なし

---

### `ContractUnpaused()`

コントラクトの一時停止が解除された時に発行されます。

**パラメータ:** なし

---

## エラー仕様

### `InsufficientPoints(uint256 required, uint256 available)`

ユーザーのポイント残高が不足している場合に発生します。

**パラメータ:**

- `required` (uint256): 必要なポイント数
- `available` (uint256): 利用可能なポイント数

---

### `InsufficientUSDCBalance(uint256 required, uint256 available)`

USDC 残高が不足している場合に発生します。

**パラメータ:**

- `required` (uint256): 必要な USDC 金額
- `available` (uint256): 利用可能な USDC 金額

---

### `InvalidAddress()`

無効なアドレス（ゼロアドレス）が提供された場合に発生します。

**パラメータ:** なし

---

### `InvalidAmount()`

無効な金額（0 以下）が提供された場合に発生します。

**パラメータ:** なし

---

### `ExchangeRateNotSet()`

交換レートが設定されていない（0）場合に発生します。

**パラメータ:** なし

---

### `Unauthorized()`

権限のないアクセスが試行された場合に発生します。

**パラメータ:** なし

---

### `ContractIsPaused()`

コントラクトが一時停止中に制限された操作が試行された場合に発生します。

**パラメータ:** なし

---

## 使用例とワークフロー

### 基本的なワークフロー

#### 1. コントラクトのデプロイと初期設定

```solidity
// 1. コントラクトをデプロイ
USDCRewardContract contract = new USDCRewardContract(usdcTokenAddress);

// 2. 交換レートを設定（1ポイント = 0.001 USDC）
contract.setExchangeRate(1000000);

// 3. USDCを入金（事前にapprove必要）
usdcToken.approve(address(contract), 1000000000); // 1000 USDC
contract.depositUSDC(1000000000);
```

#### 2. ユーザーへのポイント付与

```solidity
// ユーザーに1000ポイントを付与
contract.addPoints(userAddress, 1000);

// ユーザーの残高を確認
uint256 balance = contract.getPointBalance(userAddress);
```

#### 3. ユーザーによる USDC 請求

```solidity
// ユーザーが500ポイントをUSDCに交換
contract.claimUSDC(500);

// 交換後の残高を確認
uint256 newBalance = contract.getPointBalance(userAddress);
```

### 管理者操作の例

#### 緊急時の一時停止

```solidity
// コントラクトを一時停止
contract.pause();

// 問題解決後、一時停止を解除
contract.unpause();
```

#### USDC 供給の管理

```solidity
// 追加のUSDCを入金
usdcToken.approve(address(contract), 500000000); // 500 USDC
contract.depositUSDC(500000000);

// 余剰USDCを出金
contract.withdrawUSDC(100000000); // 100 USDC
```

### エラーハンドリングの例

```javascript
// JavaScript/TypeScript での例
try {
  await contract.claimUSDC(1000);
} catch (error) {
  if (error.message.includes("InsufficientPoints")) {
    console.log("ポイント残高が不足しています");
  } else if (error.message.includes("InsufficientUSDCBalance")) {
    console.log("コントラクトのUSDC残高が不足しています");
  } else if (error.message.includes("ExchangeRateNotSet")) {
    console.log("交換レートが設定されていません");
  }
}
```

## セキュリティ考慮事項

### アクセス制御

- **所有者権限**: 重要な管理機能は`onlyOwner`修飾子で保護
- **一時停止機能**: 緊急時にユーザー機能を無効化可能
- **リエントランシー防止**: `nonReentrant`修飾子でリエントランシー攻撃を防止

### 入力検証

- **ゼロアドレス検証**: すべてのアドレス入力を検証
- **ゼロ金額検証**: すべての金額入力を検証
- **残高チェック**: 操作前に十分な残高があることを確認

### 整数オーバーフロー

- Solidity 0.8.x の組み込み保護により自動的に防止

## ガス使用量の目安

| 関数              | 推定ガス使用量 |
| ----------------- | -------------- |
| `addPoints`       | ~45,000        |
| `removePoints`    | ~30,000        |
| `setExchangeRate` | ~25,000        |
| `claimUSDC`       | ~80,000        |
| `depositUSDC`     | ~60,000        |
| `withdrawUSDC`    | ~55,000        |
| `pause/unpause`   | ~25,000        |

_注意: ガス使用量は実際の条件により変動する可能性があります。_

## 互換性

- **Solidity**: ^0.8.28
- **OpenZeppelin**: ^5.0.0
- **ERC20**: IERC20 インターフェース準拠のトークン
- **ネットワーク**: Ethereum 互換のすべてのネットワーク

## 更新履歴

| バージョン | 日付       | 変更内容     |
| ---------- | ---------- | ------------ |
| 1.0.0      | 2025-08-15 | 初回リリース |

---

_この仕様書は USDCRewardContract v1.0.0 に基づいています。最新の情報については、コントラクトのソースコードを参照してください。_
