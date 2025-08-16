// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title USDCRewardContract
 * @dev A contract for managing point-based USDC rewards for users who upload conversation data
 * @author Oto Team
 */
contract USDCRewardContract is Ownable, Pausable, ReentrancyGuard {
  // ==================== State Variables ====================

  /// @dev Mapping of user addresses to their point balances
  mapping(address => uint256) private pointBalances;

  /// @dev Exchange rate from points to USDC (1 point = exchangeRate USDC wei)
  uint256 private exchangeRate;

  /// @dev USDC token contract interface
  IERC20 private usdcToken;

  // ==================== Custom Errors ====================

  /// @dev Thrown when user has insufficient points for the requested operation
  /// @param required The amount of points required
  /// @param available The amount of points available
  error InsufficientPoints(uint256 required, uint256 available);

  /// @dev Thrown when contract has insufficient USDC balance for the requested operation
  /// @param required The amount of USDC required
  /// @param available The amount of USDC available
  error InsufficientUSDCBalance(uint256 required, uint256 available);

  /// @dev Thrown when an invalid address (zero address) is provided
  error InvalidAddress();

  /// @dev Thrown when an invalid amount (zero or negative) is provided
  error InvalidAmount();

  /// @dev Thrown when exchange rate is not set (zero)
  error ExchangeRateNotSet();

  /// @dev Thrown when unauthorized access is attempted
  error Unauthorized();

  /// @dev Thrown when contract is paused and operation is not allowed
  error ContractIsPaused();

  // ==================== Events ====================

  /// @dev Emitted when points are added to a user's balance
  /// @param user The user address
  /// @param amount The amount of points added
  event PointsAdded(address indexed user, uint256 amount);

  /// @dev Emitted when points are transferred to a user
  /// @param user The user address
  /// @param amount The amount of points transferred
  event PointsTransferred(address indexed user, uint256 amount);

  /// @dev Emitted when points are removed from a user's balance
  /// @param user The user address
  /// @param amount The amount of points removed
  event PointsRemoved(address indexed user, uint256 amount);

  /// @dev Emitted when exchange rate is updated
  /// @param newRate The new exchange rate
  event ExchangeRateSet(uint256 newRate);

  /// @dev Emitted when USDC is claimed by a user
  /// @param user The user address
  /// @param pointsUsed The amount of points used
  /// @param usdcAmount The amount of USDC claimed
  event USDCClaimed(
    address indexed user,
    uint256 pointsUsed,
    uint256 usdcAmount
  );

  /// @dev Emitted when USDC is deposited to the contract
  /// @param amount The amount of USDC deposited
  event USDCDeposited(uint256 amount);

  /// @dev Emitted when USDC is withdrawn from the contract
  /// @param amount The amount of USDC withdrawn
  event USDCWithdrawn(uint256 amount);

  /// @dev Emitted when contract is paused
  event ContractPaused();

  /// @dev Emitted when contract is unpaused
  event ContractUnpaused();

  // ==================== Constructor ====================

  /// @dev Constructor to initialize the contract with USDC token address
  /// @param _usdcToken The address of the USDC token contract
  constructor(address _usdcToken) Ownable(msg.sender) {
    if (_usdcToken == address(0)) {
      revert InvalidAddress();
    }

    usdcToken = IERC20(_usdcToken);
    exchangeRate = 0; // Initially not set, must be configured by owner
  }

  // ==================== Point Management Functions ====================

  /// @dev Adds points to a user's balance (only owner)
  /// @param user The user address to add points to
  /// @param amount The amount of points to add
  function addPoints(address user, uint256 amount) external onlyOwner {
    _validateAddress(user);

    if (amount == 0) {
      revert InvalidAmount();
    }

    pointBalances[user] += amount;

    emit PointsAdded(user, amount);
  }

  /// @dev Transfers points to a user (only owner)
  /// @param user The user address to transfer points to
  /// @param amount The amount of points to transfer
  function transferPoints(address user, uint256 amount) external onlyOwner {
    _validateAddress(user);

    if (amount == 0) {
      revert InvalidAmount();
    }

    uint256 currentBalance = pointBalances[user];
    if (currentBalance < amount) {
      revert InsufficientPoints(amount, currentBalance);
    }

    pointBalances[user] -= amount;

    emit PointsTransferred(user, amount);
  }

  /// @dev Removes points from a user's balance (only owner)
  /// @param user The user address to remove points from
  /// @param amount The amount of points to remove
  function removePoints(address user, uint256 amount) external onlyOwner {
    _validateAddress(user);

    if (amount == 0) {
      revert InvalidAmount();
    }

    uint256 currentBalance = pointBalances[user];
    if (currentBalance < amount) {
      revert InsufficientPoints(amount, currentBalance);
    }

    pointBalances[user] -= amount;

    emit PointsRemoved(user, amount);
  }

  /// @dev Gets the point balance of a user
  /// @param user The user address to check
  /// @return The point balance of the user
  function getPointBalance(address user) external view returns (uint256) {
    return pointBalances[user];
  }

  // ==================== Exchange Rate Management Functions ====================

  /// @dev Sets the exchange rate from points to USDC (only owner)
  /// @param rate The new exchange rate (1 point = rate USDC wei)
  function setExchangeRate(uint256 rate) external onlyOwner {
    exchangeRate = rate;

    emit ExchangeRateSet(rate);
  }

  /// @dev Calculates the USDC amount for a given point amount
  /// @param pointAmount The amount of points to convert
  /// @return The equivalent USDC amount in wei
  function calculateUSDCAmount(
    uint256 pointAmount
  ) external view returns (uint256) {
    if (exchangeRate == 0) {
      return 0;
    }

    return pointAmount * exchangeRate;
  }

  // ==================== USDC Claim Functions ====================

  /// @dev Allows users to claim USDC by spending their points
  /// @param pointAmount The amount of points to spend for USDC
  function claimUSDC(uint256 pointAmount) external whenNotPaused nonReentrant {
    _validateAddress(msg.sender);

    if (pointAmount == 0) {
      revert InvalidAmount();
    }

    // Check if exchange rate is set
    if (exchangeRate == 0) {
      revert ExchangeRateNotSet();
    }

    // Check user's point balance
    uint256 userBalance = pointBalances[msg.sender];
    if (userBalance < pointAmount) {
      revert InsufficientPoints(pointAmount, userBalance);
    }

    // Calculate USDC amount
    uint256 usdcAmount = pointAmount * exchangeRate;

    // Check contract's USDC balance
    uint256 contractUSDCBalance = usdcToken.balanceOf(address(this));
    if (contractUSDCBalance < usdcAmount) {
      revert InsufficientUSDCBalance(usdcAmount, contractUSDCBalance);
    }

    // Reduce user's point balance
    pointBalances[msg.sender] -= pointAmount;

    // Transfer USDC to user
    _transferUSDC(msg.sender, usdcAmount);

    // Emit event
    emit USDCClaimed(msg.sender, pointAmount, usdcAmount);
  }

  // ==================== USDC Supply Management Functions ====================

  /// @dev Deposits USDC to the contract (only owner)
  /// @param amount The amount of USDC to deposit
  function depositUSDC(uint256 amount) external onlyOwner {
    if (amount == 0) {
      revert InvalidAmount();
    }

    // Transfer USDC from owner to contract
    bool success = usdcToken.transferFrom(msg.sender, address(this), amount);
    if (!success) {
      revert InsufficientUSDCBalance(amount, usdcToken.balanceOf(msg.sender));
    }

    emit USDCDeposited(amount);
  }

  /// @dev Withdraws USDC from the contract (only owner)
  /// @param amount The amount of USDC to withdraw
  function withdrawUSDC(uint256 amount) external onlyOwner {
    if (amount == 0) {
      revert InvalidAmount();
    }

    // Check contract's USDC balance
    uint256 contractBalance = usdcToken.balanceOf(address(this));
    if (contractBalance < amount) {
      revert InsufficientUSDCBalance(amount, contractBalance);
    }

    // Transfer USDC from contract to owner
    bool success = usdcToken.transfer(msg.sender, amount);
    if (!success) {
      revert InsufficientUSDCBalance(amount, contractBalance);
    }

    emit USDCWithdrawn(amount);
  }

  // ==================== Pause/Unpause Functions ====================

  /// @dev Pauses the contract (only owner)
  /// @notice When paused, user functions like claimUSDC are disabled, but admin functions remain available
  function pause() external onlyOwner {
    _pause();
    emit ContractPaused();
  }

  /// @dev Unpauses the contract (only owner)
  /// @notice Restores normal contract functionality
  function unpause() external onlyOwner {
    _unpause();
    emit ContractUnpaused();
  }

  // ==================== Internal Functions ====================

  /// @dev Internal function to transfer USDC to a user
  /// @param to The address to transfer USDC to
  /// @param amount The amount of USDC to transfer
  function _transferUSDC(address to, uint256 amount) private {
    bool success = usdcToken.transfer(to, amount);
    if (!success) {
      revert InsufficientUSDCBalance(
        amount,
        usdcToken.balanceOf(address(this))
      );
    }
  }

  /// @dev Validates that an address is not zero
  /// @param addr The address to validate
  function _validateAddress(address addr) private pure {
    if (addr == address(0)) {
      revert InvalidAddress();
    }
  }
}
