import { task } from 'hardhat/config';
import {
  deployUiPoolDataProvider,
  deployUiPoolDataProviderV2V3,
  deployAaveProtocolDataProvider
} from '../../helpers/contracts-deployments';
import {
  getLendingPoolAddressesProvider
} from '../../helpers/contracts-getters';

task('dev:ui-pool-data-provider', 'Deploy UIPoolDataProvider.')
  .addFlag('verify', 'Verify contracts at Etherscan')
  .setAction(async ({ verify }, localBRE) => {
    await localBRE.run('set-DRE');

    console.log(`\n- UiPoolDataProvider deployment`);
    await deployAaveProtocolDataProvider("0x5B7cccC41942C180d5506bd350E8dd6EF79a390E", true);
    console.log('protocoldataprovider...');
    const uiPoolDataProvider = await deployUiPoolDataProviderV2V3(verify);

    console.log('UiPoolDataProvider deployed at:', uiPoolDataProvider.address);
    console.log(`\tFinished UiPoolDataProvider deployment`);
  });
