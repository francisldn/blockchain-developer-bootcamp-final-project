const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();

module.exports = {

  networks: {
    development: {
    host: "127.0.0.1",     // Localhost (default: none)
    port: 8545,            // Standard Ethereum port (default: none)
    network_id: "*",       // Any network (default: none)
    },

    rinkeby: {
      timeoutBlocks: 200000,
      networkCheckTimeout: 10000, 
      provider: () => new HDWalletProvider(process.env.SEED_PHRASE, process.env.ALCHEMY_RINKEBY_URL),
      network_id: 4,
      skipDryRun: true
    },
    mainnet_fork: {
      host:"127.0.0.1",
      port:8545,
      network_id: "999"
    },
    mainnet: {
      timeoutBlocks: 200000,
      networkCheckTimeout: 10000, 
      provider: () => new HDWalletProvider(process.env.SEED_PHRASE, process.env.MAINNET_RPC_URL),
      network_id: 1,
      skipDryRun: true
    }
  },

  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis',
  migrations_directory: './migrations',

  compilers: {
    solc: {
     version:'0.8.0',
     optimizer:{
       enabled:'true',
       runs: 200
     }
    }
  },

  mocha: {
    useColors: true
  }  

}
