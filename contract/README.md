# USDC Reward System - Smart Contract

The USDC Reward System is a smart contract that provides point-based rewards to users who upload conversation data. It implements a mechanism where administrators can manage user points, and users can exchange their points for USDC.

## 🌟 Key Features

- **Point Management**: Addition and transfer of user points by administrators
- **Exchange Rate Configuration**: Management of conversion rates from points to USDC
- **USDC Claims**: Exchange of points for USDC by users
- **USDC Supply Management**: Management of USDC balance within the contract by administrators
- **Access Control**: Administrator privileges and security features
- **Pause Functionality**: Emergency system shutdown capability

## 🛠️ Tech Stack

- **Solidity**: 0.8.28
- **Framework**: Hardhat 2.26.1
- **Libraries**: OpenZeppelin Contracts v5.0.0
- **Development Tools**: Viem, TypeScript, Prettier
- **Network**: Base Sepolia (ChainID: 84532)

## 📋 Prerequisites

- Node.js >= 23
- Bun (recommended) or npm
- ETH for Base Sepolia testnet
- USDC tokens (for testing)

## ⚙️ Setup

### 1. Install Dependencies

```bash
bun install
```

### 2. Environment Configuration

Create a `.env` file and set the following values:

```bash
# Required settings
PRIVATE_KEY="your-private-key-here"
MAINNET_PRIVATE_KEY="your-mainnet-key-here"
ALCHEMY_API_KEY="your-alchemy-api-key"
USDC_TOKEN_ADDRESS="0x036CbD53842c5426634e7929541eC2318f3dCF7e"  # Base Sepolia USDC

# Optional settings
BASESCAN_API_KEY="your-basescan-api-key"
ETHERSCAN_API_KEY="your-etherscan-api-key"
CHAIN_NAME="base-sepolia"

# Initial configuration values (optional)
INITIAL_EXCHANGE_RATE="1000000"      # 1 point = 0.001 USDC
INITIAL_USDC_DEPOSIT="1000000000"    # 1000 USDC

# For verification after deployment
CONTRACT_ADDRESS="deployed-contract-address"
```

### 3. Compile

```bash
bun run compile
```

## 🚀 Deployment

### Quick Deploy (Recommended)

```bash
# Configure USDC contract address for each network (switch these values per network)
# For base sepolia, set the following address
export USDC_TOKEN_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e
# For base mainnet, set the following address
export USDC_TOKEN_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
# Auto-deploy to Base Sepolia (with initial configuration)
bun run deploy:full --network base-sepolia
```

### Set Environment Variable After Deployment

```bash
export CONTRACT_ADDRESS=<deployed-address>
```

Additionally, set the USDC address in `deployed_addresses.json`

For Base Sepolia:

```json
{
  "USDCModule#USDC": "0x036CbD53842c5426634e7929541eC2318f3dCF7e"
}
```

For Base Mainnet:

```json
{
  "USDCModule#USDC": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
}
```

### Contract Verification

```bash
bun run verify chain-84532
```

For detailed deployment instructions, refer to [DEPLOYMENT.md](./DEPLOYMENT.md).

## 🧪 Testing

### Run All Tests

```bash
bun run test
```

### Check Coverage

```bash
bun run coverage
```

## 📖 Contract Usage

### Administrator Functions

#### Point Management

```bash
# Add points to a user
bun run addPoints --user 0x51908F598A5e0d8F1A3bAbFa6DF76F9704daD072 --amount 1000 --network base-sepolia
# Subtract points from a user
bun run subtractPoints --user 0x51908F598A5e0d8F1A3bAbFa6DF76F9704daD072 --amount 500 --network base-sepolia
```

#### Exchange Rate Configuration

```bash
# Set exchange rate (1 point = 0.1 USDC)
bun run setExchangeRate --rate 100000 --network base-sepolia
```

#### USDC Supply Management

```bash
# Deposit USDC to contract
bun run depositUSDC --amount 10 --network base-sepolia

# Withdraw USDC from contract
bun run withdrawUSDC --amount 1 --network base-sepolia
```

#### System Management

