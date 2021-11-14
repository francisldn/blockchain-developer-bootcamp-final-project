# Avoiding Common Attacks

>**_REQUIREMENT:_**
```
From Solidity Pitfalls and Attacks
Using Specific Compiler Pragma 
Proper Use of Require, Assert and Revert 
Use Modifiers Only for Validation 
Pull Over Push (Prioritize receiving contract calls over making contract calls)
Checks-Effects-Interactions (Avoiding state changes after external calls)
Proper use of .call and .delegateCall

From Smart Contract Pitfalls and Attacks
Not everything can be avoided, but you can write if you’re taking protection against:
Re-entrancy
Timestamp Dependence
Forcibly Sending Ether
Tx.Origin Authentication
```

The contract applies the following measures to avoid common security pitfalls:
* Using a specific pragma compile - Solidity 0.8.0 is used
* Use ``require`` to check sender's balances and allowances, where applicable
* Use checks-effects-interactions in the ``withdraw`` and ``withdrawInERC20`` functions
* Use Openzeppelin's [ReentrancyGuard](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/security/ReentrancyGuard.sol) to safeguard against reentrancy attack
* Use Openzeppelin's [Address](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Address.sol) library to validate ERC20 token contract addresses (eg. ``isContract`` function)
* "Pull over Push" method for balance withdrawals
* Include ``fallback()`` and ``receive()`` functions in the contract to receive force-sending of ETH and add the amount to the contract balances