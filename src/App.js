import React, {useState} from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import 'bootstrap/dist/css/bootstrap.min.css';
import SmartBank from './abis/SmartBank.json';
import ERC20 from './abis/ERC20.json';
import './App.css';
import {Header} from './Component/Header';
import {MetamaskConnectButton} from './Component/MetamaskConnectButton';
import './index.css';
import {ErrorBoundary, useErrorHandler} from 'react-error-boundary';
import {Fallback} from './Component/Fallback'
import Web3 from 'web3';

function App() {
  // value of state, function to change the value of state
  const [depositValue, setDepositValue] = useState("");
  const[depositBalance, setDepositBalance] = useState("");
  const[withdrawValue, setWithdrawValue] = useState("");
  const[depositStatement, setDepositStatement] = useState("");
  const[viewStatement, setViewStatement]= useState("")
  const[withdrawStatement, setWithdrawStatement] = useState("");
  const[ERC20Address, setERC20Address] = useState("");
  const[ERC20DepositValue, setERC20DepositValue] = useState("");
  const[ERC20DepositStatement, setERC20DepositStatement] = useState("");
  const[ERC20ApproveStatement, setERC20ApproveStatement] = useState("");
  const[ERC20WithdrawValue, setERC20WithdrawValue] = useState("");
  const[ERC20WithdrawStatement, setERC20WithdrawStatement] = useState("");
  const[depositError, setDepositError] = useState("");
  const[withdrawError, setWithdrawError] = useState("");
  const[erc20WithdrawError, setERC20WithdrawError] = useState("");
  const[erc20DepositError, setERC20DepositError] = useState("");
  const[erc20WithdrawAddressError, setERC20WithdrawAddressError] = useState("");
  const[erc20DepositAddressError, setERC20DepositAddressError] = useState("");
  const handleError = useErrorHandler();
  const[loadingDeposit, setLoadingDeposit] = useState(false);
  const[loadingWithdraw, setLoadingWithdraw] = useState(false);
  const[loadingERC20Deposit, setLoadingERC20Deposit] = useState(false);
  const[loadingApprove, setLoadingApprove] = useState(false)
  const[loadingERC20Withdraw, setLoadingERC20Withdraw] = useState(false);

  const contractAddress = '0x0eaee27d1cdbaF249dAb7B1CcBdDeAFCB5Ae86eB';

  let provider;
  let accounts;
  let contract;
  let web3;
  
  async function requestAccount() {
    provider = await detectEthereumProvider();
    web3 = new Web3(provider);
    accounts = await web3.eth.getAccounts();
    contract = new web3.eth.Contract(SmartBank.abi,contractAddress)
    console.log(contract);
  }

  function initStatement() {
    setDepositBalance("")
    setDepositStatement("")
    setWithdrawStatement("")
    setERC20DepositStatement("")
    setERC20ApproveStatement("")
    setERC20WithdrawStatement("")
  }

  async function fetchETHDepositBalance() {
    initStatement();

    if(typeof window.ethereum!== 'undefined'){
      await requestAccount();
        try {
          await contract.methods.getBalanceInWei(accounts[0]).call({from:accounts[0]})
          .then((result) => {
            setDepositBalance(Math.trunc(Number(web3.utils.fromWei(result.toString()))*1e5)/1e5);
            isNaN(depositBalance) || !depositBalance ? setViewStatement("You have 0 ETH balance. Deposit ETH and start earning interest today.") : setViewStatement(`You have a balance of ${Number.parseFloat(depositBalance).toFixed(10)} ETH`)
          });
         
        } catch (err) {
          handleError(err);
          setViewStatement(`Unable to view deposit amount`);
        }
      }
    }

    function validateAddress(address) {
      try {
        // eslint-disable-next-line
        const addr = web3.utils.toChecksumAddress(address);
        return true;
      } catch(error) {
        console.log(error)
        return false;
      }
    }
    
    //ETH deposit
  const handleETHDepositValueChange = async (e) =>{
    e.preventDefault();
    setLoadingDeposit(true);
    initStatement();

    if(typeof window.ethereum!== 'undefined'){
      await requestAccount();
      let depositAmount;
      try {
        if(isNaN(depositValue)) {
          setLoadingDeposit(false)
          setDepositError("Please enter number only");
          return;
        } else {
          depositAmount = web3.utils.toWei(depositValue, 'ether');
          setDepositError("")
        }

      } catch (error) {
        handleError(error);
        console.log(error);
      }

      try{
        setDepositError("")
        await contract.methods.addBalance().send({value:depositAmount.toString(), from: accounts[0]})
        .on('receipt', async() => {
          await contract.methods.getBalanceInWei(accounts[0]).call({from: accounts[0]})
          .then((result) => {
            setLoadingDeposit(false)
            setDepositStatement(`You have deposited ${Number.parseFloat(depositValue).toFixed(10)} ETH`)
            setDepositBalance(Math.trunc(Number(web3.utils.fromWei(result.toString()))*1e5)/1e5);
          })
        })

      } catch (error) {
        handleError(error)
        setLoadingDeposit(false)
        setDepositStatement(`Unable to deposit amount. Connect your wallet and try again. Make sure you have sufficient amount in your wallet.`)
      }
      setLoadingDeposit(false)
      setDepositValue(""); 
      
    }
  }
  
  // ETH withdraw
  const withdrawDeposit = async (e) => {
    e.preventDefault();
    setLoadingWithdraw(true)
    initStatement();
    if(typeof window.ethereum!== 'undefined'){
      await requestAccount();
      
      let withdrawAmount;
      try {
        if(isNaN(withdrawValue)) {
          setLoadingWithdraw(false)
          setWithdrawError("Please enter number only");
          return;
          } else {
          withdrawAmount = web3.utils.toWei(withdrawValue,'ether');
          setWithdrawError("")
        }

      } catch (error) {
        setWithdrawStatement(`Unable to withdraw. Make sure you have sufficient balance.`)
        console.log(error);
        return;
      }

      try {
          setWithdrawError("")
          await contract.methods.withdraw(withdrawAmount).send({from:accounts[0]})
          .on('receipt', async () => {
            await contract.methods.getBalanceInWei(accounts[0]).call({from: accounts[0]})
            .then((result) =>{
              const balance = Number.parseFloat(web3.utils.fromWei(result.toString())).toFixed(10);
              setLoadingWithdraw(false)
              setWithdrawStatement(`You have withdrawn ${Number.parseFloat(withdrawValue).toFixed(10)} amount of ETH. You have ${Number.parseFloat(Math.trunc(Number(balance)*1e5)/1e5).toFixed(10)} ETH balance remaining.`)
            })
          });
        } catch (err) {
          console.log(err)
          setLoadingWithdraw(false)
          setWithdrawStatement(`Unable to withdraw. Make sure you have sufficient balance.`)
        }
        setLoadingWithdraw(false)
        setWithdrawValue("")
      }
  }

  //ERC20 token deposit
  const handleERC20DepositValueChange = async (e) => {
    e.preventDefault();
    setLoadingERC20Deposit(true)
    initStatement();
    if(typeof window.ethereum!== 'undefined'){
      await requestAccount()
      
      let tokenContract;
      let tokenDecimal;
      let tokenSymbol;
      try {
        if(!validateAddress(ERC20Address)) {
          setLoadingERC20Deposit(false)
          setERC20DepositAddressError("Please enter a valid ERC20 token address");
          return;
        } else {
          tokenContract = new web3.eth.Contract(ERC20.abi,ERC20Address.toString());    
          tokenDecimal = await tokenContract.methods.decimals().call({from:accounts[0]});
          tokenSymbol = await tokenContract.methods.symbol().call({from: accounts[0]});
          if(!tokenContract) {
            setLoadingERC20Deposit(false); 
            setERC20DepositStatement(`Unable to deposit amount. Make sure you have the correct ERC20 token address, sufficient token allowance and sufficient amount in your wallet.`);
          }
        }
      } catch (error) {
        setLoadingERC20Deposit(false)
        setERC20DepositStatement(`Unable to deposit amount. Make sure you have the correct ERC20 token address, sufficient token allowance and sufficient amount in your wallet.`)
        console.log(error);
        return;
      }

      let ERC20DepositAmount;
      try {
        if(isNaN(ERC20DepositValue)) {
          setLoadingERC20Deposit(false)
          setERC20DepositError("Please enter number only");
          return;
        } else {
          ERC20DepositAmount = web3.utils.toBN(ERC20DepositValue * 10**Number(tokenDecimal));
          setERC20DepositError("")
        }
      } catch (error) {
        setLoadingERC20Deposit(false)
        setERC20DepositStatement(`Unable to deposit amount. Make sure you have the correct ERC20 token address, sufficient token allowance and sufficient amount in your wallet.`)
        console.log(error);
        return;
      }
      
      setERC20DepositStatement("");
      setERC20DepositAddressError("")
      setERC20DepositError("")
      console.log(ERC20DepositAmount.toString())
      
      try{
          await contract.methods.addBalanceERC20(ERC20Address.toString(),ERC20DepositAmount.toString()).send({from: accounts[0]})
          .on('receipt', async()=> {
            await contract.methods.getBalanceInWei(accounts[0]).call({from: accounts[0]})
            .then((result) => {
              setLoadingERC20Deposit(false)
              setERC20DepositStatement(`You have deposited ${ERC20DepositValue} ${tokenSymbol}`)
              setDepositBalance(Math.trunc(Number(web3.utils.fromWei(result.toString()))*1e5)/1e5);
            })
          })

      } catch (error) {
        console.log(error)
        setLoadingERC20Deposit(false)
        setERC20DepositStatement(`Unable to deposit amount. Make sure you have the correct ERC20 token address, sufficient token allowance and sufficient amount in your wallet.`)
        return;
      }
      setLoadingERC20Deposit(false)
      setERC20DepositValue("");
      setERC20Address("") 
    }
  }

  //ERC20 Approve
  const handleERC20Approve = async (e) => {
    e.preventDefault();
    setLoadingApprove(true)    
    initStatement();
    if(typeof window.ethereum!== 'undefined'){
      await requestAccount();
      let tokenContract;
      let tokenDecimal;
      let tokenSymbol;
      
      //validate address input
      try {
        if(!validateAddress(ERC20Address)) {
          setLoadingApprove(false);
          setERC20DepositAddressError("Please enter a valid ERC20 token address");
          return;
        } else {
          tokenContract = new web3.eth.Contract(ERC20.abi,ERC20Address.toString());
          tokenDecimal = await tokenContract.methods.decimals().call({from:accounts[0]});
          tokenSymbol = await tokenContract.methods.symbol().call({from: accounts[0]});
          setERC20DepositAddressError("")
          if(!tokenContract) {
          setLoadingApprove(false); 
          setERC20ApproveStatement(`Unable to approve amount. Make sure you have the correct ERC20 token address and sufficient balance.`);
          }
        }
      } catch (error) {
        setLoadingApprove(false)
        setERC20ApproveStatement(`Unable to approve amount. Make sure you have the correct ERC20 token address and sufficient balance.`)
        console.log(error);
        return;
      }
      
      // validate amount input
      let ERC20DepositAmount;
      try {
        if(isNaN(ERC20DepositValue)) {
          setLoadingApprove(false)
          setERC20DepositError("Please enter number only");
          return;
        } else {
          ERC20DepositAmount = web3.utils.toBN(Number(ERC20DepositValue)*10**Number(tokenDecimal));
          setERC20DepositError("")
        }
      } catch (error) {
        setLoadingApprove(false)
        setERC20ApproveStatement(`Unable to approve amount. Make sure you have the correct ERC20 token address and sufficient balance.`);
        console.log(error);
        return;
      }

      setERC20DepositAddressError("")
      setERC20DepositError("")
      setERC20DepositStatement("");
      
      try{
        await tokenContract.methods.approve(contractAddress,ERC20DepositAmount.toString()).send({from: accounts[0]})
        .on('receipt', async () => {
          setLoadingApprove(false)
          setERC20ApproveStatement(`You have approved ${ERC20DepositValue} ${tokenSymbol}`)
        })      
      } catch (error) {
        console.log(error)
        setLoadingApprove(false)
        setERC20ApproveStatement(`Unable to approve amount. Make sure you have the correct ERC20 token address and sufficient balance.`)
        return;
      }
      setLoadingApprove(false)
    }
  }

  const withdrawERC20Value = async (e) =>{
    e.preventDefault();
    setLoadingERC20Withdraw(true)
    initStatement();
    if(typeof window.ethereum!== 'undefined'){
      await requestAccount();
      let tokenContract;
      let tokenDecimal;
      let tokenSymbol;

      try {
        if(!validateAddress(ERC20Address)) {
          setLoadingERC20Withdraw(false)
          setERC20WithdrawAddressError("Please enter a valid ERC20 token address");
          return;
        } else {
          tokenContract = new web3.eth.Contract(ERC20.abi,ERC20Address.toString());
          tokenDecimal = await tokenContract.methods.decimals().call({from:accounts[0]});
          tokenSymbol = await tokenContract.methods.symbol().call({from: accounts[0]});
          setERC20WithdrawAddressError("");
          if(!tokenContract) {
            setLoadingERC20Withdraw(false); 
            setERC20WithdrawStatement(`Unable to withdraw. Make sure you have the correct ERC20 token address and sufficient balance.`);
          }
        }
      } catch (error) {
        setLoadingERC20Withdraw(false)
        //setERC20WithdrawStatement(`Unable to withdraw. Make sure you have the correct ERC20 token address and sufficient balance.`)
        console.log(error);
        return;
      }
      
      let ERC20WithdrawAmount;
      try {
        if(isNaN(ERC20WithdrawValue)){
          setLoadingERC20Withdraw(false);
          setERC20WithdrawError("Please enter number only");
          return;
        } else {
          ERC20WithdrawAmount = web3.utils.toBN(Number(ERC20WithdrawValue)* 10**Number(tokenDecimal));
          setERC20WithdrawError("");
        }
      } catch (error) {
        setLoadingERC20Withdraw(false);
        setERC20WithdrawStatement(`Unable to withdraw. Make sure you have the correct ERC20 token address and sufficient balance.`);
        console.log(error);
        return;
      }
      
      setERC20WithdrawStatement("");
      setERC20WithdrawError("");
      setERC20WithdrawAddressError("");
      

      try{
      await contract.methods.withdrawInERC20(ERC20WithdrawAmount.toString(),ERC20Address.toString()).send({from: accounts[0]})
      .on('receipt', async() => {
        await contract.methods.getBalanceInWei(accounts[0]).call({from: accounts[0]})
        .then((result) => {
          const balance = Number.parseFloat(web3.utils.fromWei(result.toString())).toFixed(10);
          setLoadingERC20Withdraw(false)
          setERC20WithdrawStatement(`You have withdrawn ${tokenSymbol} token worth ${ERC20WithdrawValue} ETH. You have ${Math.trunc(Number(balance)*1e5)/1e5} ETH balance remaining.`)
          setDepositBalance(Math.trunc(Number(web3.utils.fromWei(result.toString()))*1e5)/1e5);
        })
      }) 

      } catch (error) {
        console.log(error)
        setLoadingERC20Withdraw(false)
        setERC20WithdrawStatement(`Unable to withdraw. Make sure you have the correct ERC20 token address and sufficient balance.`)
        return;
      }
      setLoadingERC20Withdraw(false)
      setERC20WithdrawValue(""); 
      setERC20Address("");
    }
  }

  const errorHandler =(error, errorInfo) => {
    console.log('logging', error, errorInfo);
  }

  return (
      <div className = "App">
        <ErrorBoundary FallbackComponent={Fallback} onError={errorHandler} className ="true">  
        
        <Header/>
        <div>
        <MetamaskConnectButton/>
        </div>
        
        <div className = "container">
            <h4>Deposit ETH and Start Earning Interest Today! </h4>
            <button onClick = {fetchETHDepositBalance}>
              View ETH Deposit Balance
            </button>
            <p>{viewStatement}</p>
     
            <form onSubmit={handleETHDepositValueChange}>
              <div>
                  
                  <label> Deposit Amount: </label>
                  <input type = 'text' required value={depositValue} onChange={(e) => {setDepositValue(e.target.value)}} placeholder={"Example ETH: 1.89"}/>
                  <input type="submit" value ="Add ETH"/>
                  {loadingDeposit? (<p>Please wait...</p>): (<p>{depositStatement}</p>)}
                  <p>{depositError}</p>
              </div>

            </form>

            <form onSubmit={withdrawDeposit}>
              <div className>
                  <label> Withdraw Amount: </label>
                  <input type = 'text' required value={withdrawValue} onChange={(e) => {setWithdrawValue(e.target.value)}} placeholder="Example ETH: 1.89"/>
                  <input type="submit" value ="Withdraw ETH"/>
                  {loadingWithdraw? (<p>Please wait...</p>): (<p>{withdrawStatement}</p>)}
                  <p>{withdrawError}</p>
              </div>
            </form>
            <br/>
            <br/>
        </div>
            <div className = "container">
                <form>
                  <div>
                  <h4>Deposit Your Tokens and Start Earning Interest Today! </h4>
                      <label> ERC20 Token Address: </label>
                      <input type = 'text' required value={ERC20Address} onChange={(e) => {setERC20Address(e.target.value)}} placeholder="ERC20 Address"/>
                      <p>{erc20DepositAddressError}</p>
                  </div>
                  <div>
                      <label> ERC20 Deposit Amount: </label>
                      <input type = 'text' required value={ERC20DepositValue} onChange={(e) => {setERC20DepositValue(e.target.value)}} placeholder="Example DAI: 100"/>
                      <p>{erc20DepositError}</p>
                  </div>
                  <div>
                      <button name="approve" type="submit" onClick={handleERC20Approve}>Approve</button>
                      {loadingApprove? (<p>Please wait...</p>) :(<p>{ERC20ApproveStatement}</p>)}
                      <button name="deposit" type="submit" onClick={handleERC20DepositValueChange}>Deposit ERC20 Token</button>
                      {loadingERC20Deposit? (<p>Please wait...</p>): (<p>{ERC20DepositStatement}</p>)}
                      
                  </div>
                </form>
            </div>

            <div className = "container">
                <form onSubmit={withdrawERC20Value}>
                  <div>
                      <label> ERC20 Token Address: </label>
                      <input type = 'text' required value={ERC20Address} onChange={(e) => {setERC20Address(e.target.value)}} placeholder="ERC20 Address"/>
                      <p>{erc20WithdrawAddressError}</p>
                  </div>
                  <div>
                      <label> Withdraw Amount (in ETH): </label>
                      <input type = 'text' required value={ERC20WithdrawValue} onChange={(e) => {setERC20WithdrawValue(e.target.value)}} placeholder="Example ETH: 1.89"/>
                      <p>{erc20WithdrawError}</p>
                  </div>
                  <div>
                      <button type="submit">Withdraw Balance in ERC20 Token</button>
                      {loadingERC20Withdraw ? (<p>Please wait...</p>): (<p>{ERC20WithdrawStatement}</p>)}
                  </div>
                </form>
            </div>
            </ErrorBoundary>
        </div>
      
    )

}

export default App;