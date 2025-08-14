import { task } from "hardhat/config";
import type { HardhatRuntimeEnvironment } from "hardhat/types";
import { formatUnits, getContract, parseUnits } from "viem";
import { ERC20_ABI } from "../../helpers/abi/ERC20";
import { getContractAddress } from "../../helpers/contractJsonHelper";

/**
 * 【Task】Transfer USDC to specified address
 * Usage: npx hardhat transferUsdc --to 0x... --amount 10.5 --network base-sepolia
 */
task("transferUsdc", "Transfer USDC to specified address")
  .addParam("to", "Recipient address")
  .addParam("amount", "Amount to transfer (in USDC, e.g., 10.5)")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    console.log(
      "################################### [START] ###################################"
    );

    const [wallet] = await hre.viem.getWalletClients();
    const publicClient = await hre.viem.getPublicClient();
    const networkName = hre.network.name;
    const chainId = await publicClient.getChainId();

    // get contract name
    const contractName = "USDCModule#USDC";
    // get contract address
    const contractAddress = getContractAddress(
      chainId.toString(),
      contractName
    );

    const toAddress = taskArgs.to;
    const amount = taskArgs.amount;

    console.log(`From: ${wallet.account.address}`);
    console.log(`To: ${toAddress}`);
    console.log(`Amount: ${amount} USDC`);

    try {
      // Create contract instances
      const usdcContractRead = getContract({
        address: contractAddress as `0x${string}`,
        abi: ERC20_ABI,
        client: publicClient,
      });

      const usdcContractWrite = getContract({
        address: contractAddress as `0x${string}`,
        abi: ERC20_ABI,
        client: wallet,
      });

      // Get decimals and current balance
      const [decimals, symbol, senderBalance] = await Promise.all([
        usdcContractRead.read.decimals(),
        usdcContractRead.read.symbol(),
        usdcContractRead.read.balanceOf([wallet.account.address]),
      ]);

      const formattedSenderBalance = formatUnits(senderBalance, decimals);
      console.log(`Current ${symbol} balance: ${formattedSenderBalance}`);

      // Parse amount to wei
      const amountInWei = parseUnits(amount, decimals);

      // Check if sender has enough balance
      if (senderBalance < amountInWei) {
        throw new Error(
          `Insufficient balance. Required: ${amount} ${symbol}, Available: ${formattedSenderBalance} ${symbol}`
        );
      }

      console.log(`Transferring ${amount} ${symbol}...`);

      // Execute transfer
      const txHash = await usdcContractWrite.write.transfer([
        toAddress,
        amountInWei,
      ]);

      console.log(`Transaction hash: ${txHash}`);
      console.log("Waiting for transaction confirmation...");

      // Wait for transaction receipt
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });

      console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
      console.log(`Gas used: ${receipt.gasUsed}`);

      // Get updated balances
      const [newSenderBalance, recipientBalance] = await Promise.all([
        usdcContractRead.read.balanceOf([wallet.account.address]),
        usdcContractRead.read.balanceOf([toAddress]),
      ]);

      console.log(
        `New sender balance: ${formatUnits(
          newSenderBalance,
          decimals
        )} ${symbol}`
      );
      console.log(
        `Recipient balance: ${formatUnits(
          recipientBalance,
          decimals
        )} ${symbol}`
      );

      console.log(
        `✅ Successfully transferred ${amount} ${symbol} to ${toAddress}`
      );
    } catch (error) {
      console.error("Error transferring USDC:", error);
      throw error;
    }

    console.log(
      "################################### [END] ###################################"
    );
  });
