
>**_REQUIREMENT:_**
```
Write a README.md file which describes the project, describes the directory structure, and where the frontend project can be accessed (see #8). Please also include your public Ethereum account if you would like to receive your certification as an NFT (this is optional). 

In your README.md, be sure to have clear instructions on: 
Installing dependencies for your project 
Accessing or—if your project needs a server (not required)—running your project
Running your smart contract unit tests and which port a local testnet should be running on.
Note: This section used to require three bash scripts but has been revised.
```
# Decrypt - Your Smart CryptoCurrency Bank
## About
This DApp provides ETH and ERC20 tokens deposit and withdrawal services to users. User's deposit will earn an interest from other established protocols such as Compound. Users should be aware that ERC20 tokens which are deposited will be converted into ETH and earn interest. Users can choose to withdraw the balances as ETH or any other ERC20 tokens. 

The DApp interacts with established protocols such as Compound and Uniswap for token swaps and earning interest. It also uses Openzeppelin contracts and libraries such as [ERC20](https://github.com/OpenZeppelin/openzeppelin-contracts/tree/master/contracts/token/ERC20), [ReentrancyGuard](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/security/ReentrancyGuard.sol) and [Address](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Address.sol).

The contract is deployed and verified on Rinkeby testnet at [0x77DA566B983157E05283AC936362A72BdF42E4a4](https://rinkeby.etherscan.io/address/0x77DA566B983157E05283AC936362A72BdF42E4a4)
## Dependencies
To run the DApp in a local environment, the following dependencies are required:
* Node
  * download Node: https://nodejs.org/en/download/
* Truffle
  * Truffle: ``npm i -g truffle``
  * HDWallet provider:  ``npm i -g @truffle/hdwallet-provider``
  * Contract verification: ``npm i -g truffle-plugin-verify``
* Openzeppelin contracts and libraries: ``npm i -g @openzeppelin/contracts``
* React
  * React: ``npm i -g react``
  * React-bootstrap: ``npm i -g react--bootstrap``
  * Bootstrap: ``npm i -g bootstrap``
* Web3
  * web3js: ``npm i -g web3``
  * ethers: ``npm i -g ethers``
  * Metamask: ``npm i -g @metamask/detect-provider``
  * Install metamask wallet in your browser
* Utils
  * .env file: ``npm i -g dotenv``

## How to Interact with the DApp
* Interact through Web Interface
  * Download this folder 
  * Run ``npm install`` to install all the dependencies in the package.json file
  * Launch the user interface via port: 3000 by running
  ``npm run start``
  in the SmartBank root directory
  * Install Metamask in your browser. Connect your Metamask wallet and start interacting with the app
  
* Interact via Etherscan
  * You may also choose to interact with the SmartBank contract via [Etherscan Rinkeby.](https://rinkeby.etherscan.io/address/0x77DA566B983157E05283AC936362A72BdF42E4a4)

## Directory Structure
Key documents and folder structures are as below:
```
SmartBank (root)
+-- migrations
|   +-- 1_initial_migration.js
|   +-- 2_deploy_contracts.js 
|
+-- public
|
+-- src
|   +-- abis
|   +-- Component
|   |   +-- Header.js
|   |   +-- MetamaskConnectButton.js
|   |
|   +-- contracts
|   |   +-- Migrations.sol
|   |   +-- SmartBank.sol    
|   |
|   +-- App.js
|   +-- App.css
|   +-- index.css
|   +-- index.js
|
+-- test
|   +-- SmartBank.test.js    
|
+-- truffle-config.js
+-- package.json
+-- .env.example
+-- avoiding_common_attacks.md
+-- design_pattern_decisions.md
+-- deployed_address.txt
```

### Contracts
* SmartBank contract is compiled using Solidity compiler 0.8.0 and consists of the following key functions:
  * addBalance 
    * Purpose: for users to deposit ETH to the contract which will earn interest from Compound
    * Input: deposit amount (msg.value)
    * Output: emit depositETH event
  * addBalanceERC20
    * Purpose: for users to deposit ERC20 token which will then be converted to ETH and earn interest from Compound
    * Input: ERC20 token address, deposit amount
    * Output: return true on successful execution
  * getBalanceInWei
    * Purpose: read-only function to view a user's balance in ETH terms
    * Input: user address
    * Output: total balance including interest in ETH terms
  * withdraw
    * Purpose: for users to withdraw balance from the contract in ETH; "nonReentrant" is applied to prevent reentrancy
    * Input: withdraw amount
    * Output: return true on successful execution
  * withdrawInERC20
    * Purpose: for users to withdraw balance from the contract in an ERC20 token; "non-Reentrant" is applied to prevent reentrancy
    * Input: withdraw amount in ETH terms, ERC20 token address
    * Output: return true on successful execution
* You can deploy the SmartBank contract to Rinkeby network by running the following command. Make sure you have sufficient ETH balance to pay for the gas fee.
```
truffle migration --reset --network rinkeby
```
* The deployment of the contract will require the following dependencies:
  * Constructor inputs are specified in ``migrations/2_deploy_contracts.js``. More details in Migration section below.
  * Network configuration is specified in ``truffle-config.js``. More details in Truffle Configuration below.
  * HDWallet provider - install via ``npm i -g @truffle/hdwallet-provider``
### Migration
* Within Migrations folder, ``2_deploy_contracts.js`` file retrieve the contract artifacts (abi) and deploy the contract together with the addresses of the following, as required input in the constructor:
  * Uniswap
  * CEther
  * WETH
* The address inputs vary depending on the network of which the contract will be deployed (mainnet, rinkeby or development)
### Smart Contract Unit Tests
* Before running the tests, you need to fork the mainnet and initialize the accounts, as below.
```
ganache-cli --fork https://mainnet.infura.io/v3/YOUR_API_KEY --unlock 'ACCOUNT_ADDRESS_1' 'ACCOUNT_ADDRESS_2' --networkId 999

```
*  Once you have done the above, you can run the ``SmartBank.test.js`` tests on mainnet fork in another terminal via the command below
```
truffle test --network mainnet_fork

```
* ``SmartBank.test.js`` file conducts 7 tests on mainnet-fork network, as below:
  * to verify that the contract exists, ie. should have a valid address
  * to verify that the contract should accept deposit and the amount is correct  
  * to verify that the deposit can earn interest from Compound 
  * to verify that an event is emitted when a deposit is made
  * to verify that the withdraw function reverts when one attempts to withdraw more than available balance
  * to verify that there is correct amount remaining after a withdrawal is made
  * to verify that the contract should accept an ERC20 token deposit
* ``exceptionsHelpers.js`` file provides the required functions for handling exceptions produced during the tests
### User Interface
* User interface is built using React library with the necessary Hooks.
* Key files relating to user interface include:
  * In ``src`` directory:
    * ``App.js``
    * ``App.css``
    * ``index.css``
    * ``index.css``
  * In ``src/Component`` directory:
    * ``Header.js``
    * ``MetamaskConnectButton.js``
  * In ``public`` directory:
    * ``index.html`` 
* Run the command below in the root directory (SmartBank) to initiate the user interface (UI).
```
npm run start
```
Once run the command above, the UI will be deployed to Port:3000 which can be accessed via ``http://localhost:3000``
### Truffle Configuration
* Truffle config file contains the network configuration for the following networks:
  * development
  * Rinkeby testnet
  * Mainnet
  * Mainnet_fork
* HDwallet provider is required to connect to the Rinkeby testnet or Mainnet - install via ``npm i -g @truffle/hdwallet-provider``
* Seed phrase and network provider (Infura or Alchemy) details are stored locally in a ``.env`` file. An example of such file is available - ``.env.example``
## Deployed Address and Verification
The contract is deployed and verified on Rinkeby testnet at [0x77DA566B983157E05283AC936362A72BdF42E4a4](https://rinkeby.etherscan.io/address/0x77DA566B983157E05283AC936362A72BdF42E4a4)

