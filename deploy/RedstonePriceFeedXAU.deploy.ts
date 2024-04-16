import { deployments, getNamedAccounts } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  if (hre.network.name !== "hardhat") {
    console.log(
      `Deploying PriceFeedOracle XAU to ${hre.network.name}. Hit ctrl + c to abort`
    );
  }

  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const adapterXAU= await deploy("MergedAdapterWithoutRoundsXauV1", {
    from: deployer,
    log: hre.network.name !== "hardhat",
    proxy: {
      proxyContract: "EIP173Proxy",
    },
  });
  console.log(
    `Deployed Price Feed XAU to ${adapterXAU.address}`
  );


};

export default func;

func.tags = ["XAU"];

