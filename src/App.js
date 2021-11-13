import React, {useState, useEffect} from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import { ethers } from 'ethers';
import 'bootstrap/dist/css/bootstrap.min.css';
import SmartBank from './abis/SmartBank.json';
import ERC20 from './abis/ERC20.json';
import './App.css';
import {Header} from './Component/Header';
import {MetamaskConnectButton} from './Component/MetamaskConnectButton';
import './index.css';
import Web3 from 'web3';

function getLibrary(provider) {
  return new ethers.providers.Web3Provider(provider);
}

let depositETHAmount;
function App() {
  // value of state, function to change the value of state
  const [depositValue, setDepositValue] = useState("");
  const[depositBalance, setDepositBalance] = useState("");
  const[withdrawValue, setWithdrawValue] = useState("");
  const[depositStatement, setDepositStatement] = useState("");
  const[viewStatement, setViewStatement]= useState("")
  const[withdrawStatement, setWithdrawStatement] = useState("");
  const[ERC20Address, setERC20Address] = useState("");
  const[ERC20DepositValue, setERC20DepositValue] = useState("")
  const[ERC20DepositStatement, setERC20DepositStatement] = useState("")
  const[ERC20ApproveStatement, setERC20ApproveStatement] = useState("")
  const[ERC20WithdrawValue, setERC20WithdrawValue] = useState("")
  const[ERC20WithdrawStatement, setERC20WithdrawStatement] = useState("")

  const contractAddress = '0x0a7395d932dcA94D1477F3a0078c7A97D847df65';

  let provider;
  let accounts;
  let contract;
  let signer;
  let web3;
  
  async function requestAccount() {
    provider = await detectEthereumProvider();
    web3 = new Web3(provider);
    accounts = await web3.eth.getAccounts();
    contract = new web3.eth.Contract(SmartBank.abi,contractAddress)
  }

  function initStatement() {
    setDepositBalance("")
    setDepositStatement("")
    setWithdrawStatement("")
    setERC20DepositStatement("")
    setERC20ApproveStatement("")
    setERC20WithdrawStatement("")
  }

  let balance;
  async function fetchETHDepositBalance() {
    initStatement();

    if(typeof window.ethereum!== 'undefined'){
      await requestAccount();
        try {
          await contract.methods.getBalanceInWei(accounts[0]).call({from:accounts[0]})
          .then((result) => {
            setDepositBalance(web3.utils.fromWei(result.toString()));
            depositBalance === null || depositBalance === 'NaN' ? setViewStatement("") : setViewStatement(`You have a balance of ${Number.parseFloat(depositBalance).toFixed(4)} ETH`)
          });
         
        } catch (err) {
          console.log(err)
          setViewStatement(`Unable to view deposit amount`)
        }
      }
    }



  const handleETHDepositValueChange = async (e) =>{
    e.preventDefault();
    initStatement();
    if(typeof window.ethereum!== 'undefined'){
      await requestAccount();
      const depositAmount = web3.utils.toWei(depositValue, 'ether');
      try{
        await contract.methods.addBalance().send({value:depositAmount.toString(), from: accounts[0]})
        .on('receipt', async() => {
          await contract.methods.getBalanceInWei(accounts[0]).call({from: accounts[0]})
          .then((result) => {
            setDepositStatement(`You have deposited ${Number.parseFloat(depositValue).toFixed(4)} ETH`)
            setDepositBalance(web3.utils.fromWei(result.toString()));
          })
        })

      } catch (error) {
        console.log(error)
        setDepositStatement(`Unable to deposit amount. Connect your wallet and try again. Make sure you have sufficient amount in your wallet.`)
      }
      setDepositValue(""); 
    }
  }
  
  const withdrawDeposit = async (e) => {
    e.preventDefault();
    initStatement();
    if(typeof window.ethereum!== 'undefined'){
      await requestAccount();
      const withdrawAmount = web3.utils.toWei(withdrawValue,'ether');

        try {
          await contract.methods.withdraw(withdrawAmount).send({from:accounts[0]})
          .on('receipt', async () => {
            await contract.methods.getBalanceInWei(accounts[0]).call({from: accounts[0]})
            .then((result) =>{
              const balance = Number.parseFloat(web3.utils.fromWei(result.toString())).toFixed(4);
              setWithdrawStatement(`You have withdrawn ${Number.parseFloat(withdrawValue).toFixed(4)} amount of ETH. You have ${balance} ETH balance remaining.`)
            })
          });
        } catch (err) {
          console.log(err)
          setWithdrawStatement(`Unable to withdraw. Make sure you have sufficient balance.`)
        }
        setWithdrawValue("")
      }
  }

  const handleERC20DepositValueChange = async (e) => {
    e.preventDefault();
    initStatement();
    if(typeof window.ethereum!== 'undefined'){
      await requestAccount();
      
      const tokenContract = new web3.eth.Contract(ERC20.abi,ERC20Address.toString());    
      const tokenDecimal = await tokenContract.methods.decimals().call({from:accounts[0]});
      const tokenSymbol = await tokenContract.methods.symbol().call({from: accounts[0]});
      const ERC20DepositAmount = web3.utils.toBN(ERC20DepositValue * 10**Number(tokenDecimal));
      setERC20DepositStatement("");
      console.log(ERC20DepositAmount.toString())
      
      try{
          await contract.methods.addBalanceERC20(ERC20Address.toString(),ERC20DepositAmount.toString()).send({from: accounts[0]})
          .on('receipt', async()=> {
            await contract.methods.getBalanceInWei(accounts[0]).call({from: accounts[0]})
            .then((result) => {
              setERC20DepositStatement(`You have deposited ${ERC20DepositValue} ${tokenSymbol}`)
              setDepositBalance(web3.utils.fromWei(result.toString()));
            })
          })

      } catch (error) {
        console.log(error)
        setERC20DepositStatement(`Unable to deposit amount. Make sure you have the correct ERC20 token address, sufficient allowance and sufficient amount in your wallet.`)
      }
      setERC20DepositValue("");
      setERC20Address("") 
    }
  }

  const handleERC20Approve = async (e) => {
    e.preventDefault();
    initStatement();
    if(typeof window.ethereum!== 'undefined'){
      await requestAccount();
      
      const tokenContract = new web3.eth.Contract(ERC20.abi,ERC20Address.toString());
      const tokenDecimal = await tokenContract.methods.decimals().call({from:accounts[0]});
      const tokenSymbol = await tokenContract.methods.symbol().call({from: accounts[0]});
      const ERC20DepositAmount = web3.utils.toBN(ERC20DepositValue * 10**Number(tokenDecimal));
      setERC20DepositStatement("");
      
      try{
        await tokenContract.methods.approve(contractAddress,ERC20DepositAmount.toString()).send({from: accounts[0]})
        .on('receipt', async () => {
          setERC20ApproveStatement(`You have approved ${ERC20DepositValue} ${tokenSymbol}`)
        })      
      } catch (error) {
        console.log(error)
        setERC20ApproveStatement(`Unable to approve amount. Make sure you have the correct ERC20 token address and sufficient balance.`)
      }

    }
  }

  const withdrawERC20Value = async (e) =>{
    e.preventDefault();
    initStatement();
    if(typeof window.ethereum!== 'undefined'){
      await requestAccount();
      
      const tokenContract = new web3.eth.Contract(ERC20.abi,ERC20Address.toString());
      
      const tokenDecimal = await tokenContract.methods.decimals().call({from:accounts[0]});
      const tokenSymbol = await tokenContract.methods.symbol().call({from: accounts[0]});
      const ERC20WithdrawAmount = web3.utils.toBN(ERC20WithdrawValue * 10**Number(tokenDecimal));
      setERC20WithdrawStatement("");
    try{
      await contract.methods.withdrawInERC20(ERC20WithdrawAmount.toString(),ERC20Address.toString()).send({from: accounts[0]})
      .on('receipt', async() => {
        await contract.methods.getBalanceInWei(accounts[0]).call({from: accounts[0]})
        .then((result) => {
          const balance = Number.parseFloat(web3.utils.fromWei(result.toString())).toFixed(4);
          setERC20WithdrawStatement(`You have withdrawn ${tokenSymbol} token worth ${ERC20WithdrawValue} ETH. You have ${balance} ETH balance remaining.`)
          setDepositBalance(web3.utils.fromWei(result.toString()));
        })
      }) 

      } catch (error) {
        console.log(error)
        setERC20WithdrawStatement(`Unable to withdraw. Make sure you have the correct ERC20 token address and sufficient balance.`)
      }
      setERC20WithdrawValue(""); 
      setERC20Address("");
    }
  }

  return (
      <div className = "App">
        <Header/>
        <div>
        <MetamaskConnectButton/>
        </div>
        <div className = "container">
            <button onClick = {fetchETHDepositBalance}>
              View ETH Deposit Balance
            </button>
            <p>{viewStatement}</p>
     
            <form onSubmit={handleETHDepositValueChange}>
              <div>
                  <label> Deposit Amount: </label>
                  <input type = 'text' required value={depositValue} onChange={(e) => {setDepositValue(e.target.value)}} placeholder="Amount in ETH"/>
                  <input type="submit" value ="Add ETH" />
                  <p>{depositStatement}</p>
              </div>
            </form>

            <form onSubmit={withdrawDeposit}>
              <div>
                  <label> Withdraw Amount: </label>
                  <input type = 'text' required value={withdrawValue} onChange={(e) => {setWithdrawValue(e.target.value)}} placeholder="Amount in ETH"/>
                  <input type="submit" value ="Withdraw ETH" />
                  <p>{withdrawStatement}</p>
              </div>
            </form>
            <br/>
            <br/>
        </div>
            <div className = "container">
                <form>
                  <div>
                      <label> ERC20 Token Address: </label>
                      <input type = 'text' required value={ERC20Address} onChange={(e) => {setERC20Address(e.target.value)}} placeholder="ERC20 Address"/>
                  </div>
                  <br/>
                  <div>
                      <label> ERC20 Deposit Amount: </label>
                      <input type = 'text' required value={ERC20DepositValue} onChange={(e) => {setERC20DepositValue(e.target.value)}} placeholder="ERC20 Token Amount"/>
                  </div>
                  <br/>
                  <div>
                      <button name="approve" type="submit" onClick={handleERC20Approve}>Approve</button>
                      <p>{ERC20ApproveStatement}</p>
                      <button name="deposit" type="submit" onClick={handleERC20DepositValueChange}>Deposit ERC20 Token</button>
                      <p>{ERC20DepositStatement}</p>
                      
                  </div>
                </form>
            </div>

            <div className = "container">
                <form onSubmit={withdrawERC20Value}>
                  <div>
                      <label> ERC20 Token Address: </label>
                      <input type = 'text' required value={ERC20Address} onChange={(e) => {setERC20Address(e.target.value)}} placeholder="ERC20 Address"/>
                  </div>
                  <br/>
                  <div>
                      <label> Withdraw Amount (in ETH): </label>
                      <input type = 'text' required value={ERC20WithdrawValue} onChange={(e) => {setERC20WithdrawValue(e.target.value)}} placeholder="Value in ETH"/>
                  </div>
                  <br/>
                  <div>
                      <button type="submit">Withdraw ETH in ERC20 Token</button>
                      <p>{ERC20WithdrawStatement}</p>
                  </div>
                </form>
            </div>
      </div>
    )

}

export default App;