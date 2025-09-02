# USDCRewardContract API Specification

## Overview

USDCRewardContract is a smart contract that provides point-based rewards to users who upload conversation data. It offers functionality for administrators to manage user points and for users to exchange their points for USDC.

## Contract Information

- **Contract Name**: USDCRewardContract
- **Solidity Version**: ^0.8.28
- **Inheritance**: Ownable, Pausable, ReentrancyGuard
- **License**: MIT

## State Variables

### Private Variables

| Variable Name   | Type                          | Description                                                         |
| --------------- | ----------------------------- | ------------------------------------------------------------------- |
| `pointBalances` | `mapping(address => uint256)` | Mapping of user addresses to point balances                         |
| `exchangeRate`  | `uint256`                     | Exchange rate from points to USDC (1 point = exchangeRate USDC wei) |
| `usdcToken`     | `IERC20`                      | Interface to the USDC token contract                                |

## Function Specifications

### Constructor

#### `constructor(address _usdcToken)`

Initializes the contract.

**Parameters:**

- `_usdcToken` (address): Address of the USDC token contract

**Constraints:**

- `_usdcToken` must not be the zero address

**Errors:**

- `InvalidAddress()`: When USDC token address is the zero address

**Initialization:**

- `exchangeRate` is set to 0 (requires administrator configuration)
- Deployer is set as the initial owner

---

### Point Management Functions

#### `addPoints(address user, uint256 amount)` 🔒

Increases a user's point balance.

**Access Control:** `onlyOwner`

**Parameters:**

- `user` (address): Address of the user to add points to
- `amount` (uint256): Number of points to add

**Constraints:**

- `user` must not be the zero address
- `amount` must be greater than 0

**Errors:**

- `InvalidAddress()`: When user address is the zero address
- `InvalidAmount()`: When amount is 0

**Events:**

- `PointsAdded(address indexed user, uint256 amount)`

**Usage Example:**

```solidity
// Add 1000 points to user
contract.addPoints(0x1234567890123456789012345678901234567890, 1000);
```

---

#### `subtractPoints(address user, uint256 amount)` 🔒

Subtracts from a user's point balance (point deduction process).

**Access Control:** `onlyOwner`

**Parameters:**

- `user` (address): Address of the user to subtract points from
- `amount` (uint256): Number of points to subtract

**Constraints:**

- `user` must not be the zero address
- `amount` must be greater than 0
- User's balance must be at least `amount`

**Errors:**

- `InvalidAddress()`: When user address is the zero address
- `InvalidAmount()`: When amount is 0
- `InsufficientPoints(uint256 required, uint256 available)`: When point balance is insufficient

**Events:**

- `PointsRemoved(address indexed user, uint256 amount)`

**Usage Example:**

```solidity
// Subtract 300 points from user
contract.subtractPoints(0x1234567890123456789012345678901234567890, 300);
```

---

#### `getPointBalance(address user)` 👁️

Retrieves a user's point balance.

**Access Control:** None (view function)

**Parameters:**

- `user` (address): Address of the user to check balance for

**Return Value:**

- `uint256`: User's point balance

**Usage Example:**

```solidity
// Check user's point balance
uint256 balance = contract.getPointBalance(0x1234567890123456789012345678901234567890);
```

---

### Exchange Rate Management Functions

#### `setExchangeRate(uint256 rate)` 🔒

Sets the exchange rate from points to USDC.

**Access Control:** `onlyOwner`

**Parameters:**

- `rate` (uint256): New exchange rate (1 point = rate USDC wei)

**Note:**

- When `rate` is 0, USDC claims become invalid
- Since USDC has 6 decimal precision, proper rate setting is crucial

**Events:**

- `ExchangeRateSet(uint256 newRate)`

**Usage Examples:**

```solidity
// Set 1 point = 0.001 USDC (1,000,000 wei)
contract.setExchangeRate(1000000);

// Set 1 point = 1 USDC (1,000,000,000,000 wei)
contract.setExchangeRate(1000000000000);
```

---

#### `calculateUSDCAmount(uint256 pointAmount)` 👁️

Calculates the USDC amount corresponding to the specified number of points.

**Access Control:** None (view function)

**Parameters:**

- `pointAmount` (uint256): Number of points to convert

**Return Value:**

- `uint256`: Corresponding USDC amount (in wei)

**Note:**

- Returns 0 when exchange rate is 0

**Usage Example:**

```solidity
// Calculate USDC amount for 1000 points
uint256 usdcAmount = contract.calculateUSDCAmount(1000);
```

---

### USDC Claim Functions

#### `claimUSDC(uint256 pointAmount)` ⏸️🔒

