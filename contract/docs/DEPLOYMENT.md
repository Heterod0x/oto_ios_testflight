# USDCRewardContract Deployment Guide

This guide explains how to deploy USDCRewardContract to various networks.

## 🌐 Supported Networks

- **base-sepolia** (default): Base Sepolia testnet
- **base**: Base mainnet
- **mainnet**: Ethereum mainnet
- **localhost**: Local development environment

## ⚙️ Environment Setup

### 1. Environment Variable Configuration

Create a `.env` file and set the following variables:

```bash
# Required
PRIVATE_KEY="your-private-key"
ALCHEMY_API_KEY="your-alchemy-api-key"
USDC_TOKEN_ADDRESS="usdc-token-address-for-target-network"

# Optional
CHAIN_NAME="base-sepolia"  # Default network
BASESCAN_API_KEY="your-basescan-api-key"
ETHERSCAN_API_KEY="your-etherscan-api-key"

# Initial configuration (optional)
INITIAL_EXCHANGE_RATE="1000000"  # 1 point = 1 USDC (6 decimals)
INITIAL_USDC_DEPOSIT="1000000000"  # 1000 USDC

# For verification
CONTRACT_ADDRESS="deployed-contract-address"
```

### 2. Network-Specific USDC Token Addresses

```bash
# Base Sepolia (for testing)
USDC_TOKEN_ADDRESS="0x036CbD53842c5426634e7929541eC2318f3dCF7e"

# Base Mainnet
USDC_TOKEN_ADDRESS="0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"

# Ethereum Mainnet
USDC_TOKEN_ADDRESS="0xA0b86a33E6441b8C4505B4afDcA7FBf074497C23"
```

## 🚀 Deployment Methods

### Method 1: Automated Deployment (Recommended)

Deploy directly to specific networks:

```bash
# Deploy to Base Sepolia
npm run deploy:base-sepolia

# Deploy to Base Mainnet
npm run deploy:base

# Deploy to local environment
npm run deploy:localhost
```

### Method 2: Manual Deployment

#### Step 1: Chain ID Verification

```bash
# Check current configuration
npx hardhat getChainInfo --network base-sepolia

# Check specific chain
npx hardhat getChainInfo --chain base-sepolia --network base-sepolia
```

#### Step 2: Execute Deployment

```bash
# Specify network via environment variable
CHAIN_NAME=base-sepolia npx hardhat run scripts/deploy-and-setup.ts --network base-sepolia

# Or full deployment (with verification)
CHAIN_NAME=base-sepolia npx hardhat run scripts/full-deployment.ts --network base-sepolia
```

#### Step 3: Deployment Verification

```bash
# Standalone verification
CONTRACT_ADDRESS=0x... npx hardhat run scripts/verify-deployment.ts

# Hardhat task verification
npx hardhat verifyDeployment --contract 0x... --chain base-sepolia --network base-sepolia
```

## 🔍 Dynamic Chain ID Resolution

This system determines Chain ID with the following priority:

1. **Explicit specification**: `--chain` parameter
2. **Hardhat network**: `--network` parameter
3. **Environment variable**: `CHAIN_NAME`
4. **Default**: `base-sepolia`

### Chain ID Verification Commands

```bash
# Check Chain ID with current configuration
npx hardhat getChainInfo

# Check Chain ID for specific network
npx hardhat getChainInfo --network base-sepolia

# Check Chain ID for specific chain
npx hardhat getChainInfo --chain base --network base
```

## 📋 Available Commands

### Deployment Related

```bash
npm run deploy:USDCReward          # Deploy with Ignition
npm run deploy:setup               # Deploy with initial setup
npm run deploy:full                # Full deployment (with verification)
npm run deploy:base-sepolia        # Deploy directly to Base Sepolia
npm run deploy:base                # Deploy directly to Base Mainnet
npm run deploy:localhost           # Deploy to local environment
```

### Verification Related

```bash
npm run verify:deployment          # Standalone verification
npm run verify:contract            # Hardhat task verification
```

### Utilities

```bash
npx hardhat getChainInfo           # Get chain information
npx hardhat getBalance             # Check balance
npx hardhat getUsdcBalance         # Check USDC balance
```

## 🛠️ Troubleshooting

### Chain ID Mismatch Error

```bash
❌ Chain ID mismatch! Expected: 84532, Actual: 1
```

**Solutions:**

1. Verify connection to the correct network
2. Check if `CHAIN_NAME` environment variable is set correctly
3. Ensure Hardhat's `--network` parameter is correct

### RPC Connection Error

```bash
❌ Failed to verify chain ID: HttpRequestError
```

**Solutions:**

1. Verify `ALCHEMY_API_KEY` is set correctly
2. Check if the network is available
3. Check if rate limits are being hit

### USDC Token Address Error

```bash
❌ USDC_TOKEN_ADDRESS environment variable is required
```

**Solutions:**

1. Set the correct USDC address for the target network
2. Verify `.env` file is being loaded correctly

## 📝 Post-Deployment Checklist

1. **Contract Address**: Record the deployed address
2. **Owner Verification**: Confirm deployment account is the Owner
3. **USDC Integration**: Verify USDC token integration is working
4. **Exchange Rate**: Set exchange rate if needed
5. **USDC Deposit**: Deposit initial USDC if required

## 🔗 Block Explorers

After deployment, you can verify contracts on the following explorers:

- **Base Sepolia**: https://sepolia.basescan.org
- **Base Mainnet**: https://basescan.org
- **Ethereum Mainnet**: https://etherscan.io
