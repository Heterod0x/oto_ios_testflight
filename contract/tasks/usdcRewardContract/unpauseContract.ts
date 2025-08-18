import { task } from "hardhat/config";
import type { HardhatRuntimeEnvironment } from "hardhat/types";
import { getContractAddress } from "../../helpers/contractJsonHelper";

/**
 * 【Task】Unpause the contract (only owner)
 * Usage: npx hardhat unpauseContract --network base-sepolia
 * Note: Restores normal contract functionality
 */
task("unpauseContract", "Unpause the contract").setAction(
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

      if (!isPausedBefore) {
        console.log("Contract is already unpaused!");
        return;
      }

      // Unpause the contract
      const hash = await contract.write.unpause();

      console.log(`Transaction hash: ${hash}`);

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);

      // Check pause status after
      const isPausedAfter = await contract.read.paused();
      console.log(`Contract paused status after: ${isPausedAfter}`);

      console.log("Contract unpaused successfully!");
      console.log("Note: All contract functions are now available.");
    } catch (error) {
      console.error("Error unpausing contract:", error);
    }

    console.log(
      "################################### [END] ###################################"
    );
  }
);
