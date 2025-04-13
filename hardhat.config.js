require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.0",
  networks: {
    hardhat: {
      chainId: 1337,  // Local Hardhat network
      // Ensuring no ENS resolution by setting `provider` configuration for local network
      allowUnlimitedContractSize: true,  // Optional: Allows contracts with larger size (if needed)
    },
  },
  paths: {
    sources: "./contracts",   // Default folder for contracts
    tests: "./test",           // Default folder for tests
    cache: "./cache",          // Default folder for cache
    artifacts: "./artifacts",  // Default folder for compiled contract artifacts
  },
};
