//SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.0;

///@title Compound Ether - CToken which wraps Ether
///@notice interface for SmartBank contract to interact with Compound
///@dev refer to https://github.com/compound-finance/compound-protocol/blob/master/contracts/CEther.sol for further details
interface cETH {
    
    // define functions of COMPOUND to use
    function mint() external payable; // to deposit to compound
    function mint(uint mintAmount) external payable returns (uint);
    function redeem(uint redeemTokens) external returns (uint); // to withdraw from compound
    
    //following 2 functions to determine how much you'll be able to withdraw
    function exchangeRateStored() external view returns (uint); 
    function balanceOf(address owner) external view returns (uint256 balance);
}

///@title Uniswap V2 Router01
///@notice Uniswap interface to enable SnartBank contract to interact and swap tokens
///@dev refer to https://github.com/Uniswap/v2-periphery/blob/master/contracts/UniswapV2Router01.sol for further details

interface IUniswapV2Router01 {
    function factory() external pure returns (address);
    function WETH() external pure returns (address);
    
    function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline)
        external
        payable
        returns (uint[] memory amounts);

    function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
        external
        returns (uint[] memory amounts);

    function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts);
}


pragma solidity 0.8.0;

interface IUniswapV2Router02 is IUniswapV2Router01 {

    function swapExactETHForTokensSupportingFeeOnTransferTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable;
    function swapExactTokensForETHSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external;
    
}

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/utils/Address.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';

pragma solidity 0.8.0;

