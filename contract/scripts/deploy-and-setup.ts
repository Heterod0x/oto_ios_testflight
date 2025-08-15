import * as dotenv from "dotenv";
import { ignition } from "hardhat";
import USDCRewardContractModule from "../ignition/modules/USDCRewardContract";
import { logChainInfo, verifyChainId } from "../utils/chainUtils";

dotenv.config();

async function main() {
  console.log("🚀 Starting USDCRewardContract deployment...");

  // Display and verify chain information
  const chainName = process.env.CHAIN_NAME || process.env.HARDHAT_NETWORK;
  logChainInfo(chainName);

  const chainIdValid = await verifyChainId(chainName);
  if (!chainIdValid) {
    throw new Error(
      "Chain ID verification failed. Please check your network configuration."
    );
  }

  // Check if USDC token address is provided
  const usdcTokenAddress = process.env.USDC_TOKEN_ADDRESS;
  if (!usdcTokenAddress) {
    throw new Error("USDC_TOKEN_ADDRESS environment variable is required");
  }

  console.log(`📍 Using USDC Token Address: ${usdcTokenAddress}`);

  // Deploy the contract
  const { usdcRewardContract } = await ignition.deploy(
    USDCRewardContractModule,
    {
      parameters: {
        USDCRewardContractModule: {
          usdcTokenAddress: usdcTokenAddress,
        },
      },
    }
  );

  const contractAddress = usdcRewardContract.address;
  console.log(`✅ USDCRewardContract deployed to: ${contractAddress}`);

  // Optional: Perform initial setup if environment variables are provided
  const initialExchangeRate = process.env.INITIAL_EXCHANGE_RATE;
  const initialUsdcDeposit = process.env.INITIAL_USDC_DEPOSIT;

  if (initialExchangeRate) {
    console.log(`⚙️  Setting initial exchange rate: ${initialExchangeRate}`);
    try {
      const tx = await usdcRewardContract.write.setExchangeRate([
        BigInt(initialExchangeRate),
      ]);
      console.log(`📝 Exchange rate set. Transaction hash: ${tx}`);
    } catch (error) {
      console.error("❌ Failed to set exchange rate:", error);
    }
  }

  if (initialUsdcDeposit) {
    console.log(`💰 Depositing initial USDC: ${initialUsdcDeposit}`);
    try {
      const tx = await usdcRewardContract.write.depositUSDC([
        BigInt(initialUsdcDeposit),
      ]);
      console.log(`📝 USDC deposited. Transaction hash: ${tx}`);
    } catch (error) {
      console.error("❌ Failed to deposit USDC:", error);
      console.log(
        "💡 Note: Make sure the deployer has sufficient USDC balance and has approved the contract"
      );
    }
  }

  console.log("🎉 Deployment and setup completed!");
  console.log(`📋 Contract Address: ${contractAddress}`);
  console.log(`🔗 Network: ${process.env.HARDHAT_NETWORK || "localhost"}`);

  return {
    contractAddress,
    usdcTokenAddress,
  };
}

// Execute the deployment if this script is run directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Deployment failed:", error);
      process.exit(1);
    });
}

export default main;
