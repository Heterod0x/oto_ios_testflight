import { task } from "hardhat/config";
import type { HardhatRuntimeEnvironment } from "hardhat/types";
import { getContractAddress } from "../../helpers/contractJsonHelper";

/**
 * 【Task】Set exchange rate from points to USDC (only owner)
 * Usage: npx hardhat setExchangeRate --rate 1000000 --network base-sepolia
 * Note: Rate is in USDC wei. For example, 1000000 means 1 point = 0.001 USDC
 */
task("setExchangeRate", "Set exchange rate from points to USDC")
  .addParam("rate", "Exchange rate (1 point = rate USDC wei)")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    console.log(
      "################################### [START] ###################################"
    );

    const [owner] = await hre.viem.getWalletClients();
    const publicClient = await hre.viem.getPublicClient();
    const chainId = await publicClient.getChainId();

    // Get contract address
    const contractName = "USDCRewardContractModule#USDCRewardContract";
    const contractAddress = getContractAddress(
      chainId.toString(),
      contractName
    );

    console.log(`Contract Address: ${contractAddress}`);
    console.log(`Owner Address: ${owner.account.address}`);
    console.log(`Exchange Rate: ${taskArgs.rate} USDC wei per point`);

    // Convert rate to human readable format (assuming USDC has 6 decimals)
    const rateInUsdc = Number(taskArgs.rate) / 1000000;
    console.log(`Exchange Rate (human readable): 1 point = ${rateInUsdc} USDC`);

    try {
      // Get contract instance
      const contract = await hre.viem.getContractAt(
        "USDCRewardContract",
        contractAddress as `0x${string}`
      );

      // Set exchange rate
      const hash = await contract.write.setExchangeRate([
        BigInt(taskArgs.rate),
      ]);

      console.log(`Transaction hash: ${hash}`);

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);

      console.log("Exchange rate updated successfully!");
    } catch (error) {
      console.error("Error setting exchange rate:", error);
    }

    console.log(
      "################################### [END] ###################################"
    );
  });
