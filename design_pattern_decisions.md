# Design patterns

>**_REQUIREMENT:_**
```
Below is a list of design patterns in the Smart Contract chapter, along with a short description and the title of the lesson where it’s mentioned. To meet the requirement, you need only two of the following, documented in your design_pattern_decisions.md:

Inter-Contract Execution (Calling functions in external contracts) Inter-Contract Execution, Part 1 and Part 2

Inheritance and Interfaces (Importing and extending contracts and/or using contract interfaces) Inheritances and Interfaces — (note: this is already a requirement in the final project, so you can simply describe which library or interface you use)

Oracles (retrieving third-party data) Off-Chain Oracles and Chapter 5: Second-Order Effects — Oracles Revisited

Access Control Design Patterns (Restricting access to certain functions using things like Ownable, Role-based Control) Access Control Design Patterns

Upgradable Contracts (Ways to update a deployed contract’s logic or data) Upgradable Contracts and Additional Material: Upgradable Contracts

Optimizing Gas (Creating more efficient Solidity code) Optimizing Gas
```
## Inter-Contract Execution
The contract interacts with 
* Compound protocol through cETH interface to allow for deposit to earn interest
* Uniswap protocol through IUniswapV2Router01 and IUniswapV2RouterV02 interfaces to swap ERC20 tokens to ETH
* Openzeppelin's ERC20 token contract to interact with any ERC20 tokens
  

## Inheritance and Interfaces
* Inherits from Openzeppelin's ReentrancyGuard and applies nonReentrant modifer to ``withdraw`` and    ``withdrawInERC20`` functions
* Interacts with Compound and Uniswap protocols through interfaces mentioned above
* Openzeppelin's Address library which contains isContract function - returns true if an address is a contract
* Openzeppelin's SafeMath library which checks and prevents overflow of an operation

