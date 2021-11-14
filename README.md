
>**_NOTE:_**
```
README.md file which describes the project, describes the directory structure, and where the frontend project can be accessed (see #8). Please also include your public Ethereum account if you would like to receive your certification as an NFT (this is optional). 

In your README.md, be sure to have clear instructions on: 
Installing dependencies for your project 
Accessing or—if your project needs a server (not required)—running your project
Running your smart contract unit tests and which port a local testnet should be running on.
Note: This section used to require three bash scripts but has been revised.
```
# About Decrypt - Your Smart CryptoCurrency Bank
This DApp will allow users to deposit and withdraw ETH and ERC20 tokens. User deposit will earn interest from other established protocols such as Compound. Users should be aware that ERC20 tokens which are deposited will be converted into ETH and earn interest. Users can choose to withdraw the balances as ETH or any other ERC20 tokens. 

The DApp interacts with established protocols such as Compound and Uniswap for token swaps and earning interest. It also uses Openzeppelin's contracts and libraries such as ERC20, ReentrancyGuard and Address.

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
* Utils
  * .env file: ``npm i -g dotenv``

## How to Launch the DApp
* Download the folder and launch the user interface via port: 3000 by running
  ``npm run start``
  in the SmartBank root directory
  * Connect your wallet and start interacting with the app
* You may also choose to interact with the SmartBank contract via [Etherscan Rinkeby.]((https://rinkeby.etherscan.io/address/0xa8A3b1D784213be8669de161165d75aF33B49504)

## Directory Structure
SmartBank (root)
|-- migrations
|   |-- 1_initial_migrations
|   |-- 2_deploy_contracts
|
|-- src
|   |-- abis
|   |-- Component
|   |-- contracts
|   |-- node_modules
|
|-- test   


### Contracts


### Migration


### Test


### User Interface


## Deployed Address and Verification


