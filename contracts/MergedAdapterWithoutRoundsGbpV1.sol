// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.4;

import {MergedPriceFeedAdapterWithoutRoundsPrimaryProd} from "@redstone-finance/on-chain-relayer/contracts/price-feeds/data-services/MergedPriceFeedAdapterWithoutRoundsPrimaryProd.sol";

contract MergedAdapterWithoutRoundsGbpV1 is
  MergedPriceFeedAdapterWithoutRoundsPrimaryProd
{
  address internal constant MAIN_UPDATER_ADDRESS =
    0xd47898C61fCd69AB8257a369416218Df6EcA5C7c;
  address internal constant MANUAL_UPDATER_ADDRESS =
    0x73EB8FB103CDfD2079f35Ae8bB4A80A53857BB6B;

  error UpdaterNotAuthorised(address signer);

  function getDataFeedId() public pure virtual override returns (bytes32) {
    return bytes32("GBP");
  }

  function requireAuthorisedUpdater(
    address updater
  ) public view virtual override {
    if (updater != MAIN_UPDATER_ADDRESS && updater != MANUAL_UPDATER_ADDRESS) {
      // We allow anyone to publish the new price if 40 seconds have passed since the latest update
      uint256 lastUpdateBlockTimestamp = getBlockTimestampFromLatestUpdate();
      if (getBlockTimestamp() - lastUpdateBlockTimestamp < 40 seconds) {
        revert UpdaterNotAuthorised(updater);
      }
    }
  }
}
