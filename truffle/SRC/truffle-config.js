
module.exports = {

  networks: {

    //Use Ganache-Cli for unit testing
    development: {
      host: "127.0.0.1",
      port: 8282,
      network_id: "*"
    },

    //Use live network for deployment testing and live deployment
    live: {
      host: "127.0.0.1",     // Localhost
      port: 8545,            // Standard Ethereum port
      network_id: "9999",
      from: "0x61A1D66DA840f1982dff9Aba9407a0B708A9d6FE" //Main Address
     },

    // Useful for private networks
    // private: {
      // provider: () => new HDWalletProvider(mnemonic, `https://network.io`),
      // network_id: 2111,   // This network is yours, in the cloud.
      // production: true    // Treats this network as if it was a public net. (default: false)
    // }
  },

  // Configure your compilers
  //compilers: {
    //solc: {
      // version: "0.5.3"    // Fetch exact version from solc-bin (default: truffle's version)
      // settings: {          // See the solidity docs for advice about optimization and evmVersion
      //  optimizer: {
      //    enabled: false,
      //    runs: 200
      //  },
      //  evmVersion: "byzantium"
      // }
    //}
  //}
}
