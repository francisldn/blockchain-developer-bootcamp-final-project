import React, {useState} from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import {ethers} from 'ethers'
import '../App.css'

export const MetamaskConnectButton = () => {
    const[errorMessage, setErrorMessage] = useState(null);
    const[defaultAccount, setDefaultAccount]=useState(null);
    const[userBalance, setUserBalance]=useState(null);
    const[connButtonText, setConnButtonText] = useState('Connect Wallet');


    const connectWalletHandler =() => {
        if (window.ethereum && window.ethereum.isMetaMask) {
			console.log('MetaMask Here!');

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
                <h5>Balance: {userBalance}</h5>
            </div>
            {errorMessage}
        </div>
    )
};

export default MetamaskConnectButton;