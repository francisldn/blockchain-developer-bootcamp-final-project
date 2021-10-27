//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import './ERC20.sol';
interface cETH {
    
    // define functions of COMPOUND to use
    
    function mint() external payable; // to deposit to compound
    function mint(uint mintAmount) external payable returns (uint);
    function redeem(uint redeemTokens) external returns (uint); // to withdraw from compound
    
    //following 2 functions to determine how much you'll be able to withdraw
    function exchangeRateStored() external view returns (uint); 
    function balanceOf(address owner) external view returns (uint256 balance);
}
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

}


pragma solidity ^0.8.0;

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

pragma solidity ^0.8.0;

contract SmartBank {
    
    IUniswapV2Router02 uniswap;
    cETH ceth;
    address weth;
    
    constructor(address _uniswap, address _comp, address _weth) {
        uniswap = IUniswapV2Router02(_uniswap);
        ceth = cETH(_comp);
        weth = _weth;
    }

    uint public totalContractBalance;
    uint public depositAmountInETH;
    uint public transferAmountERC20;
    uint internal depositAmountInCeth;
    uint internal totalAmountInCeth;

    uint public redeemed;
    uint public erc20TokenRedeemed;

    mapping(address => uint) balances;
    
    event depositETH(address indexed _from, uint256 amountDeposited);
    event depositERC20Token (address indexed depositor, string symbol, uint256 amountDeposited);
    event withdrawETH(address indexed depositor, uint256 amountWithdrawn);
    event withdrawERC20Token(address indexed _to, string symbol, uint256 amountWithdrawn);


    function addBalance() public payable {
        // to keep track of user's ETH balance
        balances[msg.sender] += msg.value;
        // to keep track of the contract's ETH balance
        totalContractBalance += msg.value;
        
        //send ethers to mint()
        ceth.mint{value: msg.value}();
        emit depositETH(msg.sender, msg.value);
    }
    
    // get the total amount deposited to this contract by various users
    function getContractBalance() public view returns(uint){
        return totalContractBalance;
    }
    
    // get the total amount deposited to Compound from this contract converted to wei
    function getCompoundBalance() internal view returns (uint) {
        return ceth.balanceOf(address(this))*ceth.exchangeRateStored()/1e18;
    }
    
    // get total amount of Ceth held by this contract
    function getTotalCethAmount() internal view returns (uint) {
        return ceth.balanceOf(address(this));
    }
    
    // to calculate the conversion rate between amount deposited to this contract and amount available at Compound
    // note the decimal handling - 1e18 has to be placed in the numerator before dividing by getContractBalance
    function conversionRateCompToContract() internal view returns (uint) {
        return getCompoundBalance()*1e18/getContractBalance();
    }
    
    function conversionRateContractToCeth() internal view returns (uint) {
        return getContractBalance()/getTotalCethAmount();
    }
    
    
    // This function allows user to deposit ERC20 tokens to this contract
    // This contract is formed of 3 functions - addTokens, swapExactTokensforETH and depositToCompound
    // Upon receiving the ERC20 token, the function will swap the token into ETH on Uniswap
    // Then, the ETH will be deposited to Compound to earn interest
    // Due to the conversion from ERC20 token to ETH, it is possible that the value of amount in ETH could be less than the ERC20 token amount
    function addBalanceERC20(address erc20TokenAddress, uint256 amountToDeposit) public payable returns (bool){
        
        require(ERC20(erc20TokenAddress).balanceOf(msg.sender)>= amountToDeposit, "insufficient amount");
        require(ERC20(erc20TokenAddress).allowance(msg.sender,address(this))>= amountToDeposit, "insufficient allowance");
        require(amountToDeposit > 0, 'Amount must be greater than zero');
        
        // get approval outside of smart contract first before depositing tokens
        addTokens(erc20TokenAddress, amountToDeposit);
        
        uint depositTokens = amountToDeposit;
        depositAmountInETH = swapExactTokensforETH(erc20TokenAddress, depositTokens);

        // deposit amount to this contract
        balances[msg.sender] += depositAmountInETH;
        totalContractBalance += depositAmountInETH;
        
        depositToCompound(depositAmountInETH);

        emit depositERC20Token(msg.sender, ERC20(erc20TokenAddress).symbol(), amountToDeposit);
        return true;
    }
    
    // this function allows user to deposit ETH available in this contract to Compound and then receive CETH in return
    function depositToCompound(uint256 amountInETH) private {
        uint256 cethBalanceBefore = ceth.balanceOf(address(this));
        ceth.mint{value: amountInETH}();
        uint cethBalanceAfter = ceth.balanceOf(address(this));
        depositAmountInCeth = cethBalanceAfter- cethBalanceBefore; 
    }
    
    // this function enables user to deposit erc20 tokens to this contract after user has approved the amount
    function addTokens (address erc20TokenAddress, uint256 amountToDeposit) private {
        // user will have to approve the ERC20 token amount outside of the smart contract
        uint depositTokens = amountToDeposit;
        bool success = ERC20(erc20TokenAddress).transferFrom(msg.sender, address(this), depositTokens);
        require(success, "ERC20 token deposit fails");
        // this is added for sanity check
        transferAmountERC20 = ERC20(erc20TokenAddress).balanceOf(address(this));
    }
    
    // this function is to check the amount that has been approved by user
    function getAllowanceERC20(address erc20TokenAddress) public view returns (uint) {
        return ERC20(erc20TokenAddress).allowance(msg.sender, address(this));
    }
    
    // this function enables the contract to convert erc20 tokens into ETH to be deposited to Compound
    function swapExactTokensforETH(address erc20TokenAddress, uint swapAmount) public payable returns (uint) {
        require(ERC20(erc20TokenAddress).balanceOf(address(this))>0, "insufficient tokens to swap");
        
        ERC20(erc20TokenAddress).approve(address(uniswap),swapAmount);
        uint allowedAmount = ERC20(erc20TokenAddress).allowance(address(this), address(uniswap));
        
        // generate the uniswap pair path of token -> weth
        address[] memory path = new address[](2);
        path[0] = erc20TokenAddress;
        path[1] = weth;
        
        depositAmountInETH = 0;
        uint ETHBalanceBeforeSwap = address(this).balance;
        // make the swap
        uniswap.swapExactTokensForETH(
            allowedAmount,
            0, // accept any amount of ETH
            path,
            address(this),
            block.timestamp
        );
        
        uint ETHBalanceAfterSwap = address(this).balance;
        depositAmountInETH = ETHBalanceAfterSwap - ETHBalanceBeforeSwap;
        return depositAmountInETH;
    }

    function swapExactETHForTokens(address erc20TokenAddress, uint swapAmountInWei) public payable returns (uint) {
        require(address(this).balance>0, "insufficient ETH to swap");
        
        address[] memory path = new address[](2);
        path[0] = weth;
        path[1] = erc20TokenAddress;
        
        uint erc20TokenAmount = 0;
        uint erc20TokenBeforeSwap = ERC20(erc20TokenAddress).balanceOf(address(this));
        uniswap.swapExactETHForTokens{value: swapAmountInWei}(
            0, // accept any amount of token
            path,
            address(this),
            block.timestamp
        );
        uint erc20TokenAfterSwap = ERC20(erc20TokenAddress).balanceOf(address(this));
        erc20TokenAmount = erc20TokenAfterSwap - erc20TokenBeforeSwap;
        return erc20TokenAmount;
    }
    

    // amount expressed in wei
    function getBalanceInWei(address userAddress) public view returns(uint256) {
        return getCethBalanceInWei() * balances[userAddress]/totalContractBalance;
    }
    
    // amount expressed in wei
    function getCethBalanceInWei () internal view returns (uint256) {
        return ceth.balanceOf(address(this))*ceth.exchangeRateStored()/1e18;
    }

    function withdraw(uint256 _withdrawAmountInWei) public payable returns (uint) {
        // check that the withdraw amount is less than the user's balance
        require(_withdrawAmountInWei <= getBalanceInWei(msg.sender), "overdrawn");
        
        // convert amount to Ceth so that this contract can redeem from Compound
        uint256 amountToRedeemInCeth = (_withdrawAmountInWei*1e18/conversionRateCompToContract())/conversionRateContractToCeth();
        uint256 amountToRedeem = (_withdrawAmountInWei/conversionRateCompToContract())/1e18;
        balances[msg.sender] -= amountToRedeem;
        totalContractBalance -= amountToRedeem;
        
        
        // record the amount before redeem
        uint256 contractBalanceBeforeRedeem = address(this).balance;
        
        ceth.redeem(amountToRedeemInCeth);
        
        // record the amount after redeem
        uint256 contractBalanceAfterRedeem = address(this).balance;
        
        redeemed = contractBalanceAfterRedeem - contractBalanceBeforeRedeem;
        
        (bool sent,) = payable(msg.sender).call{value: redeemed}("");
        require(sent, "Failed to send ether");

        emit withdrawETH(msg.sender, redeemed);
        return redeemed;
    }
    
    function withdrawInERC20 (uint _withdrawAmountInWei, address erc20TokenAddress) public payable returns (uint) {
        
        require(_withdrawAmountInWei <= getBalanceInWei(msg.sender), "overdrawn");
        
        // convert amount to Ceth so that this contract can redeem from Compound
        uint256 amountToRedeemInCeth = (_withdrawAmountInWei*1e18/conversionRateCompToContract())/conversionRateContractToCeth();
        uint256 amountToRedeem = (_withdrawAmountInWei/conversionRateCompToContract())/1e18;
        balances[msg.sender] -= amountToRedeem;
        totalContractBalance -= amountToRedeem;
        
        
        // record the amount before redeem
        uint256 contractBalanceBeforeRedeem = address(this).balance;
        
        ceth.redeem(amountToRedeemInCeth);
        
        // record the amount after redeem
        uint256 contractBalanceAfterRedeem = address(this).balance;
        
        redeemed = contractBalanceAfterRedeem - contractBalanceBeforeRedeem;
        
        // convert the amount redeemed to ERC20 token
        erc20TokenRedeemed = swapExactETHForTokens(erc20TokenAddress,redeemed);
        ERC20(erc20TokenAddress).transfer(msg.sender, erc20TokenRedeemed);

        emit withdrawERC20Token(msg.sender, ERC20(erc20TokenAddress).symbol(), erc20TokenRedeemed);
        return erc20TokenRedeemed;
    }
    
    receive() external payable {}
    
}
