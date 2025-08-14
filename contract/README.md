# スマートコントラクト用プロジェクト

## セットアップ

`.env`ファイルを作成して以下の値をセットする

```txt
PRIVATE_KEY=""
ALCHMEY_API_KEY=""
BASESCAN_API_KEY=""
```

## 動かし方

### インストール

```bash
bun install
```

### フォーマッター＆リンター

```bash
bun run format
```

### コンパイル

```bash
bun run compile
```

### デプロイ

試験用のコントラクト

```bash
bun run deploy:Storage --network base-sepolia
```

### テスト

```bash
bun run test
```

### タスク系

#### 自分の残高取得

```bash
bun run getBalance --network base-sepolia
```

#### ネットワークの情報取得

```bash
bun run getChainInfo --network base-sepolia
```

#### USDC 残高取得

```bash
bun run getUsdcBalance --network base-sepolia
```

#### USDC Transfer

```bash
bun run transferUsdc --to 0x1431ea8af860C3862A919968C71f901aEdE1910E --amount 1 --network base-sepolia
```
