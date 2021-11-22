import { makeSuite, TestEnv } from './helpers/make-suite';
import { ProtocolErrors, RateMode } from '../../helpers/types';
import { APPROVAL_AMOUNT_LENDING_POOL, oneEther } from '../../helpers/constants';
import { convertToCurrencyDecimals } from '../../helpers/contracts-helpers';
import { parseEther, parseUnits } from 'ethers/lib/utils';
import { BigNumber } from 'bignumber.js';
import { MockFlashLoanReceiver } from '../../types/MockFlashLoanReceiver';
import { getMockFlashLoanReceiver } from '../../helpers/contracts-getters';
import { strategyDAI } from '../../markets/pofi/reservesConfigs';

const { expect } = require('chai');

makeSuite('Deposit, Borrow, Withdraw, Repay ', (testEnv: TestEnv) => {
  // let _mockFlashLoanReceiver = {} as MockFlashLoanReceiver;

  const {
    LP_IS_PAUSED,
    INVALID_FROM_BALANCE_AFTER_TRANSFER,
    INVALID_TO_BALANCE_AFTER_TRANSFER,
    VL_NOT_ENOUGH_AVAILABLE_USER_BALANCE,
  } = ProtocolErrors;

  before(async () => {
    // _mockFlashLoanReceiver = await getMockFlashLoanReceiver();
  });
  
  it('Deposit', async () => {
    const { users, pool, dai, aDai, pToken, configurator, allReserves, helpersContract } = testEnv;

    const amountDAItoDeposit = await convertToCurrencyDecimals(dai.address, '1000');

    await dai.connect(users[1].signer).mint(amountDAItoDeposit);
    // user 0 deposits 1000 DAI
    await dai.connect(users[1].signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);
    // console.log(await helpersContract.getReserveData(allReserves[1]));
    // console.log(await helpersContract.getReserveConfigurationData(allReserves[1]));
    await pool.connect(users[1].signer).deposit(allReserves[1], dai.address, amountDAItoDeposit, users[1].address);
    // console.log(await dai.balanceOf(aDai.address));
    // console.log(await pool.getReserveData(allReserves[1]));
    // console.log(await aDai.getIncentivesController());
    function timeout(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    console.log(await pool.getReserveNormalizedIncome(allReserves[1])); 

    let balance = await aDai.balanceOf(users[1].address);
    console.log(balance);
    
    console.log('pToken balance:')
    console.log(await pToken.balanceOf(users[1].address))

    await expect(balance).to.be.equal(amountDAItoDeposit);
  });

  it('Set interest rates ', async () => {
    const { users, pool, configurator, allReserves, helpersContract, aDai, dai } = testEnv;
    // console.log(await pool.getReserveData(allReserves[1]));
    await configurator.updateReserveRates(allReserves[1], "149836137868559762747440042", "63644321225180017306639757");
    // console.log(await helpersContract.getReserveData(allReserves[1]));
    console.log(await pool.getReserveNormalizedIncome(allReserves[1])); 
    // console.log(await helpersContract.getReserveData(allReserves[4]));
    // await configurator.updateReserveRates(allReserves[4], "149836137868559762747440042", "63644321225180017306639757"); 
    // console.log(await helpersContract.getReserveData(allReserves[4]));
    // console.log(await pool.getReserveNormalizedIncome(allReserves[4]));
    let balance = await aDai.balanceOf(users[1].address);
    console.log(balance);
  });

  it('Deposit 2', async () => {
    const { users, pool, dai, aDai, pToken, configurator, allReserves, helpersContract } = testEnv;

    const amountDAItoDeposit = await convertToCurrencyDecimals(dai.address, '1000');

    await dai.connect(users[2].signer).mint(amountDAItoDeposit);
    // user 0 deposits 1000 DAI
    await dai.connect(users[2].signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);
    // console.log(await helpersContract.getReserveData(allReserves[1]));
    // console.log(await helpersContract.getReserveConfigurationData(allReserves[1]));
    await pool.connect(users[2].signer).deposit(allReserves[1], dai.address, amountDAItoDeposit, users[2].address);
    // console.log(await dai.balanceOf(aDai.address));
    // console.log(await pool.getReserveData(allReserves[1]));
    // console.log(await aDai.getIncentivesController());
    function timeout(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    await timeout(60000)

    console.log(await pool.getReserveNormalizedIncome(allReserves[1])); 
    
    console.log(await aDai.balanceOf(users[2].address));

    console.log('Balance user 1:');
    let balance = await aDai.balanceOf(users[1].address);
    console.log(balance);
    console.log('pToken balance:')
    console.log(await pToken.balanceOf(users[1].address))

    await expect(balance).to.be.equal(amountDAItoDeposit);
  });
  it('Deposit 3', async () => {
    const { users, pool, dai, aDai, pToken, configurator, allReserves, helpersContract } = testEnv;

    const amountDAItoDeposit = await convertToCurrencyDecimals(dai.address, '1000');

    await dai.connect(users[3].signer).mint(amountDAItoDeposit);
    // user 0 deposits 1000 DAI
    await dai.connect(users[3].signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);
    // console.log(await helpersContract.getReserveData(allReserves[1]));
    // console.log(await helpersContract.getReserveConfigurationData(allReserves[1]));
    await pool.connect(users[3].signer).deposit(allReserves[1], dai.address, amountDAItoDeposit, users[3].address);
    // console.log(await dai.balanceOf(aDai.address));
    // console.log(await pool.getReserveData(allReserves[1]));
    // console.log(await aDai.getIncentivesController());
    console.log(await pool.getReserveNormalizedIncome(allReserves[1])); 

    console.log(await aDai.balanceOf(users[3].address));
    
    console.log('Balance user 1:');
    let balance = await aDai.balanceOf(users[1].address);
    console.log(balance);
    console.log('pToken balance:')
    console.log(await pToken.balanceOf(users[1].address))

    await expect(balance).to.be.equal(amountDAItoDeposit);
  });
  /*
  it('Withdral ', async () => {
    const { users, pool, dai, aDai, configurator, allReserves, helpersContract } = testEnv;

    await pool.connect(users[0].signer).withdraw(allReserves[1], dai.address, "0x3635c9adc5dea00000", users[0].address);

    // console.log(await aDai.getIncentivesController());
    const balance = await aDai.balanceOf(users[0].address);
    // console.log(balance);
    const daiBalance = await dai.balanceOf(users[0].address);
    
    await expect(daiBalance).to.be.equal("0x3635c9adc5dea00000");
    await expect(balance).to.be.equal("0x00");
  });

  it('Borrow ', async () => {
    const { users, pool, dai, stableDebToken, variableDebToken, configurator, allReserves } = testEnv;

    const amountDAItoDeposit = await convertToCurrencyDecimals(dai.address, '1000');

    await dai.connect(users[2].signer).mint(amountDAItoDeposit);

    // user 0 deposits 1000 DAI
    await dai.connect(users[2].signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

    // console.log(await helpersContract.getReserveData(allReserves[1]));
    // console.log(await helpersContract.getReserveConfigurationData(allReserves[1]));

    await pool.connect(users[2].signer).deposit(allReserves[1], dai.address, "0x3635c9adc5dea00000", users[2].address);

    await configurator.updateProjectBorrower(allReserves[1], users[3].address);

    await configurator.enableBorrowingOnReserve(allReserves[1], true);

    await pool.connect(users[3].signer).borrow(allReserves[1], dai.address, "0x3635c9adc5dea00000", users[3].address);

    // console.log(await aDai.getIncentivesController());
    const balance = await dai.balanceOf(users[3].address);
        
    await expect(balance).to.be.equal("0x3635c9adc5dea00000");

    await configurator.disableBorrowingOnReserve(allReserves[1]);

    const stableDebtBalance = await stableDebToken.connect(users[3].signer).balanceOf(users[3].address);
    const variableDebtBalance = await variableDebToken.connect(users[3].signer).balanceOf(users[3].address);
    
    // await expect(stableDebtBalance).to.be.equal("0x3635c9adc5dea00000");
    await expect(variableDebtBalance).to.be.equal("0x00");
  });

  it('Repay ', async () => {
    const { users, pool, dai, stableDebToken, variableDebToken, aDai, configurator, allReserves, helpersContract } = testEnv;

    // user 0 deposits 1000 DAI
    await dai.connect(users[3].signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

    const amountDAItoRepay = await convertToCurrencyDecimals(dai.address, '500');
    await pool.connect(users[3].signer).repay(allReserves[1], dai.address, amountDAItoRepay, users[3].address);

    // console.log(await aDai.getIncentivesController());
    let balance = await dai.balanceOf(users[3].address);
        
    await expect(balance).to.be.equal(amountDAItoRepay);
    
    let stableDebtBalance = await stableDebToken.connect(users[3].signer).balanceOf(users[3].address);
    let variableDebtBalance = await variableDebToken.connect(users[3].signer).balanceOf(users[3].address);
    
    // await expect(stableDebtBalance).to.be.equal(amountDAItoRepay);
    await expect(variableDebtBalance).to.be.equal("0x00");
    
    await pool.connect(users[3].signer).repay(allReserves[1], dai.address, amountDAItoRepay, users[3].address);

    // console.log(await aDai.getIncentivesController());
    balance = await dai.balanceOf(users[3].address);
        
    await expect(balance).to.be.equal("0x00");

    stableDebtBalance = await stableDebToken.connect(users[3].signer).balanceOf(users[3].address);
    variableDebtBalance = await variableDebToken.connect(users[3].signer).balanceOf(users[3].address);

    // await expect(stableDebtBalance).to.be.equal("0x00");
    await expect(variableDebtBalance).to.be.equal("0x00");

  });  

  it('Check a token balance after rates updated ', async () => {
    const { users, pool, dai, stableDebToken, variableDebToken, aDai, pToken, configurator, allReserves, helpersContract } = testEnv;
    
    function timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const amountDAItoDeposit = await convertToCurrencyDecimals(dai.address, '1000');

    await dai.connect(users[5].signer).mint(amountDAItoDeposit);

    // user 0 deposits 1000 DAI
    await dai.connect(users[5].signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

    // console.log(await helpersContract.getReserveData(allReserves[1]));
    // console.log(await helpersContract.getReserveConfigurationData(allReserves[1]));

    await pool.connect(users[5].signer).deposit(allReserves[1], dai.address, "0x3635c9adc5dea00000", users[5].address);
    
    const balance = await aDai.balanceOf(users[5].address);
    console.log(balance);
    
    const balanceP = await pToken.balanceOf(users[5].address);
    console.log(balanceP);

  });
  */
  /*
  it('User 1 deposits 1000 dai and project borrower borrow 1000 dai', async () => {
    const { users, pool, dai, aDai, configurator, allReserves } = testEnv;

    const amountDAItoDeposit = await convertToCurrencyDecimals(dai.address, '1000');

    await dai.connect(users[0].signer).mint(amountDAItoDeposit);

    // enable borrowing
    await configurator.enableBorrowingOnReserve(allReserves[1], true);
    // update project borrower
    await configurator.updateProjectBorrower(allReserves[1], users[1].address);

    // user 0 deposits 1000 DAI
    await dai.connect(users[0].signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);
    
    await pool.connect(users[0].signer).deposit(allReserves[1], dai.address, "0x3635c9adc5dea00000", users[0].address);
    await pool.connect(users[1].signer).borrow(allReserves[1], dai.address, "0x3635c9adc5dea00000", users[1].address);

    const balance = await dai.balanceOf(users[1].address);

    await expect(balance).to.be.equal("0x3635c9adc5dea00000");
  });

  it('User try to borrow 1000 dai', async () => {
    const { users, pool, dai, allReserves, configurator } = testEnv;

    const amountDAItoDeposit = await convertToCurrencyDecimals(dai.address, '1000');

    await dai.connect(users[0].signer).mint(amountDAItoDeposit);

    // enable borrowing
    await configurator.enableBorrowingOnReserve(allReserves[1], true);
    // update project borrower
    await configurator.updateProjectBorrower(allReserves[1], users[1].address);


    // user 0 deposits 1000 DAI
    await dai.connect(users[0].signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

    await pool.connect(users[0].signer).deposit(allReserves[1], dai.address, "0x3635c9adc5dea00000", users[0].address);

    await expect(
      pool.connect(users[0].signer).borrow(allReserves[1], dai.address, "0x3635c9adc5dea00000", users[0].address),
      "Only project borrower"
    ).to.be.revertedWith("Only project borrower");
  });

  it('User try to Withdraw dai ', async () => {
    const { users, pool, dai, allReserves, configurator, helpersContract } = testEnv;

    const amountDAItoDeposit = await convertToCurrencyDecimals(dai.address, '1000');

    await dai.connect(users[0].signer).mint(amountDAItoDeposit);

    // user 0 deposits 1000 DAI
    await dai.connect(users[0].signer).approve(allReserves[1], APPROVAL_AMOUNT_LENDING_POOL);
    await pool
      .connect(users[0].signer)
      .deposit(allReserves[1], dai.address, amountDAItoDeposit, users[0].address);

    // enable borrowing
    await configurator.enableBorrowingOnReserve(allReserves[1], true);
    // Configurator set project borrower
    await configurator.updateProjectBorrower(allReserves[1], users[2].address);

    await pool.connect(users[2].signer).borrow(allReserves[1], dai.address, "0x3635c9adc5dea00000", users[2].address);

    const {
      availableLiquidity
    } = await helpersContract.getReserveData(allReserves[1],);

    await expect(
      pool.connect(users[0].signer).withdraw(allReserves[1], dai.address, amountDAItoDeposit, users[0].address)
    ).to.be.revertedWith(VL_NOT_ENOUGH_AVAILABLE_USER_BALANCE);
  });
  */
});