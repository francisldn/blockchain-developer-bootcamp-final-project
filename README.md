
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

The contract is deployed and verified on the Rinkeby testnet at [0x0eaee27d1cdbaF249dAb7B1CcBdDeAFCB5Ae86eB](https://rinkeby.etherscan.io/address/0x0eaee27d1cdbaF249dAb7B1CcBdDeAFCB5Ae86eB)
## Dependencies
To run the DApp in a local environment, the following dependencies are required:
* Node v14.15.0
  * download Node: https://nodejs.org/en/download/
* Truffle v5.4.17
  * Truffle: ``npm i -g truffle``
  * HDWallet provider:  ``npm i @truffle/hdwallet-provider``
  * Contract verification: ``npm i truffle-plugin-verify``
  * Ganache-cli: ``npm i ganache-cli``
* Openzeppelin contracts and libraries: ``npm i @openzeppelin/contracts``
* Front end 
  * React: ``npm i -g react``
  * React-bootstrap: ``npm i react-bootstrap``
  * Bootstrap: ``npm i bootstrap``
  * React Error Boundary: ``npm i react-error-boundary``
* Web3
  * web3js: ``npm i -g web3``
  * ethers: ``npm i -g ethers``
  * Metamask: ``npm i @metamask/detect-provider``
  * Install metamask wallet in your browser
* Utils
  * .env file: ``npm i dotenv``

## How to Interact with the DApp
There are 3 ways to interact with this DApp.
#### Interact through publicly deployed web interface
* Go to: https://smartbank.vercel.app/
* If you do not have a Metamask browser extension, install Metamask in your browser. Connect your Metamask wallet and start interacting with the app.
#### Interact through local network
  * Download this folder 
  * Run ``cd blockchain-developer-bootcamp-final-project-master`` which is the root directory
  * Run ``npm install`` to install all the dependencies in the ``package.json`` file
  * Launch the user interface via port: 3000 by running the following command in the root directory
  ``npm run start``
  * Access the user interface via ``http://localhost:3000``
  * If you do not have Metamask browser extension, install Metamask in your browser. Connect your Metamask wallet and start interacting with the app.
  
#### Interact via Etherscan
  * You may also choose to interact with the SmartBank contract via [Etherscan Rinkeby.](https://rinkeby.etherscan.io/address/0x0eaee27d1cdbaF249dAb7B1CcBdDeAFCB5Ae86eB)

## Directory Structure
Key files and folders structures are as below:
```
blockchain-developer-bootcamp-final-project-master (root directory)
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
|   |   +-- Fallback.js
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
    * Input: deposit amount (specified as ``msg.value``)
    * Output: return true on successful execution, emit depositETH event
  * addBalanceERC20
    * Purpose: for users to deposit ERC20 token which will then be converted to ETH and earn interest from Compound
    * Input: ERC20 token address, deposit amount
    * Output: return true on successful execution, emit depositERC20Token event
  * getBalanceInWei
    * Purpose: read-only function to view a user's balance in ETH terms
    * Input: user address
    * Output: total balance including interest in ETH terms
  * withdraw
    * Purpose: for users to withdraw balance from the contract in ETH; "nonReentrant" is applied to prevent reentrancy
    * Input: withdraw amount
    * Output: return true on successful execution, emit withdrawETH event
  * withdrawInERC20
    * Purpose: for users to withdraw balance from the contract in an ERC20 token; "non-Reentrant" is applied to prevent reentrancy
    * Input: withdraw amount in ETH terms, ERC20 token address
    * Output: return true on successful execution, emit withdrawERC20Token event
* You can deploy the SmartBank contract to the Rinkeby network by running the following command. Make sure you have sufficient ETH balance to pay for the gas fee.
```
truffle migration --reset --network rinkeby
```
* The deployment of the contract will require the following dependencies and modifications of default settings:
  * Constructor inputs are specified in ``migrations/2_deploy_contracts.js``. More details in Migration section below.
  * Network configuration is specified in ``truffle-config.js``. More details in Truffle Configuration below.
  * HDWallet provider - install via ``npm i -g @truffle/hdwallet-provider``
  * Network provider - create an account with Infura/Alchemy and get the provider URL
  * Fill in the .env.example file with the necessary account and network provider details 
  * Due to the ``contracts`` and ``abi`` folder residing in ``src`` folder, you have to modify the default Truffle directory in ``truffle-config.js``, as below:
  ```
  contracts_directory: './src/contract/',
  contracts_build_directory: './src/abis',
  migrations_directory: './migrations'
  ```
### Migration
* Within the Migrations folder, ``2_deploy_contracts.js`` retrieves the contract artifacts (abi) and deploys the contract together with the addresses of the following, as required inputs in the constructor:
  * Uniswap
  * CEther
  * WETH
* The address inputs vary depending on the network of which the contract will be deployed (mainnet, rinkeby or development)
### Smart Contract Unit Tests
* You need to install ``ganache-cli``(see "Dependencies" section above) to run the unit test
* To run the unit tests, you need to fork the mainnet and initialize the 2 sample accounts below (for the purpose of using their ETH and DAI balances). Please fill in ``YOUR_API_KEY`` obtained from INFURA before you run the command below. Also make sure you have added `mainnet_fork` network to your ``truffle-config.js`` (refer to ``truffle-config.js`` file for details)
```
ganache-cli --fork https://mainnet.infura.io/v3/YOUR_API_KEY --unlock '0x1e3D6eAb4BCF24bcD04721caA11C478a2e59852D' '0xEA674fdDe714fd979de3EdF0F56AA9716B898ec8' --networkId 999

```
*  Once you have done the above, open a new terminal and run the tests in ``SmartBank.test.js`` on mainnet fork in a separate terminal via the command below:
```
truffle test --network mainnet_fork

```
* ``SmartBank.test.js`` conducts 8 unit tests, as below:
  * to verify that the contract exists, ie. should have a valid address
  * to verify that the contract should accept deposit and the amount is correct  
  * to verify that the deposit can earn interest from Compound 
  * to verify that an event is emitted when a deposit is made
  * to verify that the withdraw function reverts when one attempts to withdraw more than available balance
  * to verify that there is correct amount remaining after a withdrawal is made
  * to verify that the contract should accept an ERC20 token deposit
  * to verify that the contract should allow withdrawal in ERC20 token based on dex exchange rate
* ``exceptionsHelpers.js`` file provides the required functions for handling exceptions produced during the tests
* Before running ``truffle test``, please ensure that you modify the default Truffle directory for ``contracts`` and ``abi`` as stated in the "Contracts" and "Truffle Configuration" sections.
* Dependencies: ``npm i @openzeppelin/test-helpers``
### Front End 
* The front-end is built using React library with the necessary Hooks and deployed to web interface via Vercel.
* The front-end includes the following:
  * Metamask wallet connect button
  * Display the wallet account balance 
  * Allows user to submit deposit or withdraw tokens or ETH
* Input validation to provide better user experience and avoid error fallback
* Metamask connector can detect a change of network in your Metamask wallet and the web interface will issue a warning to the user that the app is only deployed on Rinkeby network
### Truffle Configuration
* ``truffle-config.js`` contains the network configuration for the following networks:
  * development
  * Rinkeby testnet
  * Mainnet
  * Mainnet_fork
* HDwallet provider is required to connect to the Rinkeby testnet or Mainnet
  * install via ``npm i -g @truffle/hdwallet-provider``
* Seed phrase and network provider (Infura or Alchemy) details are stored locally in a ``.env`` file. An example of such file is available - ``.env.example``
* Due to the ``contracts`` and ``abi`` folder residing in ``src`` folder, you have to modify the default Truffle directory in ``truffle-config.js``, as below:
  ```
  contracts_directory: './src/contract/',
  contracts_build_directory: './src/abis',
  migrations_directory: './migrations'
  ```
## Deployed Address and Verification
The contract is deployed and verified on Rinkeby testnet at [0x0eaee27d1cdbaF249dAb7B1CcBdDeAFCB5Ae86eB](https://rinkeby.etherscan.io/address/0x0eaee27d1cdbaF249dAb7B1CcBdDeAFCB5Ae86eB)
## Screencast

https://www.youtube.com/watch?v=06ZhjX3d1No&t=1037s
## Ethereum account (for NFT certification)
```
0xb2cddF705eA6f12D7B5Da081F679305A3209Af99
```
