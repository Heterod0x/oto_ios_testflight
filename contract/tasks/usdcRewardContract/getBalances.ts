import { task } from "hardhat/config";
import type { HardhatRuntimeEnvironment } from "hardhat/types";
import { formatUnits, getContract } from "viem";
import { ERC20_ABI } from "../../helpers/abi/ERC20";
import { getContractAddress } from "../../helpers/contractJsonHelper";

/**
 * 【Task】Get point and USDC balances for a user and contract
 * Usage: npx hardhat getBalances --user 0x... --network base-sepolia
 * If no user is specified, uses the first wallet address
 */
task("getBalances", "Get point and USDC balances")
  .addOptionalParam("user", "User address to check balances for")
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
    console.log(`Target Address: ${targetAddress}`);

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

      console.log("\n=== USER BALANCES ===");

      // Get user's point balance
      const pointBalance = await rewardContract.read.getPointBalance([
        targetAddress as `0x${string}`,
      ]);
      console.log(`Point Balance: ${pointBalance.toString()} points`);

      // Get user's USDC balance
      const userUsdcBalance = await usdcContract.read.balanceOf([
        targetAddress as `0x${string}`,
      ]);
      console.log(
        `${symbol} Balance: ${formatUnits(userUsdcBalance, decimals)} ${symbol}`
      );

      // Calculate potential USDC amount from points
      const potentialUsdcAmount = await rewardContract.read.calculateUSDCAmount(
        [pointBalance]
      );
      if (potentialUsdcAmount > 0n) {
        console.log(
          `Potential ${symbol} from points: ${formatUnits(
            potentialUsdcAmount,
            decimals
          )} ${symbol}`
        );
      } else {
        console.log("Exchange rate not set - cannot calculate potential USDC");
      }

      console.log("\n=== CONTRACT BALANCES ===");

      // Get contract's USDC balance
      const contractUsdcBalance = await usdcContract.read.balanceOf([
        rewardContractAddress as `0x${string}`,
      ]);
      console.log(
        `Contract ${symbol} Balance: ${formatUnits(
          contractUsdcBalance,
          decimals
        )} ${symbol}`
      );

      // Check if user can claim their points
      if (pointBalance > 0n && potentialUsdcAmount > 0n) {
        const canClaim = contractUsdcBalance >= potentialUsdcAmount;
        console.log(`Can claim all points: ${canClaim ? "Yes" : "No"}`);
        if (!canClaim) {
          console.log(
            `Contract needs ${formatUnits(
              potentialUsdcAmount - contractUsdcBalance,
              decimals
            )} more ${symbol} to fulfill claim`
          );
        }
      }
    } catch (error) {
      console.error("Error getting balances:", error);
    }

    console.log(
      "################################### [END] ###################################"
    );
  });
