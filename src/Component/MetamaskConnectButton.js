import React, {useState} from 'react';
import {ethers} from 'ethers'
import '../App.css'

export const MetamaskConnectButton = () => {
    const[errorMessage, setErrorMessage] = useState(null);
    const[defaultAccount, setDefaultAccount]=useState(null);
    const[userBalance, setUserBalance]=useState(null);
    const[connButtonText, setConnButtonText] = useState('Connect Wallet');
	const[networkMessage, setNetworkMessage] = useState("")


    const connectWalletHandler = async () => {
        if (window.ethereum && window.ethereum.isMetaMask) {
			console.log('MetaMask Here!');

			let chainId= await window.ethereum.request({method: 'eth_chainId'})
			if(chainId!== '0x4') {
				setNetworkMessage("This dapp only works on the Rinkeby testnet for now. Please switch to Rinkeby to interact with the dapp.");
			} else {
				setNetworkMessage("");
			}

			window.ethereum.request({ method: 'eth_requestAccounts'})
			.then(result => {
				accountChangedHandler(result[0]);
				setConnButtonText('Wallet Connected');
				getAccountBalance(result[0]);
			})
			.catch(error => {
				setErrorMessage(error.message);
			
			});

		} else {
			console.log('Need to install MetaMask');
			setErrorMessage('Please install MetaMask browser extension to interact');
		}
    }

    const accountChangedHandler = (newAccount) => {
		setDefaultAccount(newAccount);
		getAccountBalance(newAccount.toString());
	}

	const getAccountBalance = (account) => {
		window.ethereum.request({method: 'eth_getBalance', params: [account, 'latest']})
		.then(balance => {
			setUserBalance(ethers.utils.formatEther(balance));
		})
		.catch(error => {
			setErrorMessage(error.message);
		});
	};

	const chainChangedHandler = () => {
		// reload the page to avoid any errors with chain change mid use of application
		window.location.reload();
	}

    // listen for account changes
	window.ethereum.on('accountsChanged', accountChangedHandler);

	window.ethereum.on('chainChanged', chainChangedHandler);
	
    return(
        <div className="walletCard">
            <button onClick={connectWalletHandler}>{connButtonText}</button>
            <div className="accountDisplay">
                <h5> Address: {defaultAccount}</h5>
            </div>
            <div className="balanceDisplay">
                <h5>Balance: {isNaN(Number.parseFloat(userBalance).toFixed(10)) ? "": Number.parseFloat(userBalance).toFixed(10) } ETH</h5>
            </div>
			{networkMessage}
            {errorMessage}
        </div>
    )
};

export default MetamaskConnectButton;