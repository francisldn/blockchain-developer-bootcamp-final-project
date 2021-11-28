const SmartBank = artifacts.require("SmartBank");
const IERC20 = artifacts.require("IERC20");
const IUniswapRouter= artifacts.require("IUniswapV2Router02");
let {catchRevert} = require("./exceptionsHelpers.js");
const {time} = require('@openzeppelin/test-helpers');
require('dotenv').config();
const Web3 = require('web3');


contract("SmartBank", function() { 

    const UNISWAP_MAINNET= '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
    const WETH_MAINNET = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
    const COMP_MAINNET = '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5';
    const DAI_ADDRESS = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
    
    let instance;
    let accounts;
    let alice;
    const provider =  process.env.MAINNET_RPC_URL;
    let web3 = new Web3(provider);
    let dai;
    let uniswapRouter;
    beforeEach(async() => {
        // fork mainnet and use 2 of the accounts from mainnet
        alice_eth = '0xEA674fdDe714fd979de3EdF0F56AA9716B898ec8'
        bob_dai = '0x1e3D6eAb4BCF24bcD04721caA11C478a2e59852D'
        instance = await SmartBank.new(UNISWAP_MAINNET, COMP_MAINNET, WETH_MAINNET);
        dai = await IERC20.at(DAI_ADDRESS);
        uniswapRouter = await IUniswapRouter.at(UNISWAP_MAINNET);
    });

    //1st test
    it("should have an address", async() => {
        assert.notEqual(instance.address, '');
        assert.notEqual(instance.address, null);
        assert.notEqual(instance.address, undefined);
        assert.notEqual(instance.address, 0x0)
    });    

    //2nd test
    it("should deposit correct amount", async() => {   
        const deposit = web3.utils.toWei('1','ether');
        await instance.addBalance({from:alice_eth, value:deposit});
        // convert accountBalance to ether with 2 decimal
        const accountBalance = Number.parseFloat(web3.utils.fromWei(await instance.getBalanceInWei(alice_eth))).toFixed(2);
        assert.equal(Number.parseFloat(deposit/1e18).toFixed(2),accountBalance);
    });

    //3rd test
    it("deposit can earn interest from Compound", async() => {
        const deposit1 = web3.utils.toWei('1','ether');
        const deposit2 = web3.utils.toWei('1','ether');
        // deposit 1 ether 
        await instance.addBalance({from: alice_eth, value: deposit1});
        const initialDepositToCompound = await instance.getBalanceInWei(alice_eth, {from: alice_eth});

        //fast forward time by 1 hour
        let endTime = (await time.latest()).add(time.duration.hours(1))
        await time.increaseTo(endTime);

        // Note that exchangeRateStored() will only update when there are new tokens minted 
        // A new deposit of 1 ether is made so that Compound updates exchange rate for cETH 
        await instance.addBalance({from:alice_eth, value: deposit2})
        const expectedBalance = await instance.getBalanceInWei(alice_eth, {from: alice_eth});
        
        const interest = Number(expectedBalance) - (Number(initialDepositToCompound) + Number(deposit2));
        //assert interest earned is above zero
        assert.isAbove(interest, 0);
    })

    //4th test
    it("should emit the appropriate event when a deposit is made", async() => {
        const deposit = web3.utils.toWei('1','ether');
        let result = await instance.addBalance({from:alice_eth, value:deposit});

        const depositFrom = result.logs[0].args._from;
        const amountDeposit = result.logs[0].args.amountDeposited;

        assert.equal(alice_eth, depositFrom)
        assert.equal(deposit, amountDeposit)
    })

    //5th test
    it("should revert on attempt to withdraw more than available amount", async() => {
        const depositAmount = web3.utils.toWei('1','ether');
        //deposit 1 ether
        await instance.addBalance({from:alice_eth, value:depositAmount});
        const accountBalance = Number(await instance.getBalanceInWei(alice_eth));
        //attempt to withdraw 1.1 ether
        const withdrawAmount = web3.utils.toWei('1.1','ether');
        await catchRevert(instance.withdraw(withdrawAmount,{from:alice_eth}))
    })

    //6th test
    it("should have the correct remaining amount after a withdrawal is made", async() => {
        const depositAmount = web3.utils.toWei('1','ether');
   
        await instance.addBalance({from:alice_eth, value:depositAmount});
        let accountBalance = await instance.getBalanceInWei(alice_eth);
        // truncate the decimals - this is to deal with floating number 
        let amountToWithdraw = Math.trunc(Number(accountBalance)/1e15)*1e15;

        await instance.withdraw(amountToWithdraw.toString(), {from:alice_eth});
        const remainingAmount = Number(await instance.getBalanceInWei(alice_eth));

        const expectedAmountRemaining = Number(accountBalance) - Number(amountToWithdraw);
        assert.equal(Number.parseFloat(expectedAmountRemaining/1e18).toFixed(2), Number.parseFloat(remainingAmount/1e18).toFixed(2));
    })

    //7th test
    it("should accept ERC20 token deposit", async() => {
        const daiDeposit = web3.utils.toWei('10000','ether');

        //get ETH/DAI exchange rate from Uniswap
        const WETH = await uniswapRouter.WETH()
        const daiAmount= 1e18;
        const amounts = await uniswapRouter.getAmountsOut(daiAmount.toString(),[DAI_ADDRESS,WETH])
        let daioutput= Number(amounts[0].toString())
        let ethoutput = Number(amounts[1].toString())
        let eth_dai = Number.parseFloat(daioutput/ethoutput).toFixed(2);

        // calculate equivalent amount of ETH
        const expectedETHDeposit = Number.parseFloat(Number(daiDeposit)/eth_dai).toFixed(2);

        //approve and deposit Dai
        await dai.approve(instance.address,daiDeposit.toString(), {from: bob_dai})
        const allowed = web3.utils.toBN(await instance.getAllowanceERC20(DAI_ADDRESS, {from: bob_dai}));
        await instance.addBalanceERC20(DAI_ADDRESS,allowed, {from: bob_dai});
        const accountBal = Number(await instance.getBalanceInWei(bob_dai));
        
        // compare the amount by removing decimals
        assert.equal(Number.parseFloat(expectedETHDeposit/1e18).toFixed(2),Number.parseFloat(accountBal/1e18).toFixed(2))
    })

    //8th test
    it("should allow withdrawal in ERC20 token based on dex exchange rate", async() => {
        
        const deposit = web3.utils.toWei('1','ether');
        await instance.addBalance({from:alice_eth, value:deposit.toString()});
        const accountBal = Number(await instance.getBalanceInWei(alice_eth));
        // truncate the decimals - this is to deal with floating number 
        let amountToWithdraw = Math.trunc(Number(accountBal)/1e10)*1e10;

        //get ETH/DAI exchange rate from Uniswap
        const WETH = await uniswapRouter.WETH()
        const daiAmount = 1e18;
        const amounts = await uniswapRouter.getAmountsOut(daiAmount.toString(),[DAI_ADDRESS,WETH])
        let daioutput= Number(amounts[0].toString())
        let ethoutput = Number(amounts[1].toString())
        let eth_dai = Number.parseFloat(daioutput/ethoutput).toFixed(2);
        let expectedWithdrawToken = Number(deposit)*Number(eth_dai);

        //record the balance before withdrawal
        const tokenBalanceBeforeWithdraw = Number(await dai.balanceOf(alice_eth));
        // execute withdraw function
        await instance.withdrawInERC20(amountToWithdraw.toString(), DAI_ADDRESS.toString(), {from:alice_eth});
        // record the balance after withdrawal
        const tokenBalanceAfterWithdraw = Number(await dai.balanceOf(alice_eth));
        const withdrawTokenAmt = tokenBalanceAfterWithdraw - tokenBalanceBeforeWithdraw;
        const actualToExpected = Number(Math.max(withdrawTokenAmt,expectedWithdrawToken)/expectedWithdrawToken)

        // compare the ratio of actual to expected, allowing differences at 0.5% tolerance
        assert.isBelow(Number(actualToExpected),Number(1.005));
    });
    

})