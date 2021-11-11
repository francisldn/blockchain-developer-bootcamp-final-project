import React, {useState, useEffect} from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';
import 'bootstrap/dist/css/bootstrap.min.css';
import SmartBank from './abis/SmartBank.json';
import './App.css';
import {Header} from './Component/Header';
import './index.css';
import { AppContextProvider } from './AppContext';
import web3 from 'web3';

function getLibrary(provider) {
  return new ethers.providers.Web3Provider(provider);
}

function App() {
  // value of state, function to change the value of state
  const [values, setValues] = useState();
  const[submittedDeposit, setSubmittedDeposit] = useState(false)
  const contractAddress = '0x0a7395d932dcA94D1477F3a0078c7A97D847df65';

  let provider;
  let account;
  let contract;
  let signer;
  
  async function requestAccount() {
    provider = new ethers.providers.Web3Provider(window.ethereum)
    signer = provider.getSigner()
    const accounts = await ethereum.request({method: 'eth_requestAccounts'});
    contract = new ethers.Contract(contractAddress, SmartBank.abi, signer)
  }

  let balance;
  async function fetchETHDepositBalance() {
    await requestAccount();
    
    if(typeof window.ethereum!== 'undefined'){
        try {
          balance = await contract.getContractBalance({from: account})
          console.log(`You have ${web3.utils.toBN(balance)} amount of ETH in deposit`)
        } catch (err) {
          console.log(err)
        }
      
      }
    }

  async function handleETHDepositValueChange (event) {
    event.preventDefault();
    setValues(event.target.value);
    const depositAmount = 1e18;
    console.log(depositAmount)
    if(typeof window.ethereum!== 'undefined'){
      await requestAccount();
      try{
        await contract.addBalance(depositAmount);
        console.log("deposited")
        balance = await contract.getContractBalance({from: account})
        console.log(balance)
      } catch (error) {
        console.log(error)
      }
    setSubmittedDeposit(true)
    }
  }
  


  return (
      <div className = "App">

            <button onClick = {fetchETHDepositBalance}>
              View ETH Deposit Balance
            </button>
            <p>{`You have ${balance} amount of ETH in deposit`}</p>
            <br/>
            <br/>
            <button onClick = {handleETHDepositValueChange}>Deposit</button>
            <input onChange = {e => setValues(e.target.value)} placeholder = "ETH Amount"/>
      </div>
    )

}

export default App;