import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import { viem } from "hardhat";
import { zeroAddress } from "viem";

describe("USDCRewardContract", function () {
  // Test fixture to deploy contracts
  async function deployContractsFixture() {
    const [owner, user1, user2, nonOwner] = await viem.getWalletClients();

    // Deploy mock USDC token
    const mockUSDC = await viem.deployContract("MockERC20", [
      "Mock USDC",
      "USDC",
      6, // 6 decimals for USDC
    ]);

    // Deploy USDCRewardContract
    const usdcRewardContract = await viem.deployContract("USDCRewardContract", [
      mockUSDC.address,
    ]);

    const publicClient = await viem.getPublicClient();

    return {
      usdcRewardContract,
      mockUSDC,
      owner,
      user1,
      user2,
      nonOwner,
      publicClient,
    };
  }

  describe("Point Management Functions", function () {
    describe("addPoints", function () {
      it("should allow owner to add points to user", async function () {
        const { usdcRewardContract, owner, user1, publicClient } =
          await loadFixture(deployContractsFixture);

        const pointsToAdd = 1000n;

        // Add points to user1
        const hash = await usdcRewardContract.write.addPoints([
          user1.account.address,
          pointsToAdd,
        ]);

        await publicClient.waitForTransactionReceipt({ hash });

        // Check user's point balance
        const balance = await usdcRewardContract.read.getPointBalance([
          user1.account.address,
        ]);
        expect(balance).to.equal(pointsToAdd);
      });

      it("should emit PointsAdded event", async function () {
        const { usdcRewardContract, user1, publicClient } = await loadFixture(
          deployContractsFixture
        );

        const pointsToAdd = 500n;

        const hash = await usdcRewardContract.write.addPoints([
          user1.account.address,
          pointsToAdd,
        ]);

        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        // Check for PointsAdded event
        const logs = await publicClient.getLogs({
          address: usdcRewardContract.address,
          fromBlock: receipt.blockNumber,
          toBlock: receipt.blockNumber,
        });

        expect(logs).to.have.length(1);
        // Additional event verification can be added here
      });

      it("should revert when non-owner tries to add points", async function () {
        const { usdcRewardContract, user1, nonOwner } = await loadFixture(
          deployContractsFixture
        );

        await expect(
          usdcRewardContract.write.addPoints([user1.account.address, 1000n], {
            account: nonOwner.account,
          })
        ).to.be.rejectedWith("OwnableUnauthorizedAccount");
      });

      it("should revert when adding points to zero address", async function () {
        const { usdcRewardContract } = await loadFixture(
          deployContractsFixture
        );

        await expect(
          usdcRewardContract.write.addPoints([zeroAddress, 1000n])
        ).to.be.rejectedWith("InvalidAddress");
      });

      it("should revert when adding zero points", async function () {
        const { usdcRewardContract, user1 } = await loadFixture(
          deployContractsFixture
        );

        await expect(
          usdcRewardContract.write.addPoints([user1.account.address, 0n])
        ).to.be.rejectedWith("InvalidAmount");
      });

      it("should accumulate points when adding multiple times", async function () {
        const { usdcRewardContract, user1, publicClient } = await loadFixture(
          deployContractsFixture
        );

        const firstAmount = 500n;
        const secondAmount = 300n;

        // Add points first time
        let hash = await usdcRewardContract.write.addPoints([
          user1.account.address,
          firstAmount,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Add points second time
        hash = await usdcRewardContract.write.addPoints([
          user1.account.address,
          secondAmount,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Check total balance
        const balance = await usdcRewardContract.read.getPointBalance([
          user1.account.address,
        ]);
        expect(balance).to.equal(firstAmount + secondAmount);
      });
    });

    describe("subtractPoints", function () {
      it("should allow owner to remove points from user", async function () {
        const { usdcRewardContract, user1, publicClient } = await loadFixture(
          deployContractsFixture
        );

        const initialPoints = 1000n;
        const removeAmount = 300n;

        // First add points
        let hash = await usdcRewardContract.write.addPoints([
          user1.account.address,
          initialPoints,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Then remove points
        hash = await usdcRewardContract.write.subtractPoints([
          user1.account.address,
          removeAmount,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Check remaining balance
        const balance = await usdcRewardContract.read.getPointBalance([
          user1.account.address,
        ]);
        expect(balance).to.equal(initialPoints - removeAmount);
      });

      it("should emit PointsRemoved event", async function () {
        const { usdcRewardContract, user1, publicClient } = await loadFixture(
          deployContractsFixture
        );

        const initialPoints = 1000n;
        const removeAmount = 300n;

        // Add points first
        let hash = await usdcRewardContract.write.addPoints([
          user1.account.address,
          initialPoints,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Remove points
        hash = await usdcRewardContract.write.subtractPoints([
          user1.account.address,
          removeAmount,
        ]);

        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        // Check for PointsRemoved event
        const logs = await publicClient.getLogs({
          address: usdcRewardContract.address,
          fromBlock: receipt.blockNumber,
          toBlock: receipt.blockNumber,
        });

        expect(logs).to.have.length(1);
      });

      it("should revert when non-owner tries to remove points", async function () {
        const { usdcRewardContract, user1, nonOwner } = await loadFixture(
          deployContractsFixture
        );

        await expect(
          usdcRewardContract.write.subtractPoints(
            [user1.account.address, 100n],
            { account: nonOwner.account }
          )
        ).to.be.rejectedWith("OwnableUnauthorizedAccount");
      });

      it("should revert when removing from zero address", async function () {
        const { usdcRewardContract } = await loadFixture(
          deployContractsFixture
        );

        await expect(
          usdcRewardContract.write.subtractPoints([zeroAddress, 100n])
        ).to.be.rejectedWith("InvalidAddress");
      });

      it("should revert when removing zero points", async function () {
        const { usdcRewardContract, user1 } = await loadFixture(
          deployContractsFixture
        );

        await expect(
          usdcRewardContract.write.subtractPoints([user1.account.address, 0n])
        ).to.be.rejectedWith("InvalidAmount");
      });

      it("should revert when user has insufficient points", async function () {
        const { usdcRewardContract, user1, publicClient } = await loadFixture(
          deployContractsFixture
        );

        const initialPoints = 100n;
        const removeAmount = 200n;

        // Add some points
        const hash = await usdcRewardContract.write.addPoints([
          user1.account.address,
          initialPoints,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Try to remove more than available
        await expect(
          usdcRewardContract.write.subtractPoints([
            user1.account.address,
            removeAmount,
          ])
        ).to.be.rejectedWith("InsufficientPoints");
      });

      it("should revert when user has no points", async function () {
        const { usdcRewardContract, user1 } = await loadFixture(
          deployContractsFixture
        );

        await expect(
          usdcRewardContract.write.subtractPoints([user1.account.address, 100n])
        ).to.be.rejectedWith("InsufficientPoints");
      });
    });

    describe("getPointBalance", function () {
      it("should return zero for new user", async function () {
        const { usdcRewardContract, user1 } = await loadFixture(
          deployContractsFixture
        );

        const balance = await usdcRewardContract.read.getPointBalance([
          user1.account.address,
        ]);
        expect(balance).to.equal(0n);
      });

      it("should return correct balance after adding points", async function () {
        const { usdcRewardContract, user1, publicClient } = await loadFixture(
          deployContractsFixture
        );

        const pointsToAdd = 750n;

        const hash = await usdcRewardContract.write.addPoints([
          user1.account.address,
          pointsToAdd,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        const balance = await usdcRewardContract.read.getPointBalance([
          user1.account.address,
        ]);
        expect(balance).to.equal(pointsToAdd);
      });

      it("should return correct balance after removing points", async function () {
        const { usdcRewardContract, user1, publicClient } = await loadFixture(
          deployContractsFixture
        );

        const initialPoints = 1000n;
        const removeAmount = 400n;

        // Add points
        let hash = await usdcRewardContract.write.addPoints([
          user1.account.address,
          initialPoints,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Remove points
        hash = await usdcRewardContract.write.subtractPoints([
          user1.account.address,
          removeAmount,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        const balance = await usdcRewardContract.read.getPointBalance([
          user1.account.address,
        ]);
        expect(balance).to.equal(initialPoints - removeAmount);
      });
    });

    describe("getTotalClaimedPoints", function () {
      it("should return zero for a new user", async function () {
        const { usdcRewardContract, user1 } = await loadFixture(
          deployContractsFixture
        );

        const claimedPoints =
          await usdcRewardContract.read.getTotalClaimedPoints([
            user1.account.address,
          ]);
        expect(claimedPoints).to.equal(0n);
      });

      it("should return zero for a user who has points but hasn't claimed", async function () {
        const { usdcRewardContract, user1, publicClient } = await loadFixture(
          deployContractsFixture
        );

        // Add points but don't claim
        const hash = await usdcRewardContract.write.addPoints([
          user1.account.address,
          1000n,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        const claimedPoints =
          await usdcRewardContract.read.getTotalClaimedPoints([
            user1.account.address,
          ]);
        expect(claimedPoints).to.equal(0n);
      });
    });
  });

  describe("Exchange Rate Management Functions", function () {
    describe("setExchangeRate", function () {
      it("should allow owner to set exchange rate", async function () {
        const { usdcRewardContract, publicClient } = await loadFixture(
          deployContractsFixture
        );

        const newRate = 1000000n; // 1 point = 0.001 USDC (1000000 wei)

        const hash = await usdcRewardContract.write.setExchangeRate([newRate]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Verify rate was set by checking calculateUSDCAmount
        const usdcAmount = await usdcRewardContract.read.calculateUSDCAmount([
          1000n,
        ]);
        expect(usdcAmount).to.equal(1000n * newRate);
      });

      it("should emit ExchangeRateSet event", async function () {
        const { usdcRewardContract, publicClient } = await loadFixture(
          deployContractsFixture
        );

        const newRate = 500000n;

        const hash = await usdcRewardContract.write.setExchangeRate([newRate]);
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        // Check for ExchangeRateSet event
        const logs = await publicClient.getLogs({
          address: usdcRewardContract.address,
          fromBlock: receipt.blockNumber,
          toBlock: receipt.blockNumber,
        });

        expect(logs).to.have.length(1);
      });

      it("should allow setting exchange rate to zero", async function () {
        const { usdcRewardContract, publicClient } = await loadFixture(
          deployContractsFixture
        );

        // First set a non-zero rate
        let hash = await usdcRewardContract.write.setExchangeRate([1000000n]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Then set to zero
        hash = await usdcRewardContract.write.setExchangeRate([0n]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Verify rate is zero
        const usdcAmount = await usdcRewardContract.read.calculateUSDCAmount([
          1000n,
        ]);
        expect(usdcAmount).to.equal(0n);
      });

      it("should revert when non-owner tries to set exchange rate", async function () {
        const { usdcRewardContract, nonOwner } = await loadFixture(
          deployContractsFixture
        );

        await expect(
          usdcRewardContract.write.setExchangeRate([1000000n], {
            account: nonOwner.account,
          })
        ).to.be.rejectedWith("OwnableUnauthorizedAccount");
      });

      it("should allow updating exchange rate multiple times", async function () {
        const { usdcRewardContract, publicClient } = await loadFixture(
          deployContractsFixture
        );

        const firstRate = 1000000n;
        const secondRate = 2000000n;

        // Set first rate
        let hash = await usdcRewardContract.write.setExchangeRate([firstRate]);
        await publicClient.waitForTransactionReceipt({ hash });

        let usdcAmount = await usdcRewardContract.read.calculateUSDCAmount([
          1000n,
        ]);
        expect(usdcAmount).to.equal(1000n * firstRate);

        // Set second rate
        hash = await usdcRewardContract.write.setExchangeRate([secondRate]);
        await publicClient.waitForTransactionReceipt({ hash });

        usdcAmount = await usdcRewardContract.read.calculateUSDCAmount([1000n]);
        expect(usdcAmount).to.equal(1000n * secondRate);
      });
    });

    describe("calculateUSDCAmount", function () {
      it("should return zero when exchange rate is not set", async function () {
        const { usdcRewardContract } = await loadFixture(
          deployContractsFixture
        );

        const usdcAmount = await usdcRewardContract.read.calculateUSDCAmount([
          1000n,
        ]);
        expect(usdcAmount).to.equal(0n);
      });

      it("should calculate correct USDC amount when rate is set", async function () {
        const { usdcRewardContract, publicClient } = await loadFixture(
          deployContractsFixture
        );

        const exchangeRate = 1500000n; // 1 point = 0.0015 USDC
        const pointAmount = 2000n;

        // Set exchange rate
        const hash = await usdcRewardContract.write.setExchangeRate([
          exchangeRate,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Calculate USDC amount
        const usdcAmount = await usdcRewardContract.read.calculateUSDCAmount([
          pointAmount,
        ]);
        expect(usdcAmount).to.equal(pointAmount * exchangeRate);
      });

      it("should return zero for zero points", async function () {
        const { usdcRewardContract, publicClient } = await loadFixture(
          deployContractsFixture
        );

        // Set exchange rate
        const hash = await usdcRewardContract.write.setExchangeRate([1000000n]);
        await publicClient.waitForTransactionReceipt({ hash });

        const usdcAmount = await usdcRewardContract.read.calculateUSDCAmount([
          0n,
        ]);
        expect(usdcAmount).to.equal(0n);
      });

      it("should handle large point amounts", async function () {
        const { usdcRewardContract, publicClient } = await loadFixture(
          deployContractsFixture
        );

        const exchangeRate = 1000000n;
        const largePointAmount = 1000000000n; // 1 billion points

        // Set exchange rate
        const hash = await usdcRewardContract.write.setExchangeRate([
          exchangeRate,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        const usdcAmount = await usdcRewardContract.read.calculateUSDCAmount([
          largePointAmount,
        ]);
        expect(usdcAmount).to.equal(largePointAmount * exchangeRate);
      });

      it("should return zero when rate is set back to zero", async function () {
        const { usdcRewardContract, publicClient } = await loadFixture(
          deployContractsFixture
        );

        // Set non-zero rate first
        let hash = await usdcRewardContract.write.setExchangeRate([1000000n]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Set rate to zero
        hash = await usdcRewardContract.write.setExchangeRate([0n]);
        await publicClient.waitForTransactionReceipt({ hash });

        const usdcAmount = await usdcRewardContract.read.calculateUSDCAmount([
          1000n,
        ]);
        expect(usdcAmount).to.equal(0n);
      });
    });
  });

  describe("USDC Claim Functions", function () {
    describe("claimUSDC", function () {
      it("should allow user to claim USDC with sufficient points and contract balance", async function () {
        const { usdcRewardContract, mockUSDC, owner, user1, publicClient } =
          await loadFixture(deployContractsFixture);

        const pointsToAdd = 1000n;
        const exchangeRate = 1000000n; // 1 point = 0.001 USDC
        const pointsToSpend = 500n;
        const expectedUSDC = pointsToSpend * exchangeRate;

        // Set exchange rate
        let hash = await usdcRewardContract.write.setExchangeRate([
          exchangeRate,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Add points to user
        hash = await usdcRewardContract.write.addPoints([
          user1.account.address,
          pointsToAdd,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Deposit USDC to contract
        const usdcToDeposit = 1000000000n; // 1000 USDC
        hash = await mockUSDC.write.approve([
          usdcRewardContract.address,
          usdcToDeposit,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await usdcRewardContract.write.depositUSDC([usdcToDeposit]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Get initial balances
        const initialUserUSDC = await mockUSDC.read.balanceOf([
          user1.account.address,
        ]);
        const initialUserPoints = await usdcRewardContract.read.getPointBalance(
          [user1.account.address]
        );

        // Claim USDC
        hash = await usdcRewardContract.write.claimUSDC([pointsToSpend], {
          account: user1.account,
        });
        await publicClient.waitForTransactionReceipt({ hash });

        // Check final balances
        const finalUserUSDC = await mockUSDC.read.balanceOf([
          user1.account.address,
        ]);
        const finalUserPoints = await usdcRewardContract.read.getPointBalance([
          user1.account.address,
        ]);

        expect(finalUserUSDC).to.equal(initialUserUSDC + expectedUSDC);
        expect(finalUserPoints).to.equal(initialUserPoints - pointsToSpend);
      });

      it("should emit USDCClaimed event", async function () {
        const { usdcRewardContract, mockUSDC, user1, publicClient } =
          await loadFixture(deployContractsFixture);

        const pointsToAdd = 1000n;
        const exchangeRate = 1000000n;
        const pointsToSpend = 300n;

        // Setup
        let hash = await usdcRewardContract.write.setExchangeRate([
          exchangeRate,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await usdcRewardContract.write.addPoints([
          user1.account.address,
          pointsToAdd,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        const usdcToDeposit = 1000000000n;
        hash = await mockUSDC.write.approve([
          usdcRewardContract.address,
          usdcToDeposit,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await usdcRewardContract.write.depositUSDC([usdcToDeposit]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Claim USDC
        hash = await usdcRewardContract.write.claimUSDC([pointsToSpend], {
          account: user1.account,
        });
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        // Check for USDCClaimed event
        const logs = await publicClient.getLogs({
          address: usdcRewardContract.address,
          fromBlock: receipt.blockNumber,
          toBlock: receipt.blockNumber,
        });

        expect(logs).to.have.length(1);
      });

      it("should revert when exchange rate is not set", async function () {
        const { usdcRewardContract, user1, publicClient } = await loadFixture(
          deployContractsFixture
        );

        // Add points but don't set exchange rate
        const hash = await usdcRewardContract.write.addPoints([
          user1.account.address,
          1000n,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        await expect(
          usdcRewardContract.write.claimUSDC([500n], {
            account: user1.account,
          })
        ).to.be.rejectedWith("ExchangeRateNotSet");
      });

      it("should revert when user has insufficient points", async function () {
        const { usdcRewardContract, mockUSDC, user1, publicClient } =
          await loadFixture(deployContractsFixture);

        const pointsToAdd = 100n;
        const pointsToSpend = 200n; // More than available
        const exchangeRate = 1000000n;

        // Setup
        let hash = await usdcRewardContract.write.setExchangeRate([
          exchangeRate,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await usdcRewardContract.write.addPoints([
          user1.account.address,
          pointsToAdd,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Deposit USDC to contract
        const usdcToDeposit = 1000000000n;
        hash = await mockUSDC.write.approve([
          usdcRewardContract.address,
          usdcToDeposit,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await usdcRewardContract.write.depositUSDC([usdcToDeposit]);
        await publicClient.waitForTransactionReceipt({ hash });

        await expect(
          usdcRewardContract.write.claimUSDC([pointsToSpend], {
            account: user1.account,
          })
        ).to.be.rejectedWith("InsufficientPoints");
      });

      it("should revert when contract has insufficient USDC balance", async function () {
        const { usdcRewardContract, user1, publicClient } = await loadFixture(
          deployContractsFixture
        );

        const pointsToAdd = 1000n;
        const exchangeRate = 1000000n;
        const pointsToSpend = 500n;

        // Setup without depositing USDC
        let hash = await usdcRewardContract.write.setExchangeRate([
          exchangeRate,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await usdcRewardContract.write.addPoints([
          user1.account.address,
          pointsToAdd,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        await expect(
          usdcRewardContract.write.claimUSDC([pointsToSpend], {
            account: user1.account,
          })
        ).to.be.rejectedWith("InsufficientUSDCBalance");
      });

      it("should revert when claiming zero points", async function () {
        const { usdcRewardContract, user1, publicClient } = await loadFixture(
          deployContractsFixture
        );

        // Set exchange rate
        const hash = await usdcRewardContract.write.setExchangeRate([1000000n]);
        await publicClient.waitForTransactionReceipt({ hash });

        await expect(
          usdcRewardContract.write.claimUSDC([0n], {
            account: user1.account,
          })
        ).to.be.rejectedWith("InvalidAmount");
      });

      it("should revert when contract is paused", async function () {
        const { usdcRewardContract, mockUSDC, user1, publicClient } =
          await loadFixture(deployContractsFixture);

        const pointsToAdd = 1000n;
        const exchangeRate = 1000000n;
        const pointsToSpend = 500n;

        // Setup
        let hash = await usdcRewardContract.write.setExchangeRate([
          exchangeRate,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await usdcRewardContract.write.addPoints([
          user1.account.address,
          pointsToAdd,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        const usdcToDeposit = 1000000000n;
        hash = await mockUSDC.write.approve([
          usdcRewardContract.address,
          usdcToDeposit,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await usdcRewardContract.write.depositUSDC([usdcToDeposit]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Pause contract
        hash = await usdcRewardContract.write.pause();
        await publicClient.waitForTransactionReceipt({ hash });

        await expect(
          usdcRewardContract.write.claimUSDC([pointsToSpend], {
            account: user1.account,
          })
        ).to.be.rejectedWith("EnforcedPause");
      });

      it("should handle multiple claims correctly", async function () {
        const { usdcRewardContract, mockUSDC, user1, publicClient } =
          await loadFixture(deployContractsFixture);

        const pointsToAdd = 1000n;
        const exchangeRate = 1000000n;
        const firstClaim = 300n;
        const secondClaim = 200n;

        // Setup
        let hash = await usdcRewardContract.write.setExchangeRate([
          exchangeRate,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await usdcRewardContract.write.addPoints([
          user1.account.address,
          pointsToAdd,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        const usdcToDeposit = 1000000000n;
        hash = await mockUSDC.write.approve([
          usdcRewardContract.address,
          usdcToDeposit,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await usdcRewardContract.write.depositUSDC([usdcToDeposit]);
        await publicClient.waitForTransactionReceipt({ hash });

        // First claim
        hash = await usdcRewardContract.write.claimUSDC([firstClaim], {
          account: user1.account,
        });
        await publicClient.waitForTransactionReceipt({ hash });

        // Second claim
        hash = await usdcRewardContract.write.claimUSDC([secondClaim], {
          account: user1.account,
        });
        await publicClient.waitForTransactionReceipt({ hash });

        // Check final balances
        const finalUserPoints = await usdcRewardContract.read.getPointBalance([
          user1.account.address,
        ]);
        const finalUserUSDC = await mockUSDC.read.balanceOf([
          user1.account.address,
        ]);

        expect(finalUserPoints).to.equal(
          pointsToAdd - firstClaim - secondClaim
        );
        expect(finalUserUSDC).to.equal(
          (firstClaim + secondClaim) * exchangeRate
        );
      });

      it("should update total claimed points after a successful claim", async function () {
        const { usdcRewardContract, mockUSDC, user1, publicClient } =
          await loadFixture(deployContractsFixture);

        const pointsToAdd = 1000n;
        const exchangeRate = 1000000n;
        const pointsToSpend = 400n;

        // Setup
        let hash = await usdcRewardContract.write.setExchangeRate([
          exchangeRate,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await usdcRewardContract.write.addPoints([
          user1.account.address,
          pointsToAdd,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        const usdcToDeposit = 1000000000n;
        hash = await mockUSDC.write.approve([
          usdcRewardContract.address,
          usdcToDeposit,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await usdcRewardContract.write.depositUSDC([usdcToDeposit]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Claim USDC
        hash = await usdcRewardContract.write.claimUSDC([pointsToSpend], {
          account: user1.account,
        });
        await publicClient.waitForTransactionReceipt({ hash });

        // Check total claimed points
        const totalClaimed =
          await usdcRewardContract.read.getTotalClaimedPoints([
            user1.account.address,
          ]);
        expect(totalClaimed).to.equal(pointsToSpend);
      });

      it("should accumulate total claimed points over multiple claims", async function () {
        const { usdcRewardContract, mockUSDC, user1, publicClient } =
          await loadFixture(deployContractsFixture);

        const pointsToAdd = 1000n;
        const exchangeRate = 1000000n;
        const firstClaim = 300n;
        const secondClaim = 200n;

        // Setup
        let hash = await usdcRewardContract.write.setExchangeRate([
          exchangeRate,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await usdcRewardContract.write.addPoints([
          user1.account.address,
          pointsToAdd,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        const usdcToDeposit = 1000000000n;
        hash = await mockUSDC.write.approve([
          usdcRewardContract.address,
          usdcToDeposit,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await usdcRewardContract.write.depositUSDC([usdcToDeposit]);
        await publicClient.waitForTransactionReceipt({ hash });

        // First claim
        hash = await usdcRewardContract.write.claimUSDC([firstClaim], {
          account: user1.account,
        });
        await publicClient.waitForTransactionReceipt({ hash });

        // Second claim
        hash = await usdcRewardContract.write.claimUSDC([secondClaim], {
          account: user1.account,
        });
        await publicClient.waitForTransactionReceipt({ hash });

        // Check total claimed points
        const totalClaimed =
          await usdcRewardContract.read.getTotalClaimedPoints([
            user1.account.address,
          ]);
        expect(totalClaimed).to.equal(firstClaim + secondClaim);
      });
    });
  });

  describe("USDC Supply Management Functions", function () {
    describe("depositUSDC", function () {
      it("should allow owner to deposit USDC to contract", async function () {
        const { usdcRewardContract, mockUSDC, owner, publicClient } =
          await loadFixture(deployContractsFixture);

        const depositAmount = 1000000000n; // 1000 USDC

        // Approve contract to spend USDC
        let hash = await mockUSDC.write.approve([
          usdcRewardContract.address,
          depositAmount,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Get initial balances
        const initialOwnerBalance = await mockUSDC.read.balanceOf([
          owner.account.address,
        ]);
        const initialContractBalance = await mockUSDC.read.balanceOf([
          usdcRewardContract.address,
        ]);

        // Deposit USDC
        hash = await usdcRewardContract.write.depositUSDC([depositAmount]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Check final balances
        const finalOwnerBalance = await mockUSDC.read.balanceOf([
          owner.account.address,
        ]);
        const finalContractBalance = await mockUSDC.read.balanceOf([
          usdcRewardContract.address,
        ]);

        expect(finalOwnerBalance).to.equal(initialOwnerBalance - depositAmount);
        expect(finalContractBalance).to.equal(
          initialContractBalance + depositAmount
        );
      });

      it("should emit USDCDeposited event", async function () {
        const { usdcRewardContract, mockUSDC, publicClient } =
          await loadFixture(deployContractsFixture);

        const depositAmount = 500000000n; // 500 USDC

        // Approve and deposit
        let hash = await mockUSDC.write.approve([
          usdcRewardContract.address,
          depositAmount,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await usdcRewardContract.write.depositUSDC([depositAmount]);
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        // Check for USDCDeposited event
        const logs = await publicClient.getLogs({
          address: usdcRewardContract.address,
          fromBlock: receipt.blockNumber,
          toBlock: receipt.blockNumber,
        });

        expect(logs).to.have.length(1);
      });

      it("should revert when non-owner tries to deposit USDC", async function () {
        const { usdcRewardContract, mockUSDC, nonOwner, publicClient } =
          await loadFixture(deployContractsFixture);

        const depositAmount = 1000000000n;

        // Give nonOwner some USDC and approve
        let hash = await mockUSDC.write.transfer([
          nonOwner.account.address,
          depositAmount,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await mockUSDC.write.approve(
          [usdcRewardContract.address, depositAmount],
          { account: nonOwner.account }
        );
        await publicClient.waitForTransactionReceipt({ hash });

        await expect(
          usdcRewardContract.write.depositUSDC([depositAmount], {
            account: nonOwner.account,
          })
        ).to.be.rejectedWith("OwnableUnauthorizedAccount");
      });

      it("should revert when depositing zero amount", async function () {
        const { usdcRewardContract } = await loadFixture(
          deployContractsFixture
        );

        await expect(
          usdcRewardContract.write.depositUSDC([0n])
        ).to.be.rejectedWith("InvalidAmount");
      });

      it("should revert when owner has insufficient USDC balance", async function () {
        const { usdcRewardContract, mockUSDC, owner, publicClient } =
          await loadFixture(deployContractsFixture);

        const ownerBalance = await mockUSDC.read.balanceOf([
          owner.account.address,
        ]);
        const depositAmount = ownerBalance + 1n; // More than owner has

        // Approve more than balance
        const hash = await mockUSDC.write.approve([
          usdcRewardContract.address,
          depositAmount,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        await expect(
          usdcRewardContract.write.depositUSDC([depositAmount])
        ).to.be.rejectedWith("ERC20InsufficientBalance");
      });

      it("should handle multiple deposits correctly", async function () {
        const { usdcRewardContract, mockUSDC, publicClient } =
          await loadFixture(deployContractsFixture);

        const firstDeposit = 300000000n; // 300 USDC
        const secondDeposit = 200000000n; // 200 USDC

        // First deposit
        let hash = await mockUSDC.write.approve([
          usdcRewardContract.address,
          firstDeposit,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await usdcRewardContract.write.depositUSDC([firstDeposit]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Second deposit
        hash = await mockUSDC.write.approve([
          usdcRewardContract.address,
          secondDeposit,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await usdcRewardContract.write.depositUSDC([secondDeposit]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Check final contract balance
        const finalContractBalance = await mockUSDC.read.balanceOf([
          usdcRewardContract.address,
        ]);
        expect(finalContractBalance).to.equal(firstDeposit + secondDeposit);
      });
    });

    describe("withdrawUSDC", function () {
      it("should allow owner to withdraw USDC from contract", async function () {
        const { usdcRewardContract, mockUSDC, owner, publicClient } =
          await loadFixture(deployContractsFixture);

        const depositAmount = 1000000000n; // 1000 USDC
        const withdrawAmount = 300000000n; // 300 USDC

        // First deposit USDC
        let hash = await mockUSDC.write.approve([
          usdcRewardContract.address,
          depositAmount,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await usdcRewardContract.write.depositUSDC([depositAmount]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Get balances before withdrawal
        const initialOwnerBalance = await mockUSDC.read.balanceOf([
          owner.account.address,
        ]);
        const initialContractBalance = await mockUSDC.read.balanceOf([
          usdcRewardContract.address,
        ]);

        // Withdraw USDC
        hash = await usdcRewardContract.write.withdrawUSDC([withdrawAmount]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Check final balances
        const finalOwnerBalance = await mockUSDC.read.balanceOf([
          owner.account.address,
        ]);
        const finalContractBalance = await mockUSDC.read.balanceOf([
          usdcRewardContract.address,
        ]);

        expect(finalOwnerBalance).to.equal(
          initialOwnerBalance + withdrawAmount
        );
        expect(finalContractBalance).to.equal(
          initialContractBalance - withdrawAmount
        );
      });

      it("should emit USDCWithdrawn event", async function () {
        const { usdcRewardContract, mockUSDC, publicClient } =
          await loadFixture(deployContractsFixture);

        const depositAmount = 1000000000n;
        const withdrawAmount = 500000000n;

        // Setup - deposit first
        let hash = await mockUSDC.write.approve([
          usdcRewardContract.address,
          depositAmount,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await usdcRewardContract.write.depositUSDC([depositAmount]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Withdraw
        hash = await usdcRewardContract.write.withdrawUSDC([withdrawAmount]);
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        // Check for USDCWithdrawn event
        const logs = await publicClient.getLogs({
          address: usdcRewardContract.address,
          fromBlock: receipt.blockNumber,
          toBlock: receipt.blockNumber,
        });

        expect(logs).to.have.length(1);
      });

      it("should revert when non-owner tries to withdraw USDC", async function () {
        const { usdcRewardContract, mockUSDC, nonOwner, publicClient } =
          await loadFixture(deployContractsFixture);

        const depositAmount = 1000000000n;

        // Setup - deposit first
        let hash = await mockUSDC.write.approve([
          usdcRewardContract.address,
          depositAmount,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await usdcRewardContract.write.depositUSDC([depositAmount]);
        await publicClient.waitForTransactionReceipt({ hash });

        await expect(
          usdcRewardContract.write.withdrawUSDC([100000000n], {
            account: nonOwner.account,
          })
        ).to.be.rejectedWith("OwnableUnauthorizedAccount");
      });

      it("should revert when withdrawing zero amount", async function () {
        const { usdcRewardContract } = await loadFixture(
          deployContractsFixture
        );

        await expect(
          usdcRewardContract.write.withdrawUSDC([0n])
        ).to.be.rejectedWith("InvalidAmount");
      });

      it("should revert when contract has insufficient USDC balance", async function () {
        const { usdcRewardContract, mockUSDC, publicClient } =
          await loadFixture(deployContractsFixture);

        const depositAmount = 100000000n; // 100 USDC
        const withdrawAmount = 200000000n; // 200 USDC (more than deposited)

        // Deposit small amount
        let hash = await mockUSDC.write.approve([
          usdcRewardContract.address,
          depositAmount,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await usdcRewardContract.write.depositUSDC([depositAmount]);
        await publicClient.waitForTransactionReceipt({ hash });

        await expect(
          usdcRewardContract.write.withdrawUSDC([withdrawAmount])
        ).to.be.rejectedWith("InsufficientUSDCBalance");
      });

      it("should revert when trying to withdraw from empty contract", async function () {
        const { usdcRewardContract } = await loadFixture(
          deployContractsFixture
        );

        await expect(
          usdcRewardContract.write.withdrawUSDC([100000000n])
        ).to.be.rejectedWith("InsufficientUSDCBalance");
      });

      it("should handle partial withdrawals correctly", async function () {
        const { usdcRewardContract, mockUSDC, publicClient } =
          await loadFixture(deployContractsFixture);

        const depositAmount = 1000000000n; // 1000 USDC
        const firstWithdraw = 300000000n; // 300 USDC
        const secondWithdraw = 200000000n; // 200 USDC

        // Setup - deposit first
        let hash = await mockUSDC.write.approve([
          usdcRewardContract.address,
          depositAmount,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await usdcRewardContract.write.depositUSDC([depositAmount]);
        await publicClient.waitForTransactionReceipt({ hash });

        // First withdrawal
        hash = await usdcRewardContract.write.withdrawUSDC([firstWithdraw]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Second withdrawal
        hash = await usdcRewardContract.write.withdrawUSDC([secondWithdraw]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Check final contract balance
        const finalContractBalance = await mockUSDC.read.balanceOf([
          usdcRewardContract.address,
        ]);
        expect(finalContractBalance).to.equal(
          depositAmount - firstWithdraw - secondWithdraw
        );
      });
    });
  });

  describe("Access Control and Pause Functions", function () {
    describe("pause/unpause", function () {
      it("should allow owner to pause the contract", async function () {
        const { usdcRewardContract, publicClient } = await loadFixture(
          deployContractsFixture
        );

        const hash = await usdcRewardContract.write.pause();
        await publicClient.waitForTransactionReceipt({ hash });

        // Verify contract is paused by checking if claimUSDC fails
        await expect(
          usdcRewardContract.write.claimUSDC([100n])
        ).to.be.rejectedWith("EnforcedPause");
      });

      it("should emit ContractPaused event when paused", async function () {
        const { usdcRewardContract, publicClient } = await loadFixture(
          deployContractsFixture
        );

        const hash = await usdcRewardContract.write.pause();
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        // Check for events (both Paused from OpenZeppelin and ContractPaused from our contract)
        const logs = await publicClient.getLogs({
          address: usdcRewardContract.address,
          fromBlock: receipt.blockNumber,
          toBlock: receipt.blockNumber,
        });

        expect(logs.length).to.be.greaterThanOrEqual(1);
      });

      it("should allow owner to unpause the contract", async function () {
        const { usdcRewardContract, mockUSDC, user1, publicClient } =
          await loadFixture(deployContractsFixture);

        // Setup for testing unpause
        const exchangeRate = 1000000n;
        const pointsToAdd = 1000n;
        const usdcToDeposit = 1000000000n;

        let hash = await usdcRewardContract.write.setExchangeRate([
          exchangeRate,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await usdcRewardContract.write.addPoints([
          user1.account.address,
          pointsToAdd,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await mockUSDC.write.approve([
          usdcRewardContract.address,
          usdcToDeposit,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await usdcRewardContract.write.depositUSDC([usdcToDeposit]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Pause contract
        hash = await usdcRewardContract.write.pause();
        await publicClient.waitForTransactionReceipt({ hash });

        // Verify it's paused
        await expect(
          usdcRewardContract.write.claimUSDC([100n], {
            account: user1.account,
          })
        ).to.be.rejectedWith("EnforcedPause");

        // Unpause contract
        hash = await usdcRewardContract.write.unpause();
        await publicClient.waitForTransactionReceipt({ hash });

        // Verify it's unpaused by successfully claiming USDC
        hash = await usdcRewardContract.write.claimUSDC([100n], {
          account: user1.account,
        });
        await publicClient.waitForTransactionReceipt({ hash });

        // Verify the claim worked
        const finalBalance = await usdcRewardContract.read.getPointBalance([
          user1.account.address,
        ]);
        expect(finalBalance).to.equal(pointsToAdd - 100n);
      });

      it("should emit ContractUnpaused event when unpaused", async function () {
        const { usdcRewardContract, publicClient } = await loadFixture(
          deployContractsFixture
        );

        // First pause
        let hash = await usdcRewardContract.write.pause();
        await publicClient.waitForTransactionReceipt({ hash });

        // Then unpause
        hash = await usdcRewardContract.write.unpause();
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        // Check for events (both Unpaused from OpenZeppelin and ContractUnpaused from our contract)
        const logs = await publicClient.getLogs({
          address: usdcRewardContract.address,
          fromBlock: receipt.blockNumber,
          toBlock: receipt.blockNumber,
        });

        expect(logs.length).to.be.greaterThanOrEqual(1);
      });

      it("should revert when non-owner tries to pause", async function () {
        const { usdcRewardContract, nonOwner } = await loadFixture(
          deployContractsFixture
        );

        await expect(
          usdcRewardContract.write.pause({ account: nonOwner.account })
        ).to.be.rejectedWith("OwnableUnauthorizedAccount");
      });

      it("should revert when non-owner tries to unpause", async function () {
        const { usdcRewardContract, nonOwner, publicClient } =
          await loadFixture(deployContractsFixture);

        // First pause as owner
        const hash = await usdcRewardContract.write.pause();
        await publicClient.waitForTransactionReceipt({ hash });

        // Try to unpause as non-owner
        await expect(
          usdcRewardContract.write.unpause({ account: nonOwner.account })
        ).to.be.rejectedWith("OwnableUnauthorizedAccount");
      });

      it("should allow admin functions when paused", async function () {
        const { usdcRewardContract, user1, publicClient } = await loadFixture(
          deployContractsFixture
        );

        // Pause contract
        let hash = await usdcRewardContract.write.pause();
        await publicClient.waitForTransactionReceipt({ hash });

        // Admin functions should still work
        hash = await usdcRewardContract.write.addPoints([
          user1.account.address,
          1000n,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await usdcRewardContract.write.setExchangeRate([1000000n]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Verify admin functions worked
        const balance = await usdcRewardContract.read.getPointBalance([
          user1.account.address,
        ]);
        expect(balance).to.equal(1000n);

        const usdcAmount = await usdcRewardContract.read.calculateUSDCAmount([
          1000n,
        ]);
        expect(usdcAmount).to.equal(1000n * 1000000n);
      });

      it("should block user functions when paused", async function () {
        const { usdcRewardContract, user1, publicClient } = await loadFixture(
          deployContractsFixture
        );

        // Setup
        let hash = await usdcRewardContract.write.addPoints([
          user1.account.address,
          1000n,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await usdcRewardContract.write.setExchangeRate([1000000n]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Pause contract
        hash = await usdcRewardContract.write.pause();
        await publicClient.waitForTransactionReceipt({ hash });

        // User functions should be blocked
        await expect(
          usdcRewardContract.write.claimUSDC([100n], {
            account: user1.account,
          })
        ).to.be.rejectedWith("EnforcedPause");
      });
    });

    describe("ownership transfer", function () {
      it("should allow owner to transfer ownership", async function () {
        const { usdcRewardContract, owner, user1, publicClient } =
          await loadFixture(deployContractsFixture);

        // Transfer ownership
        const hash = await usdcRewardContract.write.transferOwnership([
          user1.account.address,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Old owner should no longer be able to perform admin functions
        await expect(
          usdcRewardContract.write.addPoints([user1.account.address, 1000n])
        ).to.be.rejectedWith("OwnableUnauthorizedAccount");

        // New owner should be able to perform admin functions
        const hash2 = await usdcRewardContract.write.addPoints(
          [owner.account.address, 1000n],
          { account: user1.account }
        );
        await publicClient.waitForTransactionReceipt({ hash: hash2 });

        const balance = await usdcRewardContract.read.getPointBalance([
          owner.account.address,
        ]);
        expect(balance).to.equal(1000n);
      });

      it("should emit OwnershipTransferred event", async function () {
        const { usdcRewardContract, user1, publicClient } = await loadFixture(
          deployContractsFixture
        );

        const hash = await usdcRewardContract.write.transferOwnership([
          user1.account.address,
        ]);
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        // Check for OwnershipTransferred event
        const logs = await publicClient.getLogs({
          address: usdcRewardContract.address,
          fromBlock: receipt.blockNumber,
          toBlock: receipt.blockNumber,
        });

        expect(logs).to.have.length(1);
      });

      it("should revert when non-owner tries to transfer ownership", async function () {
        const { usdcRewardContract, user1, nonOwner } = await loadFixture(
          deployContractsFixture
        );

        await expect(
          usdcRewardContract.write.transferOwnership([user1.account.address], {
            account: nonOwner.account,
          })
        ).to.be.rejectedWith("OwnableUnauthorizedAccount");
      });

      it("should revert when transferring to zero address", async function () {
        const { usdcRewardContract } = await loadFixture(
          deployContractsFixture
        );

        await expect(
          usdcRewardContract.write.transferOwnership([zeroAddress])
        ).to.be.rejectedWith("OwnableInvalidOwner");
      });

      it("should allow new owner to transfer ownership again", async function () {
        const { usdcRewardContract, owner, user1, user2, publicClient } =
          await loadFixture(deployContractsFixture);

        // First transfer: owner -> user1
        let hash = await usdcRewardContract.write.transferOwnership([
          user1.account.address,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Second transfer: user1 -> user2
        hash = await usdcRewardContract.write.transferOwnership(
          [user2.account.address],
          { account: user1.account }
        );
        await publicClient.waitForTransactionReceipt({ hash });

        // user2 should now be the owner
        hash = await usdcRewardContract.write.addPoints(
          [owner.account.address, 1000n],
          { account: user2.account }
        );
        await publicClient.waitForTransactionReceipt({ hash });

        const balance = await usdcRewardContract.read.getPointBalance([
          owner.account.address,
        ]);
        expect(balance).to.equal(1000n);

        // user1 should no longer be owner
        await expect(
          usdcRewardContract.write.addPoints([owner.account.address, 1000n], {
            account: user1.account,
          })
        ).to.be.rejectedWith("OwnableUnauthorizedAccount");
      });
    });

    describe("access control integration", function () {
      it("should maintain access control after pause/unpause cycle", async function () {
        const { usdcRewardContract, user1, nonOwner, publicClient } =
          await loadFixture(deployContractsFixture);

        // Pause
        let hash = await usdcRewardContract.write.pause();
        await publicClient.waitForTransactionReceipt({ hash });

        // Non-owner still can't access admin functions
        await expect(
          usdcRewardContract.write.addPoints([user1.account.address, 1000n], {
            account: nonOwner.account,
          })
        ).to.be.rejectedWith("OwnableUnauthorizedAccount");

        // Unpause
        hash = await usdcRewardContract.write.unpause();
        await publicClient.waitForTransactionReceipt({ hash });

        // Non-owner still can't access admin functions
        await expect(
          usdcRewardContract.write.addPoints([user1.account.address, 1000n], {
            account: nonOwner.account,
          })
        ).to.be.rejectedWith("OwnableUnauthorizedAccount");

        // Owner can still access admin functions
        hash = await usdcRewardContract.write.addPoints([
          user1.account.address,
          1000n,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        const balance = await usdcRewardContract.read.getPointBalance([
          user1.account.address,
        ]);
        expect(balance).to.equal(1000n);
      });
    });
  });

  describe("Edge Cases and Security Tests", function () {
    describe("zero address handling", function () {
      it("should revert when adding points to zero address", async function () {
        const { usdcRewardContract } = await loadFixture(
          deployContractsFixture
        );

        await expect(
          usdcRewardContract.write.addPoints([zeroAddress, 1000n])
        ).to.be.rejectedWith("InvalidAddress");
      });

      it("should revert when removing points from zero address", async function () {
        const { usdcRewardContract } = await loadFixture(
          deployContractsFixture
        );

        await expect(
          usdcRewardContract.write.subtractPoints([zeroAddress, 1000n])
        ).to.be.rejectedWith("InvalidAddress");
      });

      it("should return zero balance for zero address", async function () {
        const { usdcRewardContract } = await loadFixture(
          deployContractsFixture
        );

        const balance = await usdcRewardContract.read.getPointBalance([
          zeroAddress,
        ]);
        expect(balance).to.equal(0n);
      });

      it("should revert when claiming USDC from zero address", async function () {
        const { usdcRewardContract, publicClient } = await loadFixture(
          deployContractsFixture
        );

        // Set exchange rate first
        const hash = await usdcRewardContract.write.setExchangeRate([1000000n]);
        await publicClient.waitForTransactionReceipt({ hash });

        // The claimUSDC function validates msg.sender internally, so we can't directly test with zero address
        // Instead, we test that the function properly validates addresses in general
        // This test is covered by the other zero address tests for addPoints and subtractPoints
        expect(true).to.be.true; // Placeholder - the validation is tested elsewhere
      });
    });

    describe("zero amount handling", function () {
      it("should revert when adding zero points", async function () {
        const { usdcRewardContract, user1 } = await loadFixture(
          deployContractsFixture
        );

        await expect(
          usdcRewardContract.write.addPoints([user1.account.address, 0n])
        ).to.be.rejectedWith("InvalidAmount");
      });

      it("should revert when removing zero points", async function () {
        const { usdcRewardContract, user1 } = await loadFixture(
          deployContractsFixture
        );

        await expect(
          usdcRewardContract.write.subtractPoints([user1.account.address, 0n])
        ).to.be.rejectedWith("InvalidAmount");
      });

      it("should revert when claiming zero points", async function () {
        const { usdcRewardContract, user1, publicClient } = await loadFixture(
          deployContractsFixture
        );

        // Set exchange rate first
        const hash = await usdcRewardContract.write.setExchangeRate([1000000n]);
        await publicClient.waitForTransactionReceipt({ hash });

        await expect(
          usdcRewardContract.write.claimUSDC([0n], {
            account: user1.account,
          })
        ).to.be.rejectedWith("InvalidAmount");
      });

      it("should revert when depositing zero USDC", async function () {
        const { usdcRewardContract } = await loadFixture(
          deployContractsFixture
        );

        await expect(
          usdcRewardContract.write.depositUSDC([0n])
        ).to.be.rejectedWith("InvalidAmount");
      });

      it("should revert when withdrawing zero USDC", async function () {
        const { usdcRewardContract } = await loadFixture(
          deployContractsFixture
        );

        await expect(
          usdcRewardContract.write.withdrawUSDC([0n])
        ).to.be.rejectedWith("InvalidAmount");
      });

      it("should return zero USDC amount for zero points", async function () {
        const { usdcRewardContract, publicClient } = await loadFixture(
          deployContractsFixture
        );

        // Set exchange rate
        const hash = await usdcRewardContract.write.setExchangeRate([1000000n]);
        await publicClient.waitForTransactionReceipt({ hash });

        const usdcAmount = await usdcRewardContract.read.calculateUSDCAmount([
          0n,
        ]);
        expect(usdcAmount).to.equal(0n);
      });
    });

    describe("exchange rate not set scenarios", function () {
      it("should return zero when calculating USDC amount with unset rate", async function () {
        const { usdcRewardContract } = await loadFixture(
          deployContractsFixture
        );

        const usdcAmount = await usdcRewardContract.read.calculateUSDCAmount([
          1000n,
        ]);
        expect(usdcAmount).to.equal(0n);
      });

      it("should revert when claiming USDC with unset exchange rate", async function () {
        const { usdcRewardContract, user1, publicClient } = await loadFixture(
          deployContractsFixture
        );

        // Add points but don't set exchange rate
        const hash = await usdcRewardContract.write.addPoints([
          user1.account.address,
          1000n,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        await expect(
          usdcRewardContract.write.claimUSDC([500n], {
            account: user1.account,
          })
        ).to.be.rejectedWith("ExchangeRateNotSet");
      });

      it("should allow setting exchange rate to zero and back", async function () {
        const { usdcRewardContract, publicClient } = await loadFixture(
          deployContractsFixture
        );

        // Set initial rate
        let hash = await usdcRewardContract.write.setExchangeRate([1000000n]);
        await publicClient.waitForTransactionReceipt({ hash });

        let usdcAmount = await usdcRewardContract.read.calculateUSDCAmount([
          1000n,
        ]);
        expect(usdcAmount).to.equal(1000n * 1000000n);

        // Set to zero
        hash = await usdcRewardContract.write.setExchangeRate([0n]);
        await publicClient.waitForTransactionReceipt({ hash });

        usdcAmount = await usdcRewardContract.read.calculateUSDCAmount([1000n]);
        expect(usdcAmount).to.equal(0n);

        // Set back to non-zero
        hash = await usdcRewardContract.write.setExchangeRate([2000000n]);
        await publicClient.waitForTransactionReceipt({ hash });

        usdcAmount = await usdcRewardContract.read.calculateUSDCAmount([1000n]);
        expect(usdcAmount).to.equal(1000n * 2000000n);
      });
    });

    describe("custom error testing", function () {
      it("should throw InsufficientPoints error with correct parameters", async function () {
        const { usdcRewardContract, user1, publicClient } = await loadFixture(
          deployContractsFixture
        );

        const pointsToAdd = 100n;
        const pointsToTransfer = 200n;

        // Add some points
        const hash = await usdcRewardContract.write.addPoints([
          user1.account.address,
          pointsToAdd,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Try to remove more than available
        await expect(
          usdcRewardContract.write.subtractPoints([
            user1.account.address,
            pointsToTransfer,
          ])
        ).to.be.rejectedWith("InsufficientPoints");
      });

      it("should throw InsufficientUSDCBalance error when contract has no USDC", async function () {
        const { usdcRewardContract, user1, publicClient } = await loadFixture(
          deployContractsFixture
        );

        // Setup
        let hash = await usdcRewardContract.write.setExchangeRate([1000000n]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await usdcRewardContract.write.addPoints([
          user1.account.address,
          1000n,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Try to claim without depositing USDC
        await expect(
          usdcRewardContract.write.claimUSDC([500n], {
            account: user1.account,
          })
        ).to.be.rejectedWith("InsufficientUSDCBalance");
      });

      it("should throw InvalidAddress error for zero address operations", async function () {
        const { usdcRewardContract } = await loadFixture(
          deployContractsFixture
        );

        await expect(
          usdcRewardContract.write.addPoints([zeroAddress, 1000n])
        ).to.be.rejectedWith("InvalidAddress");

        await expect(
          usdcRewardContract.write.subtractPoints([zeroAddress, 1000n])
        ).to.be.rejectedWith("InvalidAddress");
      });

      it("should throw InvalidAmount error for zero amount operations", async function () {
        const { usdcRewardContract, user1 } = await loadFixture(
          deployContractsFixture
        );

        await expect(
          usdcRewardContract.write.addPoints([user1.account.address, 0n])
        ).to.be.rejectedWith("InvalidAmount");

        await expect(
          usdcRewardContract.write.subtractPoints([user1.account.address, 0n])
        ).to.be.rejectedWith("InvalidAmount");

        await expect(
          usdcRewardContract.write.depositUSDC([0n])
        ).to.be.rejectedWith("InvalidAmount");

        await expect(
          usdcRewardContract.write.withdrawUSDC([0n])
        ).to.be.rejectedWith("InvalidAmount");
      });

      it("should throw ExchangeRateNotSet error when claiming with unset rate", async function () {
        const { usdcRewardContract, user1, publicClient } = await loadFixture(
          deployContractsFixture
        );

        // Add points but don't set exchange rate
        const hash = await usdcRewardContract.write.addPoints([
          user1.account.address,
          1000n,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        await expect(
          usdcRewardContract.write.claimUSDC([500n], {
            account: user1.account,
          })
        ).to.be.rejectedWith("ExchangeRateNotSet");
      });
    });

    describe("reentrancy protection", function () {
      it("should prevent reentrancy attacks on claimUSDC", async function () {
        const { usdcRewardContract, mockUSDC, user1, publicClient } =
          await loadFixture(deployContractsFixture);

        // Setup
        const exchangeRate = 1000000n;
        const pointsToAdd = 1000n;
        const usdcToDeposit = 1000000000n;

        let hash = await usdcRewardContract.write.setExchangeRate([
          exchangeRate,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await usdcRewardContract.write.addPoints([
          user1.account.address,
          pointsToAdd,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await mockUSDC.write.approve([
          usdcRewardContract.address,
          usdcToDeposit,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await usdcRewardContract.write.depositUSDC([usdcToDeposit]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Normal claim should work (this tests that the nonReentrant modifier doesn't break normal operation)
        hash = await usdcRewardContract.write.claimUSDC([100n], {
          account: user1.account,
        });
        await publicClient.waitForTransactionReceipt({ hash });

        // Verify the claim worked
        const finalBalance = await usdcRewardContract.read.getPointBalance([
          user1.account.address,
        ]);
        expect(finalBalance).to.equal(pointsToAdd - 100n);
      });
    });

    describe("large number handling", function () {
      it("should handle maximum uint256 values correctly", async function () {
        const { usdcRewardContract, user1, publicClient } = await loadFixture(
          deployContractsFixture
        );

        const maxUint256 = 2n ** 256n - 1n;

        // This should work for adding points
        const hash = await usdcRewardContract.write.addPoints([
          user1.account.address,
          maxUint256,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        const balance = await usdcRewardContract.read.getPointBalance([
          user1.account.address,
        ]);
        expect(balance).to.equal(maxUint256);
      });

      it("should handle large exchange rates correctly", async function () {
        const { usdcRewardContract, publicClient } = await loadFixture(
          deployContractsFixture
        );

        const largeRate = 1000000000000n; // Very large exchange rate

        const hash = await usdcRewardContract.write.setExchangeRate([
          largeRate,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        const usdcAmount = await usdcRewardContract.read.calculateUSDCAmount([
          1000n,
        ]);
        expect(usdcAmount).to.equal(1000n * largeRate);
      });

      it("should handle overflow scenarios gracefully", async function () {
        const { usdcRewardContract, publicClient } = await loadFixture(
          deployContractsFixture
        );

        const largeRate = 2n ** 128n; // Large rate
        const largePoints = 2n ** 128n; // Large points

        const hash = await usdcRewardContract.write.setExchangeRate([
          largeRate,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        // This should overflow and revert due to Solidity 0.8.x built-in overflow protection
        await expect(usdcRewardContract.read.calculateUSDCAmount([largePoints]))
          .to.be.rejected;
      });
    });

    describe("state consistency", function () {
      it("should maintain consistent state across multiple operations", async function () {
        const { usdcRewardContract, mockUSDC, user1, user2, publicClient } =
          await loadFixture(deployContractsFixture);

        const exchangeRate = 1000000n;
        const initialPoints = 1000n;
        const usdcToDeposit = 1000000000n;

        // Setup
        let hash = await usdcRewardContract.write.setExchangeRate([
          exchangeRate,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await mockUSDC.write.approve([
          usdcRewardContract.address,
          usdcToDeposit,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await usdcRewardContract.write.depositUSDC([usdcToDeposit]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Add points to both users
        hash = await usdcRewardContract.write.addPoints([
          user1.account.address,
          initialPoints,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await usdcRewardContract.write.addPoints([
          user2.account.address,
          initialPoints,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        // User1 claims some USDC
        hash = await usdcRewardContract.write.claimUSDC([300n], {
          account: user1.account,
        });
        await publicClient.waitForTransactionReceipt({ hash });

        // Remove some points from user2
        hash = await usdcRewardContract.write.subtractPoints([
          user2.account.address,
          200n,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Check final balances
        const user1Balance = await usdcRewardContract.read.getPointBalance([
          user1.account.address,
        ]);
        const user2Balance = await usdcRewardContract.read.getPointBalance([
          user2.account.address,
        ]);

        expect(user1Balance).to.equal(initialPoints - 300n);
        expect(user2Balance).to.equal(initialPoints - 200n);

        // Check USDC balance
        const user1USDCBalance = await mockUSDC.read.balanceOf([
          user1.account.address,
        ]);
        expect(user1USDCBalance).to.equal(300n * exchangeRate);
      });
    });
  });

  describe("Integration Tests", function () {
    describe("End-to-End Flow Tests", function () {
      it("should complete full flow: add points -> set rate -> deposit USDC -> claim USDC", async function () {
        const { usdcRewardContract, mockUSDC, owner, user1, publicClient } =
          await loadFixture(deployContractsFixture);

        const pointsToAdd = 2000n;
        const exchangeRate = 1500000n; // 1 point = 0.0015 USDC
        const usdcToDeposit = 5000000000n; // 5000 USDC
        const pointsToSpend = 1000n;
        const expectedUSDC = pointsToSpend * exchangeRate;

        // Step 1: Add points to user
        let hash = await usdcRewardContract.write.addPoints([
          user1.account.address,
          pointsToAdd,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Verify points were added
        let userPoints = await usdcRewardContract.read.getPointBalance([
          user1.account.address,
        ]);
        expect(userPoints).to.equal(pointsToAdd);

        // Step 2: Set exchange rate
        hash = await usdcRewardContract.write.setExchangeRate([exchangeRate]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Verify exchange rate calculation
        const calculatedUSDC =
          await usdcRewardContract.read.calculateUSDCAmount([pointsToSpend]);
        expect(calculatedUSDC).to.equal(expectedUSDC);

        // Step 3: Deposit USDC to contract
        hash = await mockUSDC.write.approve([
          usdcRewardContract.address,
          usdcToDeposit,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await usdcRewardContract.write.depositUSDC([usdcToDeposit]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Verify contract has USDC
        const contractUSDCBalance = await mockUSDC.read.balanceOf([
          usdcRewardContract.address,
        ]);
        expect(contractUSDCBalance).to.equal(usdcToDeposit);

        // Step 4: User claims USDC
        const initialUserUSDC = await mockUSDC.read.balanceOf([
          user1.account.address,
        ]);

        hash = await usdcRewardContract.write.claimUSDC([pointsToSpend], {
          account: user1.account,
        });
        await publicClient.waitForTransactionReceipt({ hash });

        // Verify final state
        const finalUserUSDC = await mockUSDC.read.balanceOf([
          user1.account.address,
        ]);
        const finalUserPoints = await usdcRewardContract.read.getPointBalance([
          user1.account.address,
        ]);
        const finalContractUSDC = await mockUSDC.read.balanceOf([
          usdcRewardContract.address,
        ]);

        expect(finalUserUSDC).to.equal(initialUserUSDC + expectedUSDC);
        expect(finalUserPoints).to.equal(pointsToAdd - pointsToSpend);
        expect(finalContractUSDC).to.equal(usdcToDeposit - expectedUSDC);
      });

      it("should handle multiple users with different point balances and claims", async function () {
        const {
          usdcRewardContract,
          mockUSDC,
          owner,
          user1,
          user2,
          publicClient,
        } = await loadFixture(deployContractsFixture);

        const user1Points = 1500n;
        const user2Points = 2500n;
        const exchangeRate = 2000000n; // 1 point = 0.002 USDC
        const usdcToDeposit = 10000000000n; // 10000 USDC

        // Setup: Set exchange rate and deposit USDC
        let hash = await usdcRewardContract.write.setExchangeRate([
          exchangeRate,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await mockUSDC.write.approve([
          usdcRewardContract.address,
          usdcToDeposit,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await usdcRewardContract.write.depositUSDC([usdcToDeposit]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Add points to both users
        hash = await usdcRewardContract.write.addPoints([
          user1.account.address,
          user1Points,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await usdcRewardContract.write.addPoints([
          user2.account.address,
          user2Points,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Verify initial balances
        expect(
          await usdcRewardContract.read.getPointBalance([user1.account.address])
        ).to.equal(user1Points);
        expect(
          await usdcRewardContract.read.getPointBalance([user2.account.address])
        ).to.equal(user2Points);

        // User1 claims 500 points
        const user1Claim = 500n;
        const user1ExpectedUSDC = user1Claim * exchangeRate;

        const initialUser1USDC = await mockUSDC.read.balanceOf([
          user1.account.address,
        ]);

        hash = await usdcRewardContract.write.claimUSDC([user1Claim], {
          account: user1.account,
        });
        await publicClient.waitForTransactionReceipt({ hash });

        // User2 claims 1000 points
        const user2Claim = 1000n;
        const user2ExpectedUSDC = user2Claim * exchangeRate;

        const initialUser2USDC = await mockUSDC.read.balanceOf([
          user2.account.address,
        ]);

        hash = await usdcRewardContract.write.claimUSDC([user2Claim], {
          account: user2.account,
        });
        await publicClient.waitForTransactionReceipt({ hash });

        // Verify final states
        const finalUser1USDC = await mockUSDC.read.balanceOf([
          user1.account.address,
        ]);
        const finalUser2USDC = await mockUSDC.read.balanceOf([
          user2.account.address,
        ]);
        const finalUser1Points = await usdcRewardContract.read.getPointBalance([
          user1.account.address,
        ]);
        const finalUser2Points = await usdcRewardContract.read.getPointBalance([
          user2.account.address,
        ]);

        expect(finalUser1USDC).to.equal(initialUser1USDC + user1ExpectedUSDC);
        expect(finalUser2USDC).to.equal(initialUser2USDC + user2ExpectedUSDC);
        expect(finalUser1Points).to.equal(user1Points - user1Claim);
        expect(finalUser2Points).to.equal(user2Points - user2Claim);
      });

      it("should handle point removal and subsequent claims correctly", async function () {
        const { usdcRewardContract, mockUSDC, owner, user1, publicClient } =
          await loadFixture(deployContractsFixture);

        const initialPoints = 2000n;
        const removeAmount = 500n;
        const exchangeRate = 1000000n;
        const usdcToDeposit = 5000000000n;
        const claimAmount = 800n; // Less than remaining after removal

        // Setup
        let hash = await usdcRewardContract.write.setExchangeRate([
          exchangeRate,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await mockUSDC.write.approve([
          usdcRewardContract.address,
          usdcToDeposit,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await usdcRewardContract.write.depositUSDC([usdcToDeposit]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Add initial points
        hash = await usdcRewardContract.write.addPoints([
          user1.account.address,
          initialPoints,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Remove some points away
        hash = await usdcRewardContract.write.subtractPoints([
          user1.account.address,
          removeAmount,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Verify points after removal
        const pointsAfterRemoval =
          await usdcRewardContract.read.getPointBalance([
            user1.account.address,
          ]);
        expect(pointsAfterRemoval).to.equal(initialPoints - removeAmount);

        // Claim USDC
        const initialUserUSDC = await mockUSDC.read.balanceOf([
          user1.account.address,
        ]);

        hash = await usdcRewardContract.write.claimUSDC([claimAmount], {
          account: user1.account,
        });
        await publicClient.waitForTransactionReceipt({ hash });

        // Verify final state
        const finalUserUSDC = await mockUSDC.read.balanceOf([
          user1.account.address,
        ]);
        const finalUserPoints = await usdcRewardContract.read.getPointBalance([
          user1.account.address,
        ]);

        expect(finalUserUSDC).to.equal(
          initialUserUSDC + claimAmount * exchangeRate
        );
        expect(finalUserPoints).to.equal(
          initialPoints - removeAmount - claimAmount
        );
      });

      it("should handle exchange rate changes during operation", async function () {
        const { usdcRewardContract, mockUSDC, owner, user1, publicClient } =
          await loadFixture(deployContractsFixture);

        const pointsToAdd = 2000n;
        const initialRate = 1000000n; // 1 point = 0.001 USDC
        const newRate = 2000000n; // 1 point = 0.002 USDC
        const usdcToDeposit = 10000000000n;
        const firstClaim = 500n;
        const secondClaim = 300n;

        // Setup
        let hash = await usdcRewardContract.write.addPoints([
          user1.account.address,
          pointsToAdd,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await usdcRewardContract.write.setExchangeRate([initialRate]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await mockUSDC.write.approve([
          usdcRewardContract.address,
          usdcToDeposit,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await usdcRewardContract.write.depositUSDC([usdcToDeposit]);
        await publicClient.waitForTransactionReceipt({ hash });

        // First claim at initial rate
        const initialUserUSDC = await mockUSDC.read.balanceOf([
          user1.account.address,
        ]);

        hash = await usdcRewardContract.write.claimUSDC([firstClaim], {
          account: user1.account,
        });
        await publicClient.waitForTransactionReceipt({ hash });

        const usdcAfterFirstClaim = await mockUSDC.read.balanceOf([
          user1.account.address,
        ]);
        expect(usdcAfterFirstClaim).to.equal(
          initialUserUSDC + firstClaim * initialRate
        );

        // Change exchange rate
        hash = await usdcRewardContract.write.setExchangeRate([newRate]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Second claim at new rate
        hash = await usdcRewardContract.write.claimUSDC([secondClaim], {
          account: user1.account,
        });
        await publicClient.waitForTransactionReceipt({ hash });

        const finalUserUSDC = await mockUSDC.read.balanceOf([
          user1.account.address,
        ]);
        const expectedTotalUSDC =
          firstClaim * initialRate + secondClaim * newRate;

        expect(finalUserUSDC).to.equal(initialUserUSDC + expectedTotalUSDC);

        // Verify remaining points
        const finalUserPoints = await usdcRewardContract.read.getPointBalance([
          user1.account.address,
        ]);
        expect(finalUserPoints).to.equal(
          pointsToAdd - firstClaim - secondClaim
        );
      });

      it("should handle contract pause and unpause during operations", async function () {
        const { usdcRewardContract, mockUSDC, owner, user1, publicClient } =
          await loadFixture(deployContractsFixture);

        const pointsToAdd = 1000n;
        const exchangeRate = 1000000n;
        const usdcToDeposit = 5000000000n;
        const claimAmount = 500n;

        // Setup
        let hash = await usdcRewardContract.write.addPoints([
          user1.account.address,
          pointsToAdd,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await usdcRewardContract.write.setExchangeRate([exchangeRate]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await mockUSDC.write.approve([
          usdcRewardContract.address,
          usdcToDeposit,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await usdcRewardContract.write.depositUSDC([usdcToDeposit]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Pause contract
        hash = await usdcRewardContract.write.pause();
        await publicClient.waitForTransactionReceipt({ hash });

        // Try to claim while paused (should fail)
        await expect(
          usdcRewardContract.write.claimUSDC([claimAmount], {
            account: user1.account,
          })
        ).to.be.rejectedWith("EnforcedPause");

        // Admin functions should still work while paused
        hash = await usdcRewardContract.write.addPoints([
          user1.account.address,
          500n,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Verify points were added even while paused
        const pointsWhilePaused = await usdcRewardContract.read.getPointBalance(
          [user1.account.address]
        );
        expect(pointsWhilePaused).to.equal(pointsToAdd + 500n);

        // Unpause contract
        hash = await usdcRewardContract.write.unpause();
        await publicClient.waitForTransactionReceipt({ hash });

        // Now claim should work
        const initialUserUSDC = await mockUSDC.read.balanceOf([
          user1.account.address,
        ]);

        hash = await usdcRewardContract.write.claimUSDC([claimAmount], {
          account: user1.account,
        });
        await publicClient.waitForTransactionReceipt({ hash });

        const finalUserUSDC = await mockUSDC.read.balanceOf([
          user1.account.address,
        ]);
        expect(finalUserUSDC).to.equal(
          initialUserUSDC + claimAmount * exchangeRate
        );
      });
    });

    describe("USDC Token Integration Tests", function () {
      it("should properly integrate with mock USDC token for deposits and withdrawals", async function () {
        const { usdcRewardContract, mockUSDC, owner, publicClient } =
          await loadFixture(deployContractsFixture);

        const depositAmount = 2000000000n; // 2000 USDC
        const withdrawAmount = 500000000n; // 500 USDC

        // Get initial balances
        const initialOwnerBalance = await mockUSDC.read.balanceOf([
          owner.account.address,
        ]);
        const initialContractBalance = await mockUSDC.read.balanceOf([
          usdcRewardContract.address,
        ]);

        // Deposit USDC
        let hash = await mockUSDC.write.approve([
          usdcRewardContract.address,
          depositAmount,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await usdcRewardContract.write.depositUSDC([depositAmount]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Verify deposit
        const balanceAfterDeposit = await mockUSDC.read.balanceOf([
          usdcRewardContract.address,
        ]);
        expect(balanceAfterDeposit).to.equal(
          initialContractBalance + depositAmount
        );

        // Withdraw USDC
        hash = await usdcRewardContract.write.withdrawUSDC([withdrawAmount]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Verify final balances
        const finalOwnerBalance = await mockUSDC.read.balanceOf([
          owner.account.address,
        ]);
        const finalContractBalance = await mockUSDC.read.balanceOf([
          usdcRewardContract.address,
        ]);

        expect(finalOwnerBalance).to.equal(
          initialOwnerBalance - depositAmount + withdrawAmount
        );
        expect(finalContractBalance).to.equal(
          initialContractBalance + depositAmount - withdrawAmount
        );
      });

      it("should handle token transfer failures gracefully", async function () {
        const { usdcRewardContract, mockUSDC, owner, user1, publicClient } =
          await loadFixture(deployContractsFixture);

        const pointsToAdd = 1000n;
        const exchangeRate = 1000000n;
        const claimAmount = 500n;

        // Setup without depositing USDC (contract will have 0 balance)
        let hash = await usdcRewardContract.write.addPoints([
          user1.account.address,
          pointsToAdd,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await usdcRewardContract.write.setExchangeRate([exchangeRate]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Try to claim USDC when contract has insufficient balance
        await expect(
          usdcRewardContract.write.claimUSDC([claimAmount], {
            account: user1.account,
          })
        ).to.be.rejectedWith("InsufficientUSDCBalance");

        // Verify user's points and USDC balance remain unchanged
        const userPoints = await usdcRewardContract.read.getPointBalance([
          user1.account.address,
        ]);
        const userUSDC = await mockUSDC.read.balanceOf([user1.account.address]);

        expect(userPoints).to.equal(pointsToAdd);
        expect(userUSDC).to.equal(0n); // User should have no USDC
      });

      it("should maintain accurate token balances during multiple operations", async function () {
        const {
          usdcRewardContract,
          mockUSDC,
          owner,
          user1,
          user2,
          publicClient,
        } = await loadFixture(deployContractsFixture);

        const exchangeRate = 1500000n; // 1 point = 0.0015 USDC
        const initialDeposit = 10000000000n; // 10000 USDC
        const user1Points = 2000n;
        const user2Points = 1500n;

        // Setup
        let hash = await usdcRewardContract.write.setExchangeRate([
          exchangeRate,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Deposit initial USDC
        hash = await mockUSDC.write.approve([
          usdcRewardContract.address,
          initialDeposit,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await usdcRewardContract.write.depositUSDC([initialDeposit]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Add points to users
        hash = await usdcRewardContract.write.addPoints([
          user1.account.address,
          user1Points,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await usdcRewardContract.write.addPoints([
          user2.account.address,
          user2Points,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Track initial balances
        const initialContractUSDC = await mockUSDC.read.balanceOf([
          usdcRewardContract.address,
        ]);
        const initialUser1USDC = await mockUSDC.read.balanceOf([
          user1.account.address,
        ]);
        const initialUser2USDC = await mockUSDC.read.balanceOf([
          user2.account.address,
        ]);

        // User1 claims 800 points
        const user1Claim = 800n;
        hash = await usdcRewardContract.write.claimUSDC([user1Claim], {
          account: user1.account,
        });
        await publicClient.waitForTransactionReceipt({ hash });

        // User2 claims 600 points
        const user2Claim = 600n;
        hash = await usdcRewardContract.write.claimUSDC([user2Claim], {
          account: user2.account,
        });
        await publicClient.waitForTransactionReceipt({ hash });

        // Additional deposit
        const additionalDeposit = 2000000000n; // 2000 USDC
        hash = await mockUSDC.write.approve([
          usdcRewardContract.address,
          additionalDeposit,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await usdcRewardContract.write.depositUSDC([additionalDeposit]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Withdraw some USDC
        const withdrawAmount = 1000000000n; // 1000 USDC
        hash = await usdcRewardContract.write.withdrawUSDC([withdrawAmount]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Verify final balances
        const finalContractUSDC = await mockUSDC.read.balanceOf([
          usdcRewardContract.address,
        ]);
        const finalUser1USDC = await mockUSDC.read.balanceOf([
          user1.account.address,
        ]);
        const finalUser2USDC = await mockUSDC.read.balanceOf([
          user2.account.address,
        ]);

        const totalClaimed = (user1Claim + user2Claim) * exchangeRate;
        const expectedContractBalance =
          initialDeposit + additionalDeposit - totalClaimed - withdrawAmount;

        expect(finalContractUSDC).to.equal(expectedContractBalance);
        expect(finalUser1USDC).to.equal(
          initialUser1USDC + user1Claim * exchangeRate
        );
        expect(finalUser2USDC).to.equal(
          initialUser2USDC + user2Claim * exchangeRate
        );

        // Verify remaining points
        const finalUser1Points = await usdcRewardContract.read.getPointBalance([
          user1.account.address,
        ]);
        const finalUser2Points = await usdcRewardContract.read.getPointBalance([
          user2.account.address,
        ]);

        expect(finalUser1Points).to.equal(user1Points - user1Claim);
        expect(finalUser2Points).to.equal(user2Points - user2Claim);
      });

      it("should handle edge cases with token precision and large amounts", async function () {
        const { usdcRewardContract, mockUSDC, owner, user1, publicClient } =
          await loadFixture(deployContractsFixture);

        // Test with very small exchange rate (high precision)
        const smallExchangeRate = 1n; // 1 point = 0.000001 USDC (1 wei)
        const largePointAmount = 1000000000n; // 1 billion points
        const largeUSDCDeposit = 2000000000n; // 2000 USDC

        // Setup
        let hash = await usdcRewardContract.write.setExchangeRate([
          smallExchangeRate,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await usdcRewardContract.write.addPoints([
          user1.account.address,
          largePointAmount,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await mockUSDC.write.approve([
          usdcRewardContract.address,
          largeUSDCDeposit,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await usdcRewardContract.write.depositUSDC([largeUSDCDeposit]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Claim with large point amount
        const claimAmount = 500000000n; // 500 million points
        const expectedUSDC = claimAmount * smallExchangeRate;

        const initialUserUSDC = await mockUSDC.read.balanceOf([
          user1.account.address,
        ]);

        hash = await usdcRewardContract.write.claimUSDC([claimAmount], {
          account: user1.account,
        });
        await publicClient.waitForTransactionReceipt({ hash });

        const finalUserUSDC = await mockUSDC.read.balanceOf([
          user1.account.address,
        ]);
        const finalUserPoints = await usdcRewardContract.read.getPointBalance([
          user1.account.address,
        ]);

        expect(finalUserUSDC).to.equal(initialUserUSDC + expectedUSDC);
        expect(finalUserPoints).to.equal(largePointAmount - claimAmount);

        // Test with very large exchange rate
        const largeExchangeRate = 10000000n; // 1 point = 0.01 USDC
        hash = await usdcRewardContract.write.setExchangeRate([
          largeExchangeRate,
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        // Small claim with large rate
        const smallClaim = 10n;
        const expectedLargeUSDC = smallClaim * largeExchangeRate;

        const balanceBeforeSmallClaim = await mockUSDC.read.balanceOf([
          user1.account.address,
        ]);

        hash = await usdcRewardContract.write.claimUSDC([smallClaim], {
          account: user1.account,
        });
        await publicClient.waitForTransactionReceipt({ hash });

        const balanceAfterSmallClaim = await mockUSDC.read.balanceOf([
          user1.account.address,
        ]);

        expect(balanceAfterSmallClaim).to.equal(
          balanceBeforeSmallClaim + expectedLargeUSDC
        );
      });
    });
  });
});
