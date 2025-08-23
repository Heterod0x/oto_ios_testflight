import { task } from "hardhat/config";
import type { HardhatRuntimeEnvironment } from "hardhat/types";
import { getContractAddress } from "../../helpers/contractJsonHelper";

/**
 * 【Task】Get total claimed points for a user
 * Usage: npx hardhat getTotalClaimedPoints --user 0x... --network base-sepolia
 * If no user is specified, uses the first wallet address
 */
task("getTotalClaimedPoints", "Get total claimed points for a user")
  .addOptionalParam("user", "User address to check total claimed points for")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    console.log(
      "################################### [START] ###################################"
    );

    const [owner] = await hre.viem.getWalletClients();
    const publicClient = await hre.viem.getPublicClient();
    const chainId = await publicClient.getChainId();

    // Use provided address or default to first wallet
    let targetAddress: string;
    if (taskArgs.user) {
      targetAddress = taskArgs.user;
    } else {
      targetAddress = owner.account.address;
    }

    // Get contract address
    const rewardContractName = "USDCRewardContractModule#USDCRewardContract";
    const rewardContractAddress = getContractAddress(
      chainId.toString(),
      rewardContractName
    );

    console.log(`Reward Contract Address: ${rewardContractAddress}`);
    console.log(`Target Address: ${targetAddress}`);

    try {
      // Get contract instance
      const rewardContract = await hre.viem.getContractAt(
        "USDCRewardContract",
        rewardContractAddress as `0x${string}`
      );

      // Get user's total claimed points
      const totalClaimedPoints = await rewardContract.read.getTotalClaimedPoints([
        targetAddress as `0x${string}`,
      ]);
      console.log(`Total Claimed Points: ${totalClaimedPoints.toString()} points`);

    } catch (error) {
      console.error("Error getting total claimed points:", error);
    }

    console.log(
      "################################### [END] ###################################"
    );
  });
