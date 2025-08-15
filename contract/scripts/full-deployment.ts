import * as dotenv from "dotenv";
import { getExplorerUrl } from "../utils/chainUtils";
import deployAndSetup from "./deploy-and-setup";
import { verifyDeployment } from "./verify-deployment";

dotenv.config();

async function fullDeployment() {
  console.log("🚀 Starting full deployment process...");
  console.log("=====================================");

  try {
    // Step 1: Deploy and setup
    console.log("\n📦 Step 1: Deploying contract...");
    const deploymentResult = await deployAndSetup();

    // Step 2: Wait a bit for the transaction to be mined
    console.log("\n⏳ Waiting for deployment to be confirmed...");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Step 3: Verify deployment
    console.log("\n🔍 Step 2: Verifying deployment...");
    const chainName = process.env.CHAIN_NAME || process.env.HARDHAT_NETWORK;
    const verificationResults = await verifyDeployment(
      deploymentResult.contractAddress,
      deploymentResult.usdcTokenAddress,
      chainName
    );

    // Step 4: Summary
    console.log("\n📋 Deployment Summary:");
    console.log("======================");
    console.log(`✅ Contract Address: ${deploymentResult.contractAddress}`);
    console.log(`🪙  USDC Token: ${deploymentResult.usdcTokenAddress}`);
    console.log(`🌐 Network: ${process.env.HARDHAT_NETWORK || "localhost"}`);

    const successfulTests = verificationResults.filter((r) => r.success).length;
    const totalTests = verificationResults.length;
    console.log(
      `🎯 Verification: ${successfulTests}/${totalTests} tests passed`
    );

    if (successfulTests === totalTests) {
      console.log("\n🎉 Full deployment completed successfully!");

      // Provide next steps
      console.log("\n📝 Next Steps:");
      console.log("==============");
      console.log("1. Save the contract address to your .env file:");
      console.log(`   CONTRACT_ADDRESS=${deploymentResult.contractAddress}`);
      console.log("\n2. You can now use the contract with these commands:");
      console.log("   npm run addPoints -- --user <address> --amount <points>");
      console.log("   npm run setExchangeRate -- --rate <rate>");
      console.log("   npm run depositUSDC -- --amount <amount>");
      const explorerUrl = getExplorerUrl(chainName);
      if (explorerUrl && explorerUrl !== "http://localhost:8545") {
        console.log("\n3. View your contract on block explorer:");
        console.log(
          `   ${explorerUrl}/address/${deploymentResult.contractAddress}`
        );
      }
    } else {
      console.log(
        "\n⚠️  Deployment completed but some verification tests failed."
      );
      console.log("Please check the verification results above.");
    }

    return {
      success: successfulTests === totalTests,
      contractAddress: deploymentResult.contractAddress,
      verificationResults,
    };
  } catch (error) {
    console.error("\n❌ Full deployment failed:", error);
    throw error;
  }
}

// Execute if run directly
if (require.main === module) {
  fullDeployment()
    .then((result) => {
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error("❌ Full deployment process failed:", error);
      process.exit(1);
    });
}

export default fullDeployment;
