import { task } from "hardhat/config";
import {
  createDynamicPublicClient,
  logChainInfo,
  verifyChainId,
} from "../../utils/chainUtils";

task("getChainInfo", "Get current chain information and verify chain ID")
  .addOptionalParam(
    "chain",
    "The chain name to check (defaults to network name or env variable)"
  )
  .setAction(async (taskArgs, hre) => {
    const chainName =
      taskArgs.chain || hre.network.name || process.env.CHAIN_NAME;

    console.log("🌐 Getting chain information...");
    console.log(`Hardhat Network: ${hre.network.name}`);
    console.log(`Specified Chain: ${chainName}`);

    // Display configured chain info
    logChainInfo(chainName);

    // Verify actual chain ID matches expectation
    console.log("\n🔍 Verifying chain ID...");
    const isValid = await verifyChainId(chainName);

    if (isValid) {
      console.log("✅ Chain configuration is correct!");
    } else {
      console.log("❌ Chain configuration mismatch!");
      process.exit(1);
    }

    // Get additional network info
    try {
      const client = createDynamicPublicClient(chainName);
      const blockNumber = await client.getBlockNumber();
      const gasPrice = await client.getGasPrice();

      console.log("\n📊 Network Status:");
      console.log(`   Latest Block: ${blockNumber}`);
      console.log(`   Gas Price: ${gasPrice} wei`);
    } catch (error) {
      console.log("⚠️  Could not fetch network status:", error.message);
    }
  });