///@title SmartBank
///@notice the contract allows users to deposit and withdraw in ETH and ERC20 tokens and earn interests
///@author Francis_ldn
///@dev inherits ReentrancyGuard which is deployed in withdraw() and withdrawInERC20() functions to safeguard from reentrancy
///@dev uses SafeMath library to prevent overflow operations
///@dev uses Address library to check if an address is a valid contract address (for ERC20 token)
contract SmartBank is ReentrancyGuard {
    using Address for address;
    using SafeMath for uint256;

    IUniswapV2Router02 uniswap;
    cETH ceth;
    address weth;
    
    constructor(address _uniswap, address _comp, address _weth) {
        uniswap = IUniswapV2Router02(_uniswap);
        ceth = cETH(_comp);
        weth = _weth;
    }

    uint256 private totalContractBalance;

    mapping(address => uint) balances;
    
    event depositETH(address indexed _from, uint256 amountDeposited);
    event depositERC20Token(address indexed depositor, string symbol, uint256 amountDeposited);
    event withdrawETH(address indexed depositor, uint256 amountWithdrawn);
    event withdrawERC20Token(address indexed _to, string symbol, uint256 amountWithdrawn);

    ///@notice for user to deposit ETH to this contract and earn interest from Compound
    ///@return true upon successful deposit of ETH
    ///@dev due to the gas fee incurred, it is possible that the value of deposit could be slightly less than the amount deposited initially
    function addBalance() external payable returns (bool){
        // to keep track of user's ETH balance
        balances[msg.sender] = balances[msg.sender].add(msg.value);
        // to keep track of the contract's ETH balance
        totalContractBalance = totalContractBalance.add(msg.value);
        
        //send ethers to mint()
        ceth.mint{value: msg.value}();
        emit depositETH(msg.sender, msg.value);
        return true;
    }
    
    ///@notice to get the total amount deposited (in Wei) to this contract by various users
    ///@notice ERC20 tokens deposited to this contract will be converted to ETH and added to the contract balance
    function getContractBalance() public view returns(uint256){
        return totalContractBalance;
    }
    
    ///@notice to get the total amount deposited to Compound from this contract converted to wei
    ///@return total amount of CEth held by this account converted to Wei - for internal use only
    function getCompoundBalance() internal view returns(uint256) {
        return (ceth.balanceOf(address(this)).mul(ceth.exchangeRateStored())).div(1e18);
    }
    
    ///@notice to get total amount of CEth held by this contract
    function getTotalCethAmount() internal view returns(uint256){
        return ceth.balanceOf(address(this));
    }
    
    /// @notice to calculate the conversion rate between the amount deposited to this contract and amount available at Compound
    /// @dev decimal handling - 1e18 has to be placed in the numerator before dividing by getContractBalance
    function conversionRateCompToContract() internal view returns (uint256)  {
        return (getCompoundBalance().mul(1e18)).div(getContractBalance());
    }
    
    ///@notice to calculate the conversion rate between total ETH and CETH by dividing total contract balance (in Wei) by the total CETH amount
    function conversionRateContractToCeth() internal view returns (uint256) {
        return getContractBalance().div(getTotalCethAmount());
    }
    
    
    ///@notice allows user to deposit ERC20 tokens to this contract
    ///@dev This contract consists of 3 internal functions - addTokens, swapExactTokensforETH and depositToCompound
    ///@dev Upon receiving the ERC20 token, the function will swap the token into ETH on Uniswap
    ///@dev Then, the ETH will be deposited to Compound to earn interest
    ///@dev Due to the conversion from ERC20 token to ETH, it is possible that the value of amount in ETH could initially be slightly less than the original ERC20 token amount deposited
    function addBalanceERC20(address erc20TokenAddress, uint256 amountToDeposit) external payable returns (bool){
        require(erc20TokenAddress.isContract() && erc20TokenAddress != address(0),"not a valid contract address");
        require(ERC20(erc20TokenAddress).balanceOf(msg.sender)>= amountToDeposit, "insufficient amount");
        require(ERC20(erc20TokenAddress).allowance(msg.sender,address(this))>= amountToDeposit, "insufficient allowance");
        require(amountToDeposit > 0, 'Amount must be greater than zero');
        
        // get approval from the token contract first before depositing tokens, otherwise this function will revert due to insufficient allowance
        addTokens(erc20TokenAddress, amountToDeposit);
        
        // swap ERC20 token to ETH via Uniswap
        uint256 depositTokens = amountToDeposit;
        uint256 depositAmountInETH = swapExactTokensforETH(erc20TokenAddress, depositTokens);
        require(depositAmountInETH > 0, "failed to swap tokens");
        
        // keep track of the user balance and contract balance
        balances[msg.sender] = balances[msg.sender].add(depositAmountInETH);
        totalContractBalance = totalContractBalance.add(depositAmountInETH);
        
        // deposit ETH amount to Compound
        depositToCompound(depositAmountInETH);

        emit depositERC20Token(msg.sender, ERC20(erc20TokenAddress).symbol(), amountToDeposit);
        return true;
    }
    
    ///@notice this function deposits ETH available in this contract to Compound and then receive CETH in return
    function depositToCompound(uint256 amountInETH) private {
        uint256 cethBalanceBefore = ceth.balanceOf(address(this));
        ceth.mint{value: amountInETH}();
        uint256 cethBalanceAfter = ceth.balanceOf(address(this));
        uint256 depositAmountInCeth = cethBalanceAfter.sub(cethBalanceBefore); 
    }

    
    ///@notice this function enables user to deposit erc20 tokens to this contract after user has approved the amount
    function addTokens (address erc20TokenAddress, uint256 amountToDeposit) private {
        // user will have to approve the ERC20 token amount first outside of the smart contract
        uint256 depositTokens = amountToDeposit;
        // to check the return value of ERC20 transferFrom function before proceeding
        bool success = ERC20(erc20TokenAddress).transferFrom(msg.sender, address(this), depositTokens);
        require(success, "ERC20 token deposit fails");
    }
    
    ///@notice to check the amount of ERC20 token that has been approved by user
    ///@dev once amount is approved, user can start depositing ERC20 token
    function getAllowanceERC20(address erc20TokenAddress) external view returns (uint256) {
        return ERC20(erc20TokenAddress).allowance(msg.sender, address(this));
    }
    
    ///@notice this function enables the contract to convert ERC20 tokens into ETH via Uniswap router
    function swapExactTokensforETH(address erc20TokenAddress, uint swapAmount) internal returns (uint256) {
        require(erc20TokenAddress.isContract() && erc20TokenAddress != address(0), "not a valid contract address");
        require(ERC20(erc20TokenAddress).balanceOf(address(this))>0, "insufficient tokens to swap");
        
        ERC20(erc20TokenAddress).approve(address(uniswap),swapAmount);
        uint256 allowedAmount = ERC20(erc20TokenAddress).allowance(address(this), address(uniswap));
        
        // generate the uniswap pair path of token -> WETH
        // WETH address is set in the constructor - varies depending on the network
        address[] memory path = new address[](2);
        path[0] = erc20TokenAddress;
        path[1] = weth;
        
        // get the amount of ETH held in this contract before swap
        uint256 ETHBalanceBeforeSwap = address(this).balance;
        // make the swap
        
        // catch error if unable to swap (due to non-existence of liquidity pool)
         try  uniswap.swapExactTokensForETH(
                allowedAmount,
                0, // accept any amount of ETH
                path,
                address(this),
                block.timestamp
            ) 
            { 
                // get the amount of ETH held in this contract after swap
                uint256 ETHBalanceAfterSwap = address(this).balance;

                // calculate the difference to get the amount of ETH deposited
                uint256 depositAmountInETH = ETHBalanceAfterSwap.sub(ETHBalanceBeforeSwap);
                
                return depositAmountInETH;
            }
            catch {
                return 0;
            }
        
    }
    
    ///@notice this function enables the contract to convert ETH into an ERC20 token through uniswap router
    function swapExactETHForTokens(address erc20TokenAddress, uint256 swapAmountInWei) internal returns (uint256) {
        require(erc20TokenAddress.isContract() && erc20TokenAddress != address(0), "not a valid contract address");
        
        
        address[] memory path = new address[](2);
        path[0] = weth;
        path[1] = erc20TokenAddress;
        
        // get the ERC20 token balance held by this contract before swap
        uint256 erc20TokenBeforeSwap = ERC20(erc20TokenAddress).balanceOf(address(this));
        
        // catch error if unable to swap (due to non-existence of liquidity pool)
        try uniswap.swapExactETHForTokens{value: swapAmountInWei}(
            0, // accept any amount of token
            path,
            address(this),
            block.timestamp
        ) {
        
        // get the balance of ERC20 token balance held by this contract after swap
        uint256 erc20TokenAfterSwap = ERC20(erc20TokenAddress).balanceOf(address(this));

        // calculate the difference to derive the amount of tokens deposited
        uint256 erc20TokenAmount = erc20TokenAfterSwap.sub(erc20TokenBeforeSwap);
        return erc20TokenAmount;
        
        } catch {
            return 0;
        }
    }
    

    ///@notice for user to check their ETH balance (in Wei)
    ///@dev the amount of (user deposit + interest earned) is allocated to a user proportionally to the user's initial deposit
    ///@dev if the totalContractBalance is 0 or user balance is 0, the function will return 0
    function getBalanceInWei(address userAddress) public view returns (uint256) {
        if(totalContractBalance == 0 || balances[userAddress]==0) {
            return 0;
        } else {
        return (getCethBalanceInWei().mul(balances[userAddress])).div(totalContractBalance);
        }
    }
    
    ///@notice to get all the CETH balance held by this contract and convert into ETH
    function getCethBalanceInWei () internal view returns (uint256) {
        return (ceth.balanceOf(address(this)).mul(ceth.exchangeRateStored())).div(1e18);
    }

    ///@notice for user to withdraw their account balance in ETH
    function withdraw(uint256 _withdrawAmountInWei) external payable nonReentrant returns(bool) {
        // check that the withdraw amount is less than the user balance including interest earned
        require(_withdrawAmountInWei <= getBalanceInWei(msg.sender), "overdrawn");
        
        // convert withdrawal amount(Wei) to Ceth so that this contract can redeem from Compound
        uint256 amountToRedeemInCeth = ((_withdrawAmountInWei.mul(1e18)).div(conversionRateCompToContract())).div(conversionRateContractToCeth());

        // record the contract ETH balance before redeem
        uint256 contractBalanceBeforeRedeem = address(this).balance;
        
        ceth.redeem(amountToRedeemInCeth);
        
        // record the contract ETH balance after redeem
        uint256 contractBalanceAfterRedeem = address(this).balance;
        
        // calculate the total amount redeemed in ETH terms (Wei) then check if transaction is successful (>0 means tx successful)
        uint256 redeemed = contractBalanceAfterRedeem.sub(contractBalanceBeforeRedeem);
        require(redeemed>0, "ceth not redeemed");
        // if redeemed amount is greater than the user's initial deposit (due to interest earned), then user balance = 0 (assume full amount withdrawn)
        if(redeemed> balances[msg.sender]) {
            balances[msg.sender] =0;
        } else {
            balances[msg.sender]= balances[msg.sender].sub(redeemed);
        }
        
        // if redeemed amount is greater than total contract balance (due to interest earned), then contract balance = 0 (assume full amount withdrawn)
        if(redeemed > totalContractBalance) {
            totalContractBalance =0;
        } else {
            totalContractBalance = totalContractBalance.sub(redeemed);
        }

        // check for return value from a low-level call        
        (bool sent,) = payable(msg.sender).call{value: redeemed}("");
        require(sent, "failed to send ether");

        emit withdrawETH(msg.sender, redeemed);
        return true;
    }
    
    ///@notice allows user to withdraw balance in a chosen ERC20 token
    ///@dev the function checks to ensure that ERC20 token address is a contract address and it isn't 0x0
    function withdrawInERC20 (uint _withdrawAmountInWei, address erc20TokenAddress) external payable nonReentrant returns (bool){
        require(erc20TokenAddress.isContract() && erc20TokenAddress != address(0), "not a valid contract address");
        require(_withdrawAmountInWei <= getBalanceInWei(msg.sender), "overdrawn");
        
        // convert amount to Ceth so that the contract can redeem from Compound
        uint256 amountToRedeemInCeth = ((_withdrawAmountInWei.mul(1e18)).div(conversionRateCompToContract())).div(conversionRateContractToCeth());

        // record the contract balance of ERC20 token amount before redeeming ETH from Compound
        uint256 contractBalanceBeforeRedeem = address(this).balance;
        
        ceth.redeem(amountToRedeemInCeth);
        
        // record the amount after redeem
        uint256 contractBalanceAfterRedeem = address(this).balance;
        
        // get amount of ETH redeemed
        uint256 redeemed = contractBalanceAfterRedeem.sub(contractBalanceBeforeRedeem);
        require(redeemed >0, "ceth not redeemed");
        // convert the amount of ETH redeemed to ERC20 token, and then check if transaction is successful (>0 means tx is successful)
        uint256 erc20TokenRedeemed = swapExactETHForTokens(erc20TokenAddress,redeemed);
        require(erc20TokenRedeemed >0, "failed to swap tokens");
        
        // if redeemed amount is greater than total user balance (due to interest earned), then set user balance = 0 (assume full amount withdrawn) 
        if(redeemed > balances[msg.sender]) {
            balances[msg.sender] = 0;
        } else {
            balances[msg.sender]= balances[msg.sender].sub(redeemed);
        }

        // if redeemed amount is greater than the total contract balance (due to interest earned), then contract balance = 0 (assume full amount withdrawn)
        if(redeemed > totalContractBalance) {
            totalContractBalance =0;
        } else {
            totalContractBalance = totalContractBalance.sub(redeemed);
        }
        
        // check return value - ERC20 token transfer function will return true if transfer is successful 
        bool sent = ERC20(erc20TokenAddress).transfer(msg.sender, erc20TokenRedeemed);
        require(sent, "transfer failed");
        emit withdrawERC20Token(msg.sender, ERC20(erc20TokenAddress).symbol(), erc20TokenRedeemed);
        return true;
    }
    
    ///@dev receive() and fallback() functions to allow the contract to receive ETH and data  
    receive() external payable {
    }

    fallback() external payable {
    }
    
}