Allows users to exchange points for USDC.

**Access Control:** `whenNotPaused`, `nonReentrant`

**Parameters:**

- `pointAmount` (uint256): Number of points to exchange

**Constraints:**

- Contract must not be paused
- `pointAmount` must be greater than 0
- Exchange rate must be set (not 0)
- User's balance must be at least `pointAmount`
- Contract's USDC balance must be at least the calculated USDC amount

**Errors:**

- `InvalidAddress()`: When caller is the zero address
- `InvalidAmount()`: When point amount is 0
- `ExchangeRateNotSet()`: When exchange rate is not set
- `InsufficientPoints(uint256 required, uint256 available)`: When point balance is insufficient
- `InsufficientUSDCBalance(uint256 required, uint256 available)`: When contract's USDC balance is insufficient

**Events:**

- `USDCClaimed(address indexed user, uint256 pointsUsed, uint256 usdcAmount)`

**Process Flow:**

1. Input validation
2. Exchange rate verification
3. User point balance verification
4. USDC amount calculation
5. Contract USDC balance verification
6. User point balance reduction
7. USDC transfer
8. Event emission

**Usage Example:**

```solidity
// Exchange 500 points for USDC
contract.claimUSDC(500);
```

---

### USDC Supply Management Functions

#### `depositUSDC(uint256 amount)` 🔒

Deposits USDC into the contract.

**Access Control:** `onlyOwner`

**Parameters:**

- `amount` (uint256): Amount of USDC to deposit (in wei)

**Constraints:**

- `amount` must be greater than 0
- Owner must have approved the contract to spend USDC

**Errors:**

- `InvalidAmount()`: When amount is 0
- `InsufficientUSDCBalance(uint256 required, uint256 available)`: When owner's USDC balance is insufficient or approval is lacking

**Events:**

- `USDCDeposited(uint256 amount)`

**Prerequisites:**

```solidity
// Prior approval of USDC contract required
usdcToken.approve(contractAddress, amount);
```

**Usage Example:**

```solidity
// Deposit 1000 USDC (1,000,000,000 wei)
contract.depositUSDC(1000000000);
```

---

#### `withdrawUSDC(uint256 amount)` 🔒

Withdraws USDC from the contract.

**Access Control:** `onlyOwner`

**Parameters:**

- `amount` (uint256): Amount of USDC to withdraw (in wei)

**Constraints:**

- `amount` must be greater than 0
- Contract's USDC balance must be at least `amount`

**Errors:**

- `InvalidAmount()`: When amount is 0
- `InsufficientUSDCBalance(uint256 required, uint256 available)`: When contract's USDC balance is insufficient

**Events:**

- `USDCWithdrawn(uint256 amount)`

**Usage Example:**

```solidity
// Withdraw 500 USDC (500,000,000 wei)
contract.withdrawUSDC(500000000);
```

---

### Pause Management Functions

#### `pause()` 🔒

Pauses the contract.

**Access Control:** `onlyOwner`

**Effects:**

- `claimUSDC` function becomes disabled
- Administrative functions remain available

**Events:**

- `ContractPaused()`

**Usage Example:**

```solidity
// Pause the contract
contract.pause();
```

---

#### `unpause()` 🔒

Unpauses the contract.

**Access Control:** `onlyOwner`

**Effects:**

- All functions operate normally

**Events:**

- `ContractUnpaused()`

**Usage Example:**

```solidity
// Unpause the contract
contract.unpause();
```

---

## Event Specifications

### `PointsAdded(address indexed user, uint256 amount)`

Emitted when points are added to a user.

**Parameters:**

- `user` (address, indexed): Address of the user who received points
- `amount` (uint256): Number of points added

---

### `PointsTransferred(address indexed user, uint256 amount)`

Emitted when points are transferred from a user.

**Parameters:**

- `user` (address, indexed): Address of the user from whom points were transferred
- `amount` (uint256): Number of points transferred

---

### `ExchangeRateSet(uint256 newRate)`

Emitted when the exchange rate is set.

**Parameters:**

- `newRate` (uint256): New exchange rate

---

### `USDCClaimed(address indexed user, uint256 pointsUsed, uint256 usdcAmount)`

Emitted when a user claims USDC.

**Parameters:**

- `user` (address, indexed): Address of the user who claimed USDC
- `pointsUsed` (uint256): Number of points used
- `usdcAmount` (uint256): Amount of USDC claimed (in wei)

---

### `USDCDeposited(uint256 amount)`

Emitted when USDC is deposited into the contract.

**Parameters:**

- `amount` (uint256): Amount of USDC deposited (in wei)

---

