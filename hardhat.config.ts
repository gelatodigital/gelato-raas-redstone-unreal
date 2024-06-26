import { HardhatUserConfig } from "hardhat/config";

// PLUGINS
import "@gelatonetwork/web3-functions-sdk/hardhat-plugin";
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomiclabs/hardhat-ethers";
import "@typechain/hardhat";
import "hardhat-deploy";
import "@nomiclabs/hardhat-etherscan";


// Process Env Variables
import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "/.env" });

const PK = process.env.PK;
const ALCHEMY_ID = process.env.ALCHEMY_ID;
// const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

// HardhatUserConfig bug
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const config: HardhatUserConfig = {
  // web3 functions
  w3f: {
    rootDir: "./web3-functions",
    debug: false,
    networks: ["hardhat","unreal"], //(multiChainProvider) injects provider for these networks
  },
  // hardhat-deploy
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  defaultNetwork: "unreal",

  networks: {
    hardhat: {
      forking: {
        url:  `https://rpc.unreal-orbit.gelato.digital`,
      },
    },

    ethereum: {
      accounts: PK ? [PK] : [],
      chainId: 1,
      url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_ID}`,
    },
    mumbai: {
      accounts: PK ? [PK] : [],
      chainId: 80001,
      url: `https://polygon-mumbai.g.alchemy.com/v2/_HsuvYjrWX8zIZS6oAXPWU8OR1IyNYy-`,
    },
    polygon: {
      accounts: PK ? [PK] : [],
      chainId: 137,
      url: "https://polygon-rpc.com",
    },
    unreal: {
      accounts: PK ? [PK] : [],
      chainId: 18233,
      url: `https://rpc.unreal-orbit.gelato.digital`,
    },
 
  },

  solidity: {
    compilers: [
      {
        version: "0.8.23",
        settings: {
          optimizer: { enabled: true, runs: 999999 },
          // Some networks don't support opcode PUSH0, we need to override evmVersion
          // See https://stackoverflow.com/questions/76328677/remix-returned-error-jsonrpc2-0-errorinvalid-opcode-push0-id24
          evmVersion: "paris",
        },
      },
    ],
  },

  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },

  // hardhat-deploy
  etherscan: {
    apiKey: {
      unreal: 'your API key',

    },
    customChains: [
      {
        network: "unreal",
        chainId: 18233,
        urls: {
          apiURL: "https://unreal.blockscout.com/api",
          browserURL: "https://unreal.blockscout.com"
        }
      }
    ]
  },
};

export default config;
