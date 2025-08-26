import { usePrivy } from "@privy-io/expo";
import abi from "../contracts/base_abi.json";
import { useSmartWallets } from "@privy-io/expo/smart-wallets";
import { encodeFunctionData } from "viem";

export function useBaseContract() {
  const { user } = usePrivy();
  const { client } = useSmartWallets();

  const claimUSDC = async (amount: number) => {
    if (
      user &&
      user.linked_accounts &&
      user.linked_accounts.findIndex((f) => f.type === "smart_wallet") >= 0
    ) {
      // smart wallet
      if (client) {
        try {
          // const client = await smartWallets.getClientForChain({
          //   chainId: 84532,
          // }); // base-sepolia
          const fndata = encodeFunctionData({
            abi: abi.abi,
            functionName: "claimUSDC",
            args: [amount],
          });
          const tx = await client.sendTransaction({
            account: client.account,
            calls: [
              {
                to: "0xB445f1c6FD6BD19Fe196A5894D12F46b66e5Ad29" as `0x${string}`,
                data: fndata,
              },
            ],
          });
          return tx;
        } catch (error) {
          console.error("Error getting client or sending transaction:", error);
          throw error;
        }
      } else {
        console.error("SmartWallets not available");
        throw new Error("SmartWallets not available");
      }
    } else {
      alert("Non-smart wallet not supported yet");
      return null;
    }
  };

  return {
    claimUSDC,
  };
}
