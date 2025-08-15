import { task } from "hardhat/config";
import type { HardhatRuntimeEnvironment } from "hardhat/types";
import { formatUnits, getContract } from "viem";
import { ERC20_ABI } from "../../helpers/abi/ERC20";
import { getContractAddress } from "../../helpers/contractJsonHelper";

/**
 * 【Task】Claim USDC by spending points
 * Usage: npx hardhat claimUSDC --points 100 --network base-sepolia
 * Usage: npx hardhat claimUSDC --points 100 --user 0x... --network base-sepolia (owner only)
 * Note: If no user is specified, uses the caller's address
 */
task("claimUSDC", "Claim USDC by spending points")
  .addParam("points", "Amount of points to spend for USDC")
  .addOptionalParam("user", "User address to claim for (owner only)")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    console.log(
      "################################### [START] ###################################"
    );

    const [caller] = await hre.viem.getWalletClients();
    const publicClient = await hre.viem.getPublicClient();
    const chainId = await publicClient.getChainId();

    // Determine target address
    let targetAddress: string;
    let isOwnerClaim = false;

    if (taskArgs.user) {
      // Owner claiming for another user
      targetAddress = taskArgs.user;
      isOwnerClaim = true;
    } else {
      // User claiming for themselves
      targetAddress = caller.account.address;
    }

    // Get contract addresses
    const rewardContractName = "USDCRewardContractModule#USDCRewardContract";
    const usdcContractName = "USDCModule#USDC";

    const rewardContractAddress = getContractAddress(
      chainId.toString(),
      rewardContractName
    );
    const usdcContractAddress = getContractAddress(
      chainId.toString(),
      usdcContractName
    );

    console.log(`Reward Contract Address: ${rewardContractAddress}`);
    console.log(`USDC Contract Address: ${usdcContractAddress}`);
    console.log(`Caller Address: ${caller.account.address}`);
    console.log(`Target Address: ${targetAddress}`);
    console.log(`Points to spend: ${taskArgs.points}`);
    console.log(`Is owner claim: ${isOwnerClaim}`);

    try {
      // Get contract instances
      const rewardContract = await hre.viem.getContractAt(
        "USDCRewardContract",
        rewardContractAddress as `0x${string}`
      );

      const usdcContract = getContract({
        address: usdcContractAddress as `0x${string}`,
        abi: ERC20_ABI,
        client: publicClient,
      });

      // Get USDC decimals and symbol
      const [decimals, symbol] = await Promise.all([
        usdcContract.read.decimals(),
        usdcContract.read.symbol(),
      ]);

      const pointsToSpend = BigInt(taskArgs.points);

      // Pre-claim checks
      console.log("\n=== PRE-CLAIM CHECKS ===");

      // Check user's point balance
      const currentPointBalance = await rewardContract.read.getPointBalance([
        targetAddress as `0x${string}`,
      ]);
      console.log(
        `Current point balance: ${currentPointBalance.toString()} points`
      );

      if (currentPointBalance < pointsToSpend) {
        throw new Error(
          `Insufficient points. Required: ${pointsToSpend}, Available: ${currentPointBalance}`
        );
      }

      // Calculate USDC amount
      const usdcAmount = await rewardContract.read.calculateUSDCAmount([
        pointsToSpend,
      ]);

      if (usdcAmount === 0n) {
        throw new Error("Exchange rate not set or points amount is 0");
      }

      console.log(
        `USDC to receive: ${formatUnits(usdcAmount, decimals)} ${symbol}`
      );

      // Check contract's USDC balance
      const contractUsdcBalance = await usdcContract.read.balanceOf([
        rewardContractAddress as `0x${string}`,
      ]);
      console.log(
        `Contract ${symbol} balance: ${formatUnits(
          contractUsdcBalance,
          decimals
        )} ${symbol}`
      );

      if (contractUsdcBalance < usdcAmount) {
        throw new Error(
          `Insufficient contract USDC balance. Required: ${formatUnits(
            usdcAmount,
            decimals
          )}, Available: ${formatUnits(contractUsdcBalance, decimals)}`
        );
      }

      // Get user's current USDC balance
      const userUsdcBalanceBefore = await usdcContract.read.balanceOf([
        targetAddress as `0x${string}`,
      ]);
      console.log(
        `User ${symbol} balance before: ${formatUnits(
          userUsdcBalanceBefore,
          decimals
        )} ${symbol}`
      );

      // Check if contract is paused
      const isPaused = await rewardContract.read.paused();
      if (isPaused) {
        throw new Error("Contract is currently paused");
      }

      console.log("\n=== EXECUTING CLAIM ===");

      // Execute claim
      let hash: `0x${string}`;

      if (isOwnerClaim) {
        // Owner claiming for another user - this would require a special function
        // For now, we'll assume the user needs to claim themselves
        throw new Error(
          "Owner claiming for other users is not supported. User must claim themselves."
        );
      } else {
        // User claiming for themselves
        hash = await rewardContract.write.claimUSDC([pointsToSpend]);
      }

      console.log(`Transaction hash: ${hash}`);

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);

      console.log("\n=== POST-CLAIM VERIFICATION ===");

      // Get updated balances
      const [newPointBalance, userUsdcBalanceAfter] = await Promise.all([
        rewardContract.read.getPointBalance([targetAddress as `0x${string}`]),
        usdcContract.read.balanceOf([targetAddress as `0x${string}`]),
      ]);

      console.log(
        `Updated point balance: ${newPointBalance.toString()} points`
      );
      console.log(
        `User ${symbol} balance after: ${formatUnits(
          userUsdcBalanceAfter,
          decimals
        )} ${symbol}`
      );

      const usdcReceived = userUsdcBalanceAfter - userUsdcBalanceBefore;
      console.log(
        `${symbol} received: ${formatUnits(usdcReceived, decimals)} ${symbol}`
      );

      const pointsSpent = currentPointBalance - newPointBalance;
      console.log(`Points spent: ${pointsSpent.toString()} points`);

      console.log("\n🎉 USDC claimed successfully!");
    } catch (error) {
      console.error("Error claiming USDC:", error);
    }

    console.log(
      "################################### [END] ###################################"
    );
  });
