import * as dotenv from "dotenv";
import { createPublicClient, http } from "viem";
import { base, baseSepolia, localhost, mainnet } from "viem/chains";

dotenv.config();

// サポートされているチェーンの定義
export const SUPPORTED_CHAINS = {
  mainnet: mainnet,
  base: base,
  "base-sepolia": baseSepolia,
  localhost: localhost,
} as const;

export type SupportedChainName = keyof typeof SUPPORTED_CHAINS;

/**
 * 環境変数またはHardhatネットワーク名からチェーン情報を取得
 */
export function getChainConfig(networkName?: string) {
  // 1. 明示的に指定されたネットワーク名を使用
  if (networkName && networkName in SUPPORTED_CHAINS) {
    return SUPPORTED_CHAINS[networkName as SupportedChainName];
  }

  // 2. 環境変数HARDHAT_NETWORKから取得
  const hardhatNetwork = process.env.HARDHAT_NETWORK;
  if (hardhatNetwork && hardhatNetwork in SUPPORTED_CHAINS) {
    return SUPPORTED_CHAINS[hardhatNetwork as SupportedChainName];
  }

  // 3. 環境変数CHAIN_NAMEから取得
  const chainName = process.env.CHAIN_NAME;
  if (chainName && chainName in SUPPORTED_CHAINS) {
    return SUPPORTED_CHAINS[chainName as SupportedChainName];
  }

  // 4. デフォルトはbase-sepolia
  console.log("⚠️  No network specified, defaulting to base-sepolia");
  return SUPPORTED_CHAINS["base-sepolia"];
}

/**
 * RPC URLを動的に生成
 */
export function getRpcUrl(chainName?: string): string {
  const chain = getChainConfig(chainName);

  switch (chain.id) {
    case baseSepolia.id:
      return `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
    case base.id:
      return `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
    case mainnet.id:
      return `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
    case localhost.id:
      return "http://127.0.0.1:8545";
    default:
      throw new Error(`Unsupported chain ID: ${chain.id}`);
  }
}

/**
 * ブロックエクスプローラーURLを取得
 */
export function getExplorerUrl(chainName?: string): string {
  const chain = getChainConfig(chainName);

  switch (chain.id) {
    case baseSepolia.id:
      return "https://sepolia.basescan.org";
    case base.id:
      return "https://basescan.org";
    case mainnet.id:
      return "https://etherscan.io";
    case localhost.id:
      return "http://localhost:8545"; // ローカル環境では適切なエクスプローラーなし
    default:
      return chain.blockExplorers?.default?.url || "";
  }
}

/**
 * パブリッククライアントを動的に作成
 */
export function createDynamicPublicClient(chainName?: string) {
  const chain = getChainConfig(chainName);
  const rpcUrl = getRpcUrl(chainName);

  return createPublicClient({
    chain,
    transport: http(rpcUrl),
  });
}

/**
 * 現在のチェーン情報を表示
 */
export function logChainInfo(chainName?: string) {
  const chain = getChainConfig(chainName);
  const rpcUrl = getRpcUrl(chainName);
  const explorerUrl = getExplorerUrl(chainName);

  console.log("🌐 Chain Information:");
  console.log(`   Name: ${chain.name}`);
  console.log(`   Chain ID: ${chain.id}`);
  console.log(`   RPC URL: ${rpcUrl}`);
  console.log(`   Explorer: ${explorerUrl}`);
}

/**
 * ネットワークから実際のChain IDを取得して検証
 */
export async function verifyChainId(chainName?: string): Promise<boolean> {
  try {
    const expectedChain = getChainConfig(chainName);
    const client = createDynamicPublicClient(chainName);

    const actualChainId = await client.getChainId();

    if (actualChainId !== expectedChain.id) {
      console.error(
        `❌ Chain ID mismatch! Expected: ${expectedChain.id}, Actual: ${actualChainId}`
      );
      return false;
    }

    console.log(`✅ Chain ID verified: ${actualChainId}`);
    return true;
  } catch (error) {
    console.error("❌ Failed to verify chain ID:", error);
    return false;
  }
}
