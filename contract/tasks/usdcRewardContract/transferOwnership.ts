import { task } from "hardhat/config";
import type { HardhatRuntimeEnvironment } from "hardhat/types";
import { getContractAddress } from "../../helpers/contractJsonHelper";

/**
 * 【Task】Transfer ownership of the contract (only owner)
 * Usage: npx hardhat transferOwnership --newowner 0x... --network base-sepolia
 * Note: Using OpenZeppelin Ownable, ownership is transferred immediately.
 */
task("transferOwnership", "Transfer ownership of the contract")
  .addParam("newowner", "New owner address")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    console.log(
      "################################### [START] ###################################"
    );

    const [currentOwner] = await hre.viem.getWalletClients();
    const publicClient = await hre.viem.getPublicClient();
    const chainId = await publicClient.getChainId();

    // Get contract address
    const contractName = "USDCRewardContractModule#USDCRewardContract";
    const contractAddress = getContractAddress(
      chainId.toString(),
      contractName
    );

    console.log(`Contract Address: ${contractAddress}`);
    console.log(`Current Owner Address: ${currentOwner.account.address}`);
    console.log(`New Owner Address: ${taskArgs.newowner}`);

    try {
      // Get contract instance
      const contract = await hre.viem.getContractAt(
        "USDCRewardContract",
        contractAddress as `0x${string}`
      );

      // Check current owner
      const ownerBefore = await contract.read.owner();
      console.log(`Current contract owner: ${ownerBefore}`);

      if (
        ownerBefore.toLowerCase() !== currentOwner.account.address.toLowerCase()
      ) {
        throw new Error("You are not the current owner of this contract");
      }

      if (taskArgs.newowner.toLowerCase() === ownerBefore.toLowerCase()) {
        console.log(
          "New owner is the same as current owner. No transfer needed."
        );
        return;
      }

      // Transfer ownership
      const hash = await contract.write.transferOwnership([
        taskArgs.newowner as `0x${string}`,
      ]);

      console.log(`Transaction hash: ${hash}`);

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);

      // Check new owner (OpenZeppelin Ownable pattern)
      const ownerAfter = await contract.read.owner();
      console.log(`New contract owner: ${ownerAfter}`);

      if (ownerAfter.toLowerCase() === taskArgs.newowner.toLowerCase()) {
        console.log("Ownership transferred successfully!");
      } else {
        console.log(
          "Warning: Ownership transfer may not have completed properly."
        );
      }
    } catch (error) {
      console.error("Error transferring ownership:", error);
    }

    console.log(
      "################################### [END] ###################################"
    );
  });
