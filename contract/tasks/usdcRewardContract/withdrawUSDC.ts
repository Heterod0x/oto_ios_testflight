import { task } from "hardhat/config";
import type { HardhatRuntimeEnvironment } from "hardhat/types";
import { formatUnits, getContract, parseUnits } from "viem";
import { ERC20_ABI } from "../../helpers/abi/ERC20";
import { getContractAddress } from "../../helpers/contractJsonHelper";

/**
 * 【Task】Withdraw USDC from the contract (only owner)
 * Usage: npx hardhat withdrawUSDC --amount 500 --network base-sepolia
 * Note: Amount is in USDC (e.g., 500 means 500 USDC)
 */
task("withdrawUSDC", "Withdraw USDC from the contract")
  .addParam("amount", "Amount of USDC to withdraw")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    console.log(
      "################################### [START] ###################################"
    );

    const [owner] = await hre.viem.getWalletClients();
    const publicClient = await hre.viem.getPublicClient();
    const chainId = await publicClient.getChainId();

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
    console.log(`Owner Address: ${owner.account.address}`);
    console.log(`Amount to withdraw: ${taskArgs.amount} USDC`);

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

      // Get USDC decimals
      const decimals = await usdcContract.read.decimals();
      const amountInWei = parseUnits(taskArgs.amount, decimals);

      console.log(`Amount in wei: ${amountInWei.toString()}`);

      // Check contract's USDC balance before withdrawal
      const contractBalanceBefore = await usdcContract.read.balanceOf([
        rewardContractAddress as `0x${string}`,
      ]);
      console.log(
        `Contract USDC balance before: ${formatUnits(
          contractBalanceBefore,
          decimals
        )} USDC`
      );

      if (contractBalanceBefore < amountInWei) {
        throw new Error("Insufficient contract USDC balance");
      }

      // Check owner's USDC balance before withdrawal
      const ownerBalanceBefore = await usdcContract.read.balanceOf([
        owner.account.address,
      ]);
      console.log(
        `Owner USDC balance before: ${formatUnits(
          ownerBalanceBefore,
          decimals
        )} USDC`
      );

      // Withdraw USDC
      const hash = await rewardContract.write.withdrawUSDC([amountInWei]);

      console.log(`Transaction hash: ${hash}`);

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);

      // Check balances after withdrawal
      const contractBalanceAfter = await usdcContract.read.balanceOf([
        rewardContractAddress as `0x${string}`,
      ]);
      const ownerBalanceAfter = await usdcContract.read.balanceOf([
        owner.account.address,
      ]);

      console.log(
        `Contract USDC balance after: ${formatUnits(
          contractBalanceAfter,
          decimals
        )} USDC`
      );
      console.log(
        `Owner USDC balance after: ${formatUnits(
          ownerBalanceAfter,
          decimals
        )} USDC`
      );

      console.log("USDC withdrawn successfully!");
    } catch (error) {
      console.error("Error withdrawing USDC:", error);
    }

    console.log(
      "################################### [END] ###################################"
    );
  });
