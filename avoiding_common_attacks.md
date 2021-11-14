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
* Use ``require`` to check sender's balances and allowances (for ERC20 tokens)
* Use checks-effects-interactions in the ``withdraw`` and ``withdrawInERC20`` functions
* Use Openzeppelin's ReentrancyGuard to safeguard against reentrancy attack
* Pull over Push method for balance withdrawals