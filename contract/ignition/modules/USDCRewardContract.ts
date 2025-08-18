import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const USDCRewardContractModule = buildModule(
  "USDCRewardContractModule",
  (m) => {
    // Get USDC token address from environment variable
    const usdcTokenAddress = m.getParameter(
      "usdcTokenAddress",
      process.env.USDC_TOKEN_ADDRESS
    );

    // Deploy USDCRewardContract with USDC token address
    const usdcRewardContract = m.contract("USDCRewardContract", [
      usdcTokenAddress,
    ]);

    return {
      usdcRewardContract,
    };
  }
);

export default USDCRewardContractModule;
