import {
  Web3Function,
  Web3FunctionContext,
} from "@gelatonetwork/web3-functions-sdk";
import { BigNumber, Contract, ethers } from "ethers";

import * as sdk from "@redstone-finance/sdk";
import { WrapperBuilder } from "@redstone-finance/evm-connector";
const parsePrice = (value: Uint8Array) => {
  const bigNumberPrice = ethers.BigNumber.from(value);
  return bigNumberPrice.toNumber() / 10 ** 8; // Redstone uses 8 decimals
};

Web3Function.onRun(async (context: Web3FunctionContext) => {
  const { userArgs, multiChainProvider, secrets, storage } = context;

  const provider = multiChainProvider.default()



  let abi = [
    "function updateDataFeedsValues(uint256) external",
    "function getDataServiceId() public pure  override returns (string memory)",
    "function getUniqueSignersThreshold() public pure returns (uint8)",
    "function latestRoundData() external view returns (uint80,int256,uint256,int256,uint80)",
    "function decimals() external view returns (uint8)",
  ];

  const priceFeedAdapterAddress = userArgs.priceFeedAdapterAddress as string;
  const intervalInMin = +(userArgs.intervalInMin as string ?? "60");
  const deviationThreshold = +(userArgs.deviationThreshold as string ?? "2");
  console.log(deviationThreshold)
  const priceFeed = userArgs.priceFeed as string;
  if (priceFeed == undefined){
    return { canExec:false, message:"No price feed arg"}
  }

  const priceFeedAdapter = new Contract(priceFeedAdapterAddress, abi, provider);


  const currentTimestamp = (await provider.getBlock('latest')).timestamp



  const getLatestSignedPrice = await sdk.requestDataPackages({
    dataServiceId: "redstone-primary-prod",
    uniqueSignersCount: 3,
    dataFeeds: [priceFeed],
    urls: ["https://oracle-gateway-1.a.redstone.finance"],
  });

  // Wrap contract with redstone data service
  const wrappedOracle =
    WrapperBuilder.wrap(priceFeedAdapter).usingDataService(
      getLatestSignedPrice
    );

  // Retrieve stored & live prices 

  const decimals = await wrappedOracle.decimals();
  let lastTimeStamp = 0;
  let storedPrice = 0;
  try {
    let latestRoundData = await wrappedOracle.latestRoundData()
    storedPrice = latestRoundData[1];
    lastTimeStamp = latestRoundData[2];
  } catch (error) {
    console.log("Initial Price");
  }

  const { dataPackage } = getLatestSignedPrice[priceFeed]![0];


  const parsedPrice = parsePrice(dataPackage.dataPoints[0].value);
  let livePrice = parsedPrice * 10 ** decimals;

 
  console.log(`Live price: ${livePrice.toString()}`);
  console.log(`Stored price: ${storedPrice.toString()}`);
  // // Check price deviation
  const deviation: number = Math.abs(storedPrice - livePrice);
  const deviationPrct = ((deviation / 10 ** decimals) / storedPrice )* 100;
  console.log(`Deviation: ${deviationPrct.toFixed(2)}%, threshold: ${deviationThreshold.toFixed(2)}%`);

  // Only update price if deviation is above the theshols
  if (deviationPrct < deviationThreshold && currentTimestamp - lastTimeStamp < intervalInMin*60) {
    return {
      canExec: false,
      message: `No update: price deviation too small / time not elapsed`,
    };
  }

  // Craft transaction to update the price on-chain
  console.log(`Setting ${priceFeed} price in PriceFeed contract to: ${parsedPrice}`);
  const { data } =
    await wrappedOracle.populateTransaction.updateDataFeedsValues(
      dataPackage.timestampMilliseconds
    );
  return {
    canExec: true,
    callData: [{ to: priceFeedAdapterAddress, data: data as string }],
  };
});
