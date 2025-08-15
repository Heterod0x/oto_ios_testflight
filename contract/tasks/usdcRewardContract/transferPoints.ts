import { task } from "hardhat/config";
import type { HardhatRuntimeEnvironment } from "hardhat/types";
import { getContractAddress } from "../../helpers/contractJsonHelper";

/**
 * 【Task】Transfer points from a user's balance (only owner)
 * Usage: npx hardhat transferPoints --user 0x... --amount 500 --network base-sepolia
 */
task("transferPoints", "Transfer points from a user's balance")
  .addParam("user", "User address to transfer points from")
  .addParam("amount", "Amount of points to transfer")
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
    console.log(`Points to transfer: ${taskArgs.amount}`);

    try {
      // Get contract instance
      const contract = await hre.viem.getContractAt(
        "USDCRewardContract",
        contractAddress as `0x${string}`
      );

      // Get current balance before transfer
      const balanceBefore = await contract.read.getPointBalance([
        taskArgs.user as `0x${string}`,
      ]);
      console.log(`Current point balance: ${balanceBefore.toString()}`);

      // Transfer points
      const hash = await contract.write.transferPoints([
        taskArgs.user as `0x${string}`,
        BigInt(taskArgs.amount),
      ]);

      console.log(`Transaction hash: ${hash}`);

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);

      // Get updated balance
      const balanceAfter = await contract.read.getPointBalance([
        taskArgs.user as `0x${string}`,
      ]);
      console.log(`Updated point balance: ${balanceAfter.toString()}`);
    } catch (error) {
      console.error("Error transferring points:", error);
    }

    console.log(
      "################################### [END] ###################################"
    );
  });
