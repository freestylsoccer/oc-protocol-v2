import { TestEnv, makeSuite } from './helpers/make-suite';
import { APPROVAL_AMOUNT_LENDING_POOL, RAY } from '../../helpers/constants';
import { convertToCurrencyDecimals } from '../../helpers/contracts-helpers';
import { ProtocolErrors } from '../../helpers/types';
// import { strategyWETH, strategyDAI } from '../../markets/aave/reservesConfigs';
import { strategyDAI } from '../../markets/pofi/reservesConfigs';

const { expect } = require('chai');

makeSuite('LendingPoolConfigurator', (testEnv: TestEnv) => {
  const {
    CALLER_NOT_POOL_ADMIN,
    LPC_RESERVE_LIQUIDITY_NOT_0,
    RC_INVALID_LTV,
    RC_INVALID_LIQ_THRESHOLD,
    RC_INVALID_LIQ_BONUS,
    RC_INVALID_DECIMALS,
    RC_INVALID_RESERVE_FACTOR,
  } = ProtocolErrors;

  it('Reverts trying to set an invalid reserve factor', async () => {
    const { configurator, allReserves } = testEnv;

    const invalidReserveFactor = 65536;

    await expect(
      configurator.setReserveFactor(allReserves[0], invalidReserveFactor)
    ).to.be.revertedWith(RC_INVALID_RESERVE_FACTOR);
  });

  it('Deactivates the DAI reserve', async () => {
    const { configurator, dai, helpersContract, allReserves } = testEnv;
    await configurator.deactivateReserve(allReserves[1]);
    const { isActive } = await helpersContract.getReserveConfigurationData(allReserves[1]);
    expect(isActive).to.be.equal(false);
  });
  
  it('Rectivates the DAI reserve', async () => {
    const { configurator, weth, helpersContract, allReserves } = testEnv;
    await configurator.activateReserve(allReserves[1]);

    const { isActive } = await helpersContract.getReserveConfigurationData(allReserves[1]);
    expect(isActive).to.be.equal(true);
  });
  
  it('Check the onlyAaveAdmin on deactivateReserve ', async () => {
    const { configurator, users, weth, allReserves } = testEnv;
    await expect(
      configurator.connect(users[2].signer).deactivateReserve(allReserves[1]),
      CALLER_NOT_POOL_ADMIN
    ).to.be.revertedWith(CALLER_NOT_POOL_ADMIN);
  });
  
  it('Check the onlyAaveAdmin on activateReserve ', async () => {
    const { configurator, users, weth, allReserves } = testEnv;
    await expect(
      configurator.connect(users[2].signer).activateReserve(allReserves[1]),
      CALLER_NOT_POOL_ADMIN
    ).to.be.revertedWith(CALLER_NOT_POOL_ADMIN);
  });  
  
  it('Freezes the DAI reserve', async () => {
    const { configurator, weth, helpersContract, allReserves } = testEnv;

    await configurator.freezeReserve(allReserves[1]);
    const {
      decimals,
      ltv,
      liquidationBonus,
      liquidationThreshold,
      reserveFactor,
      stableBorrowRateEnabled,
      borrowingEnabled,
      isActive,
      isFrozen,
    } = await helpersContract.getReserveConfigurationData(allReserves[1]);

    expect(borrowingEnabled).to.be.equal(false);
    expect(isActive).to.be.equal(true);
    expect(isFrozen).to.be.equal(true);
    expect(decimals).to.be.equal(strategyDAI.reserveDecimals);
    expect(ltv).to.be.equal(strategyDAI.baseLTVAsCollateral);
    expect(liquidationThreshold).to.be.equal(strategyDAI.liquidationThreshold);
    expect(liquidationBonus).to.be.equal(strategyDAI.liquidationBonus);
    expect(stableBorrowRateEnabled).to.be.equal(strategyDAI.stableBorrowRateEnabled);
    expect(reserveFactor).to.be.equal(strategyDAI.reserveFactor);
  });

  it('Unfreezes the DAI reserve', async () => {
    const { configurator, helpersContract, weth, allReserves } = testEnv;
    await configurator.unfreezeReserve(allReserves[1]);

    const {
      decimals,
      ltv,
      liquidationBonus,
      liquidationThreshold,
      reserveFactor,
      stableBorrowRateEnabled,
      borrowingEnabled,
      isActive,
      isFrozen,
    } = await helpersContract.getReserveConfigurationData(allReserves[1]);

    expect(borrowingEnabled).to.be.equal(false);
    expect(isActive).to.be.equal(true);
    expect(isFrozen).to.be.equal(false);
    expect(decimals).to.be.equal(strategyDAI.reserveDecimals);
    expect(ltv).to.be.equal(strategyDAI.baseLTVAsCollateral);
    expect(liquidationThreshold).to.be.equal(strategyDAI.liquidationThreshold);
    expect(liquidationBonus).to.be.equal(strategyDAI.liquidationBonus);
    expect(stableBorrowRateEnabled).to.be.equal(strategyDAI.stableBorrowRateEnabled);
    expect(reserveFactor).to.be.equal(strategyDAI.reserveFactor);
  });

  it('Check the onlyAaveAdmin on freezeReserve ', async () => {
    const { configurator, users, weth, allReserves } = testEnv;
    await expect(
      configurator.connect(users[2].signer).freezeReserve(allReserves[1]),
      CALLER_NOT_POOL_ADMIN
    ).to.be.revertedWith(CALLER_NOT_POOL_ADMIN);
  });

  it('Check the onlyAaveAdmin on unfreezeReserve ', async () => {
    const { configurator, users, weth, allReserves } = testEnv;
    await expect(
      configurator.connect(users[2].signer).unfreezeReserve(allReserves[1]),
      CALLER_NOT_POOL_ADMIN
    ).to.be.revertedWith(CALLER_NOT_POOL_ADMIN);
  });

  it('Deactivates the DAI reserve for borrowing', async () => {
    const { configurator, helpersContract, weth, allReserves } = testEnv;
    await configurator.disableBorrowingOnReserve(allReserves[1]);
    const {
      decimals,
      ltv,
      liquidationBonus,
      liquidationThreshold,
      reserveFactor,
      stableBorrowRateEnabled,
      borrowingEnabled,
      isActive,
      isFrozen,
    } = await helpersContract.getReserveConfigurationData(allReserves[1]);

    expect(borrowingEnabled).to.be.equal(false);
    expect(isActive).to.be.equal(true);
    expect(isFrozen).to.be.equal(false);
    expect(decimals).to.be.equal(strategyDAI.reserveDecimals);
    expect(ltv).to.be.equal(strategyDAI.baseLTVAsCollateral);
    expect(liquidationThreshold).to.be.equal(strategyDAI.liquidationThreshold);
    expect(liquidationBonus).to.be.equal(strategyDAI.liquidationBonus);
    expect(stableBorrowRateEnabled).to.be.equal(strategyDAI.stableBorrowRateEnabled);
    expect(reserveFactor).to.be.equal(strategyDAI.reserveFactor);
  });
  
  it('Activates the DAI reserve for borrowing', async () => {
    const { configurator, weth, helpersContract, allReserves } = testEnv;
    await configurator.enableBorrowingOnReserve(allReserves[1], true);
    const { variableBorrowIndex } = await helpersContract.getReserveData(allReserves[1]);

    const {
      decimals,
      ltv,
      liquidationBonus,
      liquidationThreshold,
      reserveFactor,
      stableBorrowRateEnabled,
      borrowingEnabled,
      isActive,
      isFrozen,
    } = await helpersContract.getReserveConfigurationData(allReserves[1]);

    expect(borrowingEnabled).to.be.equal(true);
    expect(isActive).to.be.equal(true);
    expect(isFrozen).to.be.equal(false);
    expect(decimals).to.be.equal(strategyDAI.reserveDecimals);
    expect(ltv).to.be.equal(strategyDAI.baseLTVAsCollateral);
    expect(liquidationThreshold).to.be.equal(strategyDAI.liquidationThreshold);
    expect(liquidationBonus).to.be.equal(strategyDAI.liquidationBonus);
    expect(stableBorrowRateEnabled).to.be.equal(true);
    expect(reserveFactor).to.be.equal(strategyDAI.reserveFactor);

    expect(variableBorrowIndex.toString()).to.be.equal(RAY);
  });

  it('Check the onlyAaveAdmin on disableBorrowingOnReserve ', async () => {
    const { configurator, users, allReserves } = testEnv;
    await expect(
      configurator.connect(users[2].signer).disableBorrowingOnReserve(allReserves[1]),
      CALLER_NOT_POOL_ADMIN
    ).to.be.revertedWith(CALLER_NOT_POOL_ADMIN);
  });

  it('Check the onlyAaveAdmin on enableBorrowingOnReserve ', async () => {
    const { configurator, users, allReserves } = testEnv;
    await expect(
      configurator.connect(users[2].signer).enableBorrowingOnReserve(allReserves[1], true),
      CALLER_NOT_POOL_ADMIN
    ).to.be.revertedWith(CALLER_NOT_POOL_ADMIN);
  });

  it('Deactivates the DAI reserve as collateral', async () => {
    const { configurator, helpersContract, allReserves } = testEnv;
    await configurator.configureReserveAsCollateral(allReserves[1], 0, 0, 0);

    const {
      decimals,
      ltv,
      liquidationBonus,
      liquidationThreshold,
      reserveFactor,
      stableBorrowRateEnabled,
      borrowingEnabled,
      isActive,
      isFrozen,
    } = await helpersContract.getReserveConfigurationData(allReserves[1]);

    expect(borrowingEnabled).to.be.equal(true);
    expect(isActive).to.be.equal(true);
    expect(isFrozen).to.be.equal(false);
    expect(decimals).to.be.equal(18);
    expect(ltv).to.be.equal(0);
    expect(liquidationThreshold).to.be.equal(0);
    expect(liquidationBonus).to.be.equal(0);
    expect(stableBorrowRateEnabled).to.be.equal(true);
    expect(reserveFactor).to.be.equal(strategyDAI.reserveFactor);
  });

  it('Activates the DAI reserve as collateral', async () => {
    const { configurator, helpersContract, allReserves } = testEnv;
    await configurator.configureReserveAsCollateral(allReserves[1], '7500', '8000', '10500');

    const {
      decimals,
      ltv,
      liquidationBonus,
      liquidationThreshold,
      reserveFactor,
      stableBorrowRateEnabled,
      borrowingEnabled,
      isActive,
      isFrozen,
    } = await helpersContract.getReserveConfigurationData(allReserves[1]);

    expect(borrowingEnabled).to.be.equal(true);
    expect(isActive).to.be.equal(true);
    expect(isFrozen).to.be.equal(false);
    expect(decimals).to.be.equal(strategyDAI.reserveDecimals);
    expect(ltv).to.be.equal(strategyDAI.baseLTVAsCollateral);
    expect(liquidationThreshold).to.be.equal(strategyDAI.liquidationThreshold);
    expect(liquidationBonus).to.be.equal(strategyDAI.liquidationBonus);
    expect(stableBorrowRateEnabled).to.be.equal(true);
    expect(reserveFactor).to.be.equal(strategyDAI.reserveFactor);
  });

  it('Check the onlyAaveAdmin on configureReserveAsCollateral ', async () => {
    const { configurator, users, allReserves } = testEnv;
    await expect(
      configurator
        .connect(users[2].signer)
        .configureReserveAsCollateral(allReserves[1], '7500', '8000', '10500'),
      CALLER_NOT_POOL_ADMIN
    ).to.be.revertedWith(CALLER_NOT_POOL_ADMIN);
  });

  it('Disable stable borrow rate on the DAI reserve', async () => {
    const { configurator, helpersContract, allReserves } = testEnv;
    await configurator.disableReserveStableRate(allReserves[1]);
    const {
      decimals,
      ltv,
      liquidationBonus,
      liquidationThreshold,
      reserveFactor,
      stableBorrowRateEnabled,
      borrowingEnabled,
      isActive,
      isFrozen,
    } = await helpersContract.getReserveConfigurationData(allReserves[1]);

    expect(borrowingEnabled).to.be.equal(true);
    expect(isActive).to.be.equal(true);
    expect(isFrozen).to.be.equal(false);
    expect(decimals).to.be.equal(strategyDAI.reserveDecimals);
    expect(ltv).to.be.equal(strategyDAI.baseLTVAsCollateral);
    expect(liquidationThreshold).to.be.equal(strategyDAI.liquidationThreshold);
    expect(liquidationBonus).to.be.equal(strategyDAI.liquidationBonus);
    expect(stableBorrowRateEnabled).to.be.equal(false);
    expect(reserveFactor).to.be.equal(strategyDAI.reserveFactor);
  });

  it('Enables stable borrow rate on the DAI reserve', async () => {
    const { configurator, helpersContract, allReserves } = testEnv;
    await configurator.enableReserveStableRate(allReserves[1]);
    const {
      decimals,
      ltv,
      liquidationBonus,
      liquidationThreshold,
      reserveFactor,
      stableBorrowRateEnabled,
      borrowingEnabled,
      isActive,
      isFrozen,
    } = await helpersContract.getReserveConfigurationData(allReserves[1]);

    expect(borrowingEnabled).to.be.equal(true);
    expect(isActive).to.be.equal(true);
    expect(isFrozen).to.be.equal(false);
    expect(decimals).to.be.equal(strategyDAI.reserveDecimals);
    expect(ltv).to.be.equal(strategyDAI.baseLTVAsCollateral);
    expect(liquidationThreshold).to.be.equal(strategyDAI.liquidationThreshold);
    expect(liquidationBonus).to.be.equal(strategyDAI.liquidationBonus);
    expect(stableBorrowRateEnabled).to.be.equal(true);
    expect(reserveFactor).to.be.equal(strategyDAI.reserveFactor);
  });

  it('Check the onlyAaveAdmin on disableReserveStableRate', async () => {
    const { configurator, users, allReserves } = testEnv;
    await expect(
      configurator.connect(users[2].signer).disableReserveStableRate(allReserves[1]),
      CALLER_NOT_POOL_ADMIN
    ).to.be.revertedWith(CALLER_NOT_POOL_ADMIN);
  });

  it('Check the onlyAaveAdmin on enableReserveStableRate', async () => {
    const { configurator, users, allReserves } = testEnv;
    await expect(
      configurator.connect(users[2].signer).enableReserveStableRate(allReserves[1]),
      CALLER_NOT_POOL_ADMIN
    ).to.be.revertedWith(CALLER_NOT_POOL_ADMIN);
  });
  
  it('Changes the reserve factor of DAI', async () => {
    const { configurator, helpersContract, weth, allReserves } = testEnv;
    await configurator.setReserveFactor(allReserves[1], '1000');
    const {
      decimals,
      ltv,
      liquidationBonus,
      liquidationThreshold,
      reserveFactor,
      stableBorrowRateEnabled,
      borrowingEnabled,
      isActive,
      isFrozen,
    } = await helpersContract.getReserveConfigurationData(allReserves[1]);

    expect(borrowingEnabled).to.be.equal(true);
    expect(isActive).to.be.equal(true);
    expect(isFrozen).to.be.equal(false);
    expect(decimals).to.be.equal(strategyDAI.reserveDecimals);
    expect(ltv).to.be.equal(strategyDAI.baseLTVAsCollateral);
    expect(liquidationThreshold).to.be.equal(strategyDAI.liquidationThreshold);
    expect(liquidationBonus).to.be.equal(strategyDAI.liquidationBonus);
    expect(stableBorrowRateEnabled).to.be.equal(true);
    expect(reserveFactor).to.be.equal(1000);
  });

  it('Check the onlyLendingPoolManager on setReserveFactor', async () => {
    const { configurator, users, allReserves } = testEnv;
    await expect(
      configurator.connect(users[2].signer).setReserveFactor(allReserves[1], '2000'),
      CALLER_NOT_POOL_ADMIN
    ).to.be.revertedWith(CALLER_NOT_POOL_ADMIN);
  });

  it('Reverts when trying to disable the DAI reserve with liquidity on it', async () => {
    const { dai, pool, configurator, allReserves } = testEnv;
    const userAddress = await pool.signer.getAddress();
    await dai.mint(await convertToCurrencyDecimals(dai.address, '1000'));

    //approve protocol to access depositor wallet
    await dai.approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);
    const amountDAItoDeposit = await convertToCurrencyDecimals(dai.address, '1000');

    // await configurator.enableDepositsOnReserve(allReserves[1]);
    //user 1 deposits 1000 DAI
    await pool.deposit(allReserves[1], dai.address, amountDAItoDeposit, userAddress);

    await expect(
      configurator.deactivateReserve(allReserves[1]),
      LPC_RESERVE_LIQUIDITY_NOT_0
    ).to.be.revertedWith(LPC_RESERVE_LIQUIDITY_NOT_0);
  });

  it('Update project borrower in the DIA reserve ', async () => {
    const { configurator, pool, helpersContract, weth, allReserves } = testEnv;

    await configurator.updateProjectBorrower(allReserves[1], "0x2c5CeF061409B80e48b6e9cCc636Ebe58023d1A9");

    const {
      projectBorrower
    } = await pool.getReserveData(allReserves[1]);
    expect(projectBorrower).to.be.equal("0x2c5CeF061409B80e48b6e9cCc636Ebe58023d1A9");
  });

  it('Update rates in the DAI reserve ', async () => {
    const { configurator, helpersContract, weth, allReserves } = testEnv;

    await configurator.updateReserveRates(
      allReserves[1],
      "1500000000000000000000000",
      "1600000000000000000000000"
    );
    const {
      liquidityRate,
      variableBorrowRate,
      stableBorrowRate
    } = await helpersContract.getReserveData(allReserves[1]);

    expect(liquidityRate).to.be.equal("0x013da329b6336471800000");
    expect(variableBorrowRate).to.be.equal("0x0152d02c7e14af68000000");
    expect(stableBorrowRate).to.be.equal("0x0152d02c7e14af68000000");
  });

  it('Check the onlyAaveAdmin on updateProjectBorrower ', async () => {
    const { configurator, users, weth, allReserves } = testEnv;

    await expect(
      configurator.connect(users[2].signer).updateProjectBorrower(allReserves[1], "0x2c5CeF061409B80e48b6e9cCc636Ebe58023d1A9"),
      CALLER_NOT_POOL_ADMIN
    ).to.be.revertedWith(CALLER_NOT_POOL_ADMIN);
  });

  it('Check the onlyAaveAdmin on updateReserveRates ', async () => {
    const { configurator, users, weth, allReserves } = testEnv;

    await expect(
      configurator.connect(users[2].signer).updateReserveRates(
      allReserves[1],
      "1500000000000000000000000",
      "1600000000000000000000000"
      ),
      CALLER_NOT_POOL_ADMIN
    ).to.be.revertedWith(CALLER_NOT_POOL_ADMIN);
  });
});
