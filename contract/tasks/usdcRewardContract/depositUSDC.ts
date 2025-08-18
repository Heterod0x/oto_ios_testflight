import { task } from "hardhat/config";
import type { HardhatRuntimeEnvironment } from "hardhat/types";
import { formatUnits, getContract, parseUnits } from "viem";
import { ERC20_ABI } from "../../helpers/abi/ERC20";
import { getContractAddress } from "../../helpers/contractJsonHelper";

/**
 * 【Task】Deposit USDC to the contract (only owner)
 * Usage: npx hardhat depositUSDC --amount 1000 --network base-sepolia
 * Note: Amount is in USDC (e.g., 1000 means 1000 USDC)
 */
task("depositUSDC", "Deposit USDC to the contract")
  .addParam("amount", "Amount of USDC to deposit")
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
    console.log(`Amount to deposit: ${taskArgs.amount} USDC`);

    try {
      // Get contract instances
      const rewardContract = await hre.viem.getContractAt(
        "USDCRewardContract",
        rewardContractAddress as `0x${string}`
      );

      const usdcContract = getContract({
        address: usdcContractAddress as `0x${string}`,
        abi: ERC20_ABI,
        client: { public: publicClient, wallet: owner },
      });

      // Get USDC decimals
      const decimals = await usdcContract.read.decimals();
      const amountInWei = parseUnits(taskArgs.amount, decimals);

      console.log(`Amount in wei: ${amountInWei.toString()}`);

      // Check owner's USDC balance
      const ownerBalance = await usdcContract.read.balanceOf([
        owner.account.address,
      ]);
      console.log(
        `Owner USDC balance: ${formatUnits(ownerBalance, decimals)} USDC`
      );

      if (ownerBalance < amountInWei) {
        throw new Error("Insufficient USDC balance");
      }

      // Check current allowance
      const currentAllowance = await usdcContract.read.allowance([
        owner.account.address,
        rewardContractAddress as `0x${string}`,
      ]);
      console.log(
        `Current allowance: ${formatUnits(currentAllowance, decimals)} USDC`
      );

      // If current allowance is insufficient, approve the required amount
      if (currentAllowance < amountInWei) {
        console.log("Approving USDC spending...");

        // Some tokens require resetting allowance to 0 first
        if (currentAllowance > 0n) {
          console.log("Resetting allowance to 0...");
          const resetHash = await usdcContract.write.approve([
            rewardContractAddress as `0x${string}`,
            0n,
          ]);
          await publicClient.waitForTransactionReceipt({ hash: resetHash });
          console.log(`Reset approval transaction hash: ${resetHash}`);
        }

        const approveHash = await usdcContract.write.approve([
          rewardContractAddress as `0x${string}`,
          amountInWei,
        ]);
        await publicClient.waitForTransactionReceipt({ hash: approveHash });
        console.log(`Approval transaction hash: ${approveHash}`);

        // Verify allowance after approval
        const newAllowance = await usdcContract.read.allowance([
          owner.account.address,
          rewardContractAddress as `0x${string}`,
        ]);
        console.log(
          `New allowance: ${formatUnits(newAllowance, decimals)} USDC`
        );

        if (newAllowance < amountInWei) {
          throw new Error(
            `Approval failed. Required: ${formatUnits(
              amountInWei,
              decimals
            )}, Available: ${formatUnits(newAllowance, decimals)}`
          );
        }
      } else {
        console.log("Sufficient allowance already exists");
      }

      // Deposit USDC
      console.log("Depositing USDC...");
      const depositHash = await rewardContract.write.depositUSDC([amountInWei]);

      console.log(`Deposit transaction hash: ${depositHash}`);

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: depositHash,
      });
      console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);

      // Check contract's USDC balance
      const contractBalance = await usdcContract.read.balanceOf([
        rewardContractAddress as `0x${string}`,
      ]);
      console.log(
        `Contract USDC balance: ${formatUnits(contractBalance, decimals)} USDC`
      );

      console.log("USDC deposited successfully!");
    } catch (error) {
      console.error("Error depositing USDC:", error);
    }

    console.log(
      "################################### [END] ###################################"
    );
  });
