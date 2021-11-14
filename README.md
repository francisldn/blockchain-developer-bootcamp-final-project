
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

The DApp is deployed and verified on Rinkeby testnet at [0xa8A3b1D784213be8669de161165d75aF33B49504](https://rinkeby.etherscan.io/address/0xa8A3b1D784213be8669de161165d75aF33B49504)
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
  * You may also choose to interact with the SmartBank contract via [Etherscan Rinkeby.]((https://rinkeby.etherscan.io/address/0xa8A3b1D784213be8669de161165d75aF33B49504)

## Directory Structure
```
SmartBank (root)
+-- migrations
|
+-- src
|   +-- abis
|   +-- Component
|   +-- contracts
|
+-- test   
|
+-- truffle-config.js
+-- package.json
```

### Contracts


### Migration


### Test


### User Interface


### Truffle configuration


## Deployed Address and Verification


