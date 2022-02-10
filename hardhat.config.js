//@type import('Hardhat/config').HardhatUserConfig

require("@nomiclabs/hardhat-waffle");
let secret = require("./secret")
//require('dotenv').config({path:+'/.env'})

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

//Go to Alchemyapi.io, signup and create a new app to get the key

//const ALCHEMY_API_KEY= "Your API KEY";

//replace this private key with Ropsten account private key
//To export your private key from Matamask, open metamsk and 
// go to Account Detail;s> Export Private Key
//Never put real ether into testing accounts

//const ROPSTEN_PRIVATE_KEY = "Your Ropsten KEY";

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  networks: {
    ropsten: {
      url: secret.ALCHEMY_ROPSTEN_API_KEY,
      accounts: [secret.ROPSTEN_PRIVATE_KEY]
    },
    rinkeby: {
      url: secret.ALCHEMY_RINKEBY_API_KEY,
      accounts: [secret.RINKEYBY_PRIVATE_KEY]
    }
  },
  paths: {
    artifacts: "./frontend/artifacts"
  }
};