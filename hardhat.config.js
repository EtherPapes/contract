require('@nomiclabs/hardhat-etherscan')
require('@nomiclabs/hardhat-waffle')
require('hardhat-gas-reporter')
require('dotenv').config()

// Import tasks
const CHECK_ADDRESS = `0x32336A625aacFA08fe9723d901FFf92A7E3465c1`
const HARDHAT_NETWORK_CONFIG = {
  chainId: 1337,
  libraries: {
    CheckAddress: CHECK_ADDRESS,
  },
  forking: {
    url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
    blockNumber: 13050000,
  },
}

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.0",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  networks: {
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [`0x${process.env.OWNER_PRIVATE_KEY}`],
      libraries: {
        CheckAddress: CHECK_ADDRESS,
      },
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [`0x${process.env.OWNER_PRIVATE_KEY}`],
      libraries: {
        CheckAddress: `0x87f11cba2Db0cB22b9679c14860bA5Be49Fd0717`,
      },
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [`0x${process.env.OWNER_PRIVATE_KEY}`],
      libraries: {
        CheckAddress: `0x029374cA831F9F4B04a0D896B8d00CcE05f30D8f`,
      },
    },
    localhost: HARDHAT_NETWORK_CONFIG,
    hardhat: HARDHAT_NETWORK_CONFIG,
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  mocha: {
    timeout: 200000,
  },
  gasReporter: {
    currency: 'USD',
    gasPrice: 45,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    excludeContracts: [
      'CheckAddress',
    ],
  },
};
