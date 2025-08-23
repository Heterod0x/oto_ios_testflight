import "@nomicfoundation/hardhat-toolbox-viem";
import * as dotenv from "dotenv";
import type { HardhatUserConfig } from "hardhat/config";
import "./tasks";

dotenv.config();

const { PRIVATE_KEY, MAINNET_PRIVATE_KEY, ALCHEMY_API_KEY, BASESCAN_API_KEY } =
  process.env;

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.28",
        settings: {
          viaIR: true,
        },
      },
    ],
  },
  networks: {
    "base-sepolia": {
      url: `https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
      chainId: 84532,
    },
    base: {
      url: `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: MAINNET_PRIVATE_KEY !== undefined ? [MAINNET_PRIVATE_KEY] : [],
      chainId: 8453,
    },
    mainnet: {
      url: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
      chainId: 1,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: {
      "base-sepolia": BASESCAN_API_KEY || "",
      base: BASESCAN_API_KEY || "",
      mainnet: process.env.ETHERSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "base-sepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org",
        },
      },
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org",
        },
      },
    ],
  },
  sourcify: {
    enabled: true,
  },
};

export default config;