```bash
# Pause the contract
bun run pauseContract --network base-sepolia

# Unpause the contract
bun run unpauseContract --network base-sepolia

# Transfer ownership
bun run transferOwnership --newowner 0x1431ea8af860C3862A919968C71f901aEdE1910E --network base-sepolia
```

### User Functions

#### Balance Check

```bash
# Check point balance and USDC balance
bun run getBalances --user 0x51908F598A5e0d8F1A3bAbFa6DF76F9704daD072 --network base-sepolia
```

#### USDC Claim

Call the contract's `claimUSDC` function directly or execute through a frontend application.

```bash
# Claim USDC (default: 1 point = 1 USDC)
bun run claimUSDC --points 1 --network base-sepolia
```

### Get Total Claimed Points

```bash
bun run getTotalClaimedPoints --user 0x51908F598A5e0d8F1A3bAbFa6DF76F9704daD072 --network base-sepolia
```

## 🔧 Development Tools

### Code Formatting

```bash
bun run format
```

### Compilation

```bash
bun run compile
```

### Cleanup

```bash
bun run clean
```

### Local Development Environment

```bash
# Start local Hardhat node
bun run local

# Deploy to local environment in another terminal
bun run deploy:localhost
```

## 📊 Contract Specifications

### Main Functions

#### Administrator-Only Functions

- `addPoints(address user, uint256 amount)`: Add points to a user
- `subtractPoints(address user, uint256 amount)`: Subtract points from a user
- `setExchangeRate(uint256 rate)`: Set exchange rate
- `depositUSDC(uint256 amount)`: Deposit USDC to contract
- `withdrawUSDC(uint256 amount)`: Withdraw USDC from contract
- `pause()`: Pause the contract
- `unpause()`: Unpause the contract

#### User Functions

- `claimUSDC(uint256 pointAmount)`: Exchange points for USDC
- `getPointBalance(address user)`: Check point balance
- `calculateUSDCAmount(uint256 pointAmount)`: Calculate USDC amount corresponding to points

### Events

- `PointsAdded(address indexed user, uint256 amount)`
- `PointsRemoved(address indexed user, uint256 amount)`
- `ExchangeRateSet(uint256 newRate)`
- `USDCClaimed(address indexed user, uint256 pointsUsed, uint256 usdcAmount)`
- `USDCDeposited(uint256 amount)`
- `USDCWithdrawn(uint256 amount)`
- `ContractPaused()`
- `ContractUnpaused()`

### Custom Errors

- `InsufficientPoints(uint256 required, uint256 available)`
- `InsufficientUSDCBalance(uint256 required, uint256 available)`
- `InvalidAddress()`
- `InvalidAmount()`
- `ExchangeRateNotSet()`
- `Unauthorized()`
- `ContractPaused()`

## 🔒 Security Features

- **Access Control**: Administrator privilege management via OpenZeppelin Ownable
- **Reentrancy Prevention**: Attack prevention via ReentrancyGuard
- **Pause Functionality**: Emergency stop capability via Pausable
- **Input Validation**: Validation for zero addresses and zero amounts
- **Integer Overflow Prevention**: Built-in protection in Solidity 0.8.x

## 🌐 Network Information

### Base Sepolia (Testnet)

- **Chain ID**: 84532
- **RPC URL**: Via Alchemy
- **USDC Address**: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- **Explorer**: https://sepolia.basescan.org

### Base Mainnet

- **Chain ID**: 8453
- **USDC Address**: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- **Explorer**: https://basescan.org

## 🐛 Troubleshooting

### Common Issues

1. **Chain ID Mismatch Error**

   ```bash
   ❌ Chain ID mismatch! Expected: 84532, Actual: 1
   ```

   → Check if you're connected to the correct network

2. **Insufficient USDC Balance Error**

   ```bash
   ❌ InsufficientUSDCBalance
   ```

   → Deposit USDC to the contract

3. **Authorization Error**
   ```bash
   ❌ Unauthorized
   ```
   → Confirm you're executing with the administrator account

## 📚 References

- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Base Network Documentation](https://docs.base.org/)
- [Viem Documentation](https://viem.sh/)
