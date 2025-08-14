import { task } from "hardhat/config";
import type { HardhatRuntimeEnvironment } from "hardhat/types";
import { formatUnits, getContract } from "viem";
import { ERC20_ABI } from "../../helpers/abi/ERC20";
import { getContractAddress } from "../../helpers/contractJsonHelper";

/**
 * 【Task】Get USDC balance of specified address
 * Usage: npx hardhat getUsdcBalance --address 0x... --network base-sepolia
 */
task("getUsdcBalance", "Get USDC balance of specified address")
  .addOptionalParam("address", "Address to check balance for")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    console.log(
      "################################### [START] ###################################"
    );

    const publicClient = await hre.viem.getPublicClient();
    const chainId = await publicClient.getChainId();
    // get contract name
    const contractName = "USDCModule#USDC";
    // get contract address
    const contractAddress = getContractAddress(
      chainId.toString(),
      contractName
    );

    // Use provided address or default to first wallet
    let targetAddress: string;
    if (taskArgs.address) {
      targetAddress = taskArgs.address;
    } else {
      const [owner] = await hre.viem.getWalletClients();
      targetAddress = owner.account.address;
    }

    console.log(`Checking USDC balance for address: ${targetAddress}`);

    try {
      console.log(`USDC Contract Address: ${contractAddress}`);

      // Create contract instance
      const usdcContract = getContract({
        address: contractAddress as `0x${string}`,
        abi: ERC20_ABI,
        client: publicClient,
      });

      // Get balance and decimals
      const [balance, decimals, symbol] = await Promise.all([
        usdcContract.read.balanceOf([targetAddress as `0x${string}`]),
        usdcContract.read.decimals(),
        usdcContract.read.symbol(),
      ]);

      const formattedBalance = formatUnits(balance, decimals);

      console.log(`${symbol} Balance: ${formattedBalance}`);
    } catch (error) {
      console.error("Error getting USDC balance:", error);
    }

    console.log(
      "################################### [END] ###################################"
    );
  });
