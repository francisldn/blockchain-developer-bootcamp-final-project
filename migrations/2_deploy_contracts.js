const SmartBank = artifacts.require("SmartBank");

const UNISWAP_RINKEBY = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
const COMP_RINKEBY = '0xd6801a1DfFCd0a410336Ef88DeF4320D6DF1883e';
const WETH_RINKEBY = '0xc778417E063141139Fce010982780140Aa0cD5Ab';

const UNISWAP_MAINNET= '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
const COMP_MAINNET = '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5';
const WETH_MAINNET = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';


module.exports = async function (deployer, network) {
  if(network === 'rinkeby') {
    await deployer.deploy(SmartBank,UNISWAP_RINKEBY, COMP_RINKEBY, WETH_RINKEBY);
  } else if (network === 'mainnet' || network=== 'mainnet_fork') {
    await deployer.deploy(SmartBank,UNISWAP_MAINNET, COMP_MAINNET, WETH_MAINNET);
  }
};
