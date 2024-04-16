import { task } from "hardhat/config";

export const verify = task("etherscan-verify", "verify").setAction(
  async ({}, hre) => {
    await hre.run("verify:verify", {
      address: "0xFFb3418dfeD0cD1E7A9524Bb9eE157653703028e",
      constructorArguments: [],
    });
  }
);
