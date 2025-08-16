import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

/**
 * Task to remove points from a user's balance
 * Usage: npx hardhat removePoints --user <user_address> --amount <points_amount> --network <network>
 */
task("removePoints", "Remove points from a user's balance")
  .addParam("user", "User address to remove points from")
  .addParam("amount", "Amount of points to remove")
  .setAction(
    async (
      taskArgs: { user: string; amount: string },
      hre: HardhatRuntimeEnvironment
    ) => {
      const { user, amount } = taskArgs;

      // Validate inputs
      if (!user) {
        throw new Error("User address is required");
      }

      if (!amount || isNaN(Number(amount))) {
        throw new Error("Valid amount is required");
      }

      const pointAmount = BigInt(amount);
      if (pointAmount <= 0) {
        throw new Error("Amount must be greater than 0");
      }

      // Get environment variables
      const contractAddress = process.env.CONTRACT_ADDRESS;
      if (!contractAddress) {
        throw new Error("CONTRACT_ADDRESS environment variable is required");
      }

      try {
        // Get signer
        const [signer] = await hre.viem.getWalletClients();
        const publicClient = await hre.viem.getPublicClient();

        // Get contract instance
        const contract = await hre.viem.getContractAt(
          "USDCRewardContract",
          contractAddress as `0x${string}`
        );

        console.log(`Removing ${amount} points from user: ${user}`);
        console.log(`Contract address: ${contractAddress}`);
        console.log(`Network: ${hre.network.name}`);

        // Check current balance before removal
        const currentBalance = await contract.read.getPointBalance([
          user as `0x${string}`,
        ]);
        console.log(`Current balance: ${currentBalance} points`);

        if (currentBalance < pointAmount) {
          throw new Error(
            `Insufficient points. Current balance: ${currentBalance}, trying to remove: ${pointAmount}`
          );
        }

        // Execute removePoints transaction
        const hash = await contract.write.removePoints([
          user as `0x${string}`,
          pointAmount,
        ]);

        console.log(`Transaction submitted: ${hash}`);

        // Wait for confirmation
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);

        // Get new balance
        const newBalance = await contract.read.getPointBalance([
          user as `0x${string}`,
        ]);
        console.log(`New balance: ${newBalance} points`);
        console.log(`Successfully removed ${pointAmount} points from user ${user}`);

        // Log transaction details
        console.log(`Gas used: ${receipt.gasUsed}`);
        console.log(`Transaction hash: ${hash}`);

      } catch (error) {
        console.error("Error removing points:", error);
        throw error;
      }
    }
  );