### `USDCWithdrawn(uint256 amount)`

Emitted when USDC is withdrawn from the contract.

**Parameters:**

- `amount` (uint256): Amount of USDC withdrawn (in wei)

---

### `ContractPaused()`

Emitted when the contract is paused.

**Parameters:** None

---

### `ContractUnpaused()`

Emitted when the contract is unpaused.

**Parameters:** None

---

## Error Specifications

### `InsufficientPoints(uint256 required, uint256 available)`

Occurs when a user's point balance is insufficient.

**Parameters:**

- `required` (uint256): Required number of points
- `available` (uint256): Available number of points

---

### `InsufficientUSDCBalance(uint256 required, uint256 available)`

Occurs when USDC balance is insufficient.

**Parameters:**

- `required` (uint256): Required USDC amount
- `available` (uint256): Available USDC amount

---

### `InvalidAddress()`

Occurs when an invalid address (zero address) is provided.

**Parameters:** None

---

### `InvalidAmount()`

Occurs when an invalid amount (0 or less) is provided.

**Parameters:** None

---

### `ExchangeRateNotSet()`

Occurs when the exchange rate is not set (0).

**Parameters:** None

---

### `Unauthorized()`

Occurs when unauthorized access is attempted.

**Parameters:** None

---

### `ContractIsPaused()`

Occurs when restricted operations are attempted while the contract is paused.

**Parameters:** None

---

## Usage Examples and Workflows

### Basic Workflow

#### 1. Contract Deployment and Initial Setup

```solidity
// 1. Deploy the contract
USDCRewardContract contract = new USDCRewardContract(usdcTokenAddress);

// 2. Set exchange rate (1 point = 0.001 USDC)
contract.setExchangeRate(1000000);

// 3. Deposit USDC (prior approval required)
usdcToken.approve(address(contract), 1000000000); // 1000 USDC
contract.depositUSDC(1000000000);
```

#### 2. Granting Points to Users

```solidity
// Grant 1000 points to user
contract.addPoints(userAddress, 1000);

// Check user's balance
uint256 balance = contract.getPointBalance(userAddress);
```

#### 3. User USDC Claims

```solidity
// User exchanges 500 points for USDC
contract.claimUSDC(500);

// Check balance after exchange
uint256 newBalance = contract.getPointBalance(userAddress);
```

### Administrative Operations Examples

#### Emergency Pause

```solidity
// Pause the contract
contract.pause();

// After issue resolution, unpause
contract.unpause();
```

#### USDC Supply Management

```solidity
// Deposit additional USDC
usdcToken.approve(address(contract), 500000000); // 500 USDC
contract.depositUSDC(500000000);

// Withdraw excess USDC
contract.withdrawUSDC(100000000); // 100 USDC
```

### Error Handling Examples

```javascript
// JavaScript/TypeScript example
try {
  await contract.claimUSDC(1000);
} catch (error) {
  if (error.message.includes("InsufficientPoints")) {
    console.log("Insufficient point balance");
  } else if (error.message.includes("InsufficientUSDCBalance")) {
    console.log("Contract has insufficient USDC balance");
  } else if (error.message.includes("ExchangeRateNotSet")) {
    console.log("Exchange rate is not set");
  }
}
```

## Security Considerations

### Access Control

- **Owner Privileges**: Critical management functions protected by `onlyOwner` modifier
- **Pause Functionality**: Ability to disable user functions in emergencies
- **Reentrancy Prevention**: `nonReentrant` modifier prevents reentrancy attacks

### Input Validation

- **Zero Address Validation**: All address inputs are validated
- **Zero Amount Validation**: All amount inputs are validated
- **Balance Checks**: Sufficient balance verification before operations

### Integer Overflow

- Automatically prevented by Solidity 0.8.x built-in protection

## Estimated Gas Usage

| Function          | Estimated Gas Usage |
| ----------------- | ------------------- |
| `addPoints`       | ~45,000             |
| `subtractPoints`  | ~30,000             |
| `setExchangeRate` | ~25,000             |
| `claimUSDC`       | ~80,000             |
| `depositUSDC`     | ~60,000             |
| `withdrawUSDC`    | ~55,000             |
| `pause/unpause`   | ~25,000             |

_Note: Gas usage may vary depending on actual conditions._

## Compatibility

- **Solidity**: ^0.8.28
- **OpenZeppelin**: ^5.0.0
- **ERC20**: Compatible with IERC20 interface-compliant tokens
- **Networks**: All Ethereum-compatible networks

## Update History

| Version | Date       | Changes         |
| ------- | ---------- | --------------- |
| 1.0.0   | 2025-08-15 | Initial release |
