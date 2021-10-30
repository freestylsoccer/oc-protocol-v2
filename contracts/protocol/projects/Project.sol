// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.6.12;

import {Ownable} from '../../dependencies/openzeppelin/contracts/Ownable.sol';
import {ILendingPoolAddressesProvider} from '../../interfaces/ILendingPoolAddressesProvider.sol';
import {IProject} from '../../interfaces/IProject.sol';
import {Errors} from '../libraries/helpers/Errors.sol';
import {LendingPoolStorage} from '../lendingpool/LendingPoolStorage.sol';

/**
 * @title LendingPool contract
 * @dev Used when need to create more than one reserve by asset
 * - Admin can:
 *   # Update Liquedity Rate
 *   # Update Project Name
 *   # Update Project start date
 *   # Update Project end date
 *   # Update Project Status
 * @author Basilio Calixto
 **/
contract Project is Ownable, IProject, LendingPoolStorage {

  string public name;
  uint40 public startDate;
  uint40 public endDate;
  uint128 public liquidityRate;
  bool public _finished;

  constructor(
      string memory _name,
      uint40 _startDate,
      uint40 _endDate,
      uint128 _liquidityRate,
      ILendingPoolAddressesProvider provider
  ) public {
      name = _name;
      startDate = _startDate;
      endDate = _endDate;
      liquidityRate = _liquidityRate;
      _finished = false;
      _addressesProvider = provider;
  }

  modifier whenNotFinished() {
    _whenNotFinished();
    _;
  }

  function _whenNotFinished() internal view {
    require(!_finished, "The project has been finished.");
  }

  /**
  * @dev update project Status
  **/
  function setFinished(bool val) external override onlyOwner {
      _finished = val;
  }

  /**
  * @dev update project start date
  **/
  function setStarDate(uint40 _startDate) external override onlyOwner whenNotFinished {
      startDate = _startDate;
  }

  /**
  * @dev update project end date
  **/
  function setEndDate(uint40 _endDate) external override onlyOwner whenNotFinished {
      endDate = _endDate;
  }

  /**
  * @dev update Liquidity Rate
  **/
  function setLiquidityRate(uint128 val) external override onlyOwner whenNotFinished {
      liquidityRate = val;
  }

  /**
  * @dev update Liquidity Rate
  * @dev to reuse smart contract
  **/
  function setName(string memory _name) external override onlyOwner whenNotFinished{
      name = _name;
  }

}
