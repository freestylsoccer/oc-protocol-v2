// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.6.12;

import {ILendingPoolAddressesProvider} from './ILendingPoolAddressesProvider.sol';
import {DataTypes} from '../protocol/libraries/types/DataTypes.sol';

interface IProject {

  function setFinished(bool val) external;
  function setStarDate(uint40 _startDate) external;
  function setEndDate(uint40 _endDate) external;
  function setLiquidityRate(uint128 val) external;
  function setName(string memory _name) external;
}
