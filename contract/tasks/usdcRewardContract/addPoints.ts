import { task } from "hardhat/config";
import type { HardhatRuntimeEnvironment } from "hardhat/types";
import { getContractAddress } from "../../helpers/contractJsonHelper";

/**
 * 【Task】Add points to a user's balance (only owner)
 * Usage: npx hardhat addPoints --user 0x... --amount 1000 --network base-sepolia
 */
task("addPoints", "Add points to a user's balance")
  .addParam("user", "User address to add points to")
  .addParam("amount", "Amount of points to add")
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
    console.log(`User Address: ${taskArgs.user}`);
    console.log(`Points to add: ${taskArgs.amount}`);

    try {
      // Get contract instance
      const contract = await hre.viem.getContractAt(
        "USDCRewardContract",
        contractAddress as `0x${string}`
      );

      // Add points
      const hash = await contract.write.addPoints([
        taskArgs.user as `0x${string}`,
        BigInt(taskArgs.amount),
      ]);

      console.log(`Transaction hash: ${hash}`);

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);

      // Get updated balance
      const balance = await contract.read.getPointBalance([
        taskArgs.user as `0x${string}`,
      ]);
      console.log(`Updated point balance: ${balance.toString()}`);
    } catch (error) {
      console.error("Error adding points:", error);
    }

    console.log(
      "################################### [END] ###################################"
    );
  });
