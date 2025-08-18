import { task } from "hardhat/config";
import type { HardhatRuntimeEnvironment } from "hardhat/types";
import { getContractAddress } from "../../helpers/contractJsonHelper";

/**
 * 【Task】Pause the contract (only owner)
 * Usage: npx hardhat pauseContract --network base-sepolia
 * Note: When paused, user functions like claimUSDC are disabled, but admin functions remain available
 */
task("pauseContract", "Pause the contract").setAction(
  async (taskArgs, hre: HardhatRuntimeEnvironment) => {
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

    try {
      // Get contract instance
      const contract = await hre.viem.getContractAt(
        "USDCRewardContract",
        contractAddress as `0x${string}`
      );

      // Check current pause status
      const isPausedBefore = await contract.read.paused();
      console.log(`Contract paused status before: ${isPausedBefore}`);

      if (isPausedBefore) {
        console.log("Contract is already paused!");
        return;
      }

      // Pause the contract
      const hash = await contract.write.pause();

      console.log(`Transaction hash: ${hash}`);

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);

      // Check pause status after
      const isPausedAfter = await contract.read.paused();
      console.log(`Contract paused status after: ${isPausedAfter}`);

      console.log("Contract paused successfully!");
      console.log(
        "Note: User functions (claimUSDC) are now disabled, but admin functions remain available."
      );
    } catch (error) {
      console.error("Error pausing contract:", error);
    }

    console.log(
      "################################### [END] ###################################"
    );
  }
);
