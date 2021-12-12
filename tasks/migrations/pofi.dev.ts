import { task } from 'hardhat/config';
import { checkVerification } from '../../helpers/etherscan-verification';
import { ConfigNames } from '../../helpers/configuration';
import { printContracts } from '../../helpers/misc-utils';

task('pofi:dev', 'Deploy development enviroment')
  .addFlag('verify', 'Verify contracts at Etherscan')
  .setAction(async ({ verify }, localBRE) => {
    const POOL_NAME = ConfigNames.Pofi;

    await localBRE.run('set-DRE');

    // Prevent loss of gas verifying all the needed ENVs for Etherscan verification
    if (verify) {
      checkVerification();
    }

    console.log('Migration started\n');
    /*
    console.log('1. Deploy mock tokens');
    await localBRE.run('dev:deploy-mock-tokens', { verify });

    console.log('2. Deploy mock projects');
    await localBRE.run('dev:deploy-mock-projects', { verify });

    console.log('3. Deploy address provider');
    await localBRE.run('dev:deploy-address-provider', { verify });

    console.log('4. Deploy lending pool');
    await localBRE.run('dev:deploy-lending-pool', { verify, pool: POOL_NAME });
    */

    console.log('5. Initialize lending pool');
    await localBRE.run('dev:initialize-lending-pool', { verify, pool: POOL_NAME });

    if (true) {
      printContracts();
      // console.log('7. Veryfing contracts');
      // await localBRE.run('verify:general', { all: true, pool: POOL_NAME });

      console.log('8. Veryfing aTokens and debtTokens');
      await localBRE.run('verify:tokens', { pool: POOL_NAME });
    }

    console.log('\nFinished migration');
    printContracts();
  });
