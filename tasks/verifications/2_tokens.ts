import { task } from 'hardhat/config';
import { loadPoolConfig, ConfigNames, getTreasuryAddress } from '../../helpers/configuration';
import { ZERO_ADDRESS } from '../../helpers/constants';
import {
  getAddressById,
  getAToken,
  getFirstSigner,
  getInterestRateStrategy,
  getLendingPoolAddressesProvider,
  getProxy,
  getStableDebtToken,
  getVariableDebtToken,
} from '../../helpers/contracts-getters';
import { getParamPerNetwork, verifyContract } from '../../helpers/contracts-helpers';
import { eContractid, eNetwork, ICommonConfiguration, IReserveParams } from '../../helpers/types';
import { LendingPoolConfiguratorFactory, LendingPoolFactory } from '../../types';

task('verify:tokens', 'Deploy oracles for dev enviroment')
  .addParam('pool', `Pool name to retrieve configuration, supported: ${Object.values(ConfigNames)}`)
  .setAction(async ({ verify, all, pool }, localDRE) => {
    await localDRE.run('set-DRE');
    const network = localDRE.network.name as eNetwork;
    const poolConfig = loadPoolConfig(pool);
    const { ReserveAssets, ReservesConfig } = poolConfig as ICommonConfiguration;
    const treasuryAddress = await getTreasuryAddress(poolConfig);

    const addressesProvider = await getLendingPoolAddressesProvider();
    const lendingPoolProxy = LendingPoolFactory.connect(
      await addressesProvider.getLendingPool(),
      await getFirstSigner()
    );

    const lendingPoolConfigurator = LendingPoolConfiguratorFactory.connect(
      await addressesProvider.getLendingPoolConfigurator(),
      await getFirstSigner()
    );

    const configs = Object.entries(ReservesConfig) as [string, IReserveParams][];
    // console.log(ReserveAssets);
    // console.log(configs);
    const otherReserveAssets =
    {
      DAI: "0x0e48B61B4517cC38b5fa05aBd9eD281A4bC2321F",
      TUSD: "0x5f18e1c347890B8F145f616BCCa111056B19CF1d",
      USDC: "0x0967D766AE11cFF946eC87567269374Ecd1541b7",
      USDT: "0x93a5E88d04aa5907e41b355341D929136A4344C3",
      SUSD: "0x21576343173a013acA62A86C95BA65D3dFe7C7A8",
      BUSD: "0xFe849353932cF14c68A3485a69854da8bb8c7b01",
    }
    await verifyContract(
      eContractid.InitializableAdminUpgradeabilityProxy,
      await getAToken("0xFE22e9257596b781DDC1B0b9b211FA53Cc071caa"),
      []
    );
    
    for (const entry of Object.entries(otherReserveAssets)) {
      const [token, tokenAddress] = entry;
      console.log(`- Verifying ${token} token related contracts`);
      const {
        stableDebtTokenAddress,
        variableDebtTokenAddress,
        aTokenAddress,
        interestRateStrategyAddress,
      } = await lendingPoolProxy.getReserveData(tokenAddress);

      const tokenConfig = configs.find(([symbol]) => symbol === token);
      if (!tokenConfig) {
        throw `ReservesConfig not found for ${token} token`;
      }
/*
      const {
        optimalUtilizationRate,
        baseVariableBorrowRate,
        variableRateSlope1,
        variableRateSlope2,
        stableRateSlope1,
        stableRateSlope2,
      } = tokenConfig[1].strategy;

      console.log;
      // Proxy Stable Debt
      console.log(`\n- Verifying Stable Debt Token proxy...\n`);
      await verifyContract(
        eContractid.InitializableAdminUpgradeabilityProxy,
        await getProxy(stableDebtTokenAddress),
        [lendingPoolConfigurator.address]
      );

      // Proxy Variable Debt
      console.log(`\n- Verifying  Debt Token proxy...\n`);
      await verifyContract(
        eContractid.InitializableAdminUpgradeabilityProxy,
        await getProxy(variableDebtTokenAddress),
        [lendingPoolConfigurator.address]
      );

      // Proxy aToken
      console.log('\n- Verifying aToken proxy...\n');
      await verifyContract(
        eContractid.InitializableAdminUpgradeabilityProxy,
        await getProxy(aTokenAddress),
        [lendingPoolConfigurator.address]
      );

      // Strategy Rate
      console.log(`\n- Verifying Strategy rate...\n`);
      await verifyContract(
        eContractid.DefaultReserveInterestRateStrategy,
        await getInterestRateStrategy(interestRateStrategyAddress),
        [
          addressesProvider.address,
          optimalUtilizationRate,
          baseVariableBorrowRate,
          variableRateSlope1,
          variableRateSlope2,
          stableRateSlope1,
          stableRateSlope2,
        ]
      );
      */
      const stableDebt = await getAddressById(`stableDebt${token}`);
      const variableDebt = await getAddressById(`variableDebt${token}`);
      const aToken = await getAddressById(`a${token}`);
      console.log(aToken)
      if (aToken) {
        console.log('\n- Verifying aToken...\n');
        await verifyContract(eContractid.AToken, await getAToken(aToken), [
          lendingPoolProxy.address,
          tokenAddress,
          treasuryAddress,
          `Aave interest bearing ${token}`,
          `a${token}`,
          ZERO_ADDRESS,
        ]);
      } else {
        console.error(`Skipping aToken verify for ${token}. Missing address at JSON DB.`);
      }
      /*
      if (stableDebt) {
        console.log('\n- Verifying StableDebtToken...\n');
        await verifyContract(eContractid.StableDebtToken, await getStableDebtToken(stableDebt), [
          lendingPoolProxy.address,
          tokenAddress,
          `Aave stable debt bearing ${token}`,
          `stableDebt${token}`,
          ZERO_ADDRESS,
        ]);
      } else {
        console.error(`Skipping stable debt verify for ${token}. Missing address at JSON DB.`);
      }
      if (variableDebt) {
        console.log('\n- Verifying VariableDebtToken...\n');
        await verifyContract(
          eContractid.VariableDebtToken,
          await getVariableDebtToken(variableDebt),
          [
            lendingPoolProxy.address,
            tokenAddress,
            `Aave variable debt bearing ${token}`,
            `variableDebt${token}`,
            ZERO_ADDRESS,
          ]
        );
      } else {
        console.error(`Skipping variable debt verify for ${token}. Missing address at JSON DB.`);
      }*/
    }
  });
