// Using Alchemy RPC
require("dotenv").config();
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");

const ALCHEMY_API = process.env.ALCHEMY_API || "";
const ACCOUNT = process.env.ACCOUNT || "";

module.exports = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: ALCHEMY_API,
      accounts: [ACCOUNT],
    },
  },
};
