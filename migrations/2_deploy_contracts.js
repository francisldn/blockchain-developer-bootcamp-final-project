const SmartBank = artifacts.require("SmartBank");

const address = {
  "rinkeby":{
    "UNISWAP": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    "COMP": "0xd6801a1DfFCd0a410336Ef88DeF4320D6DF1883e",
    "WETH":"0xc778417E063141139Fce010982780140Aa0cD5Ab"
  },
  "mainnet":{
    "UNISWAP": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    "COMP": "0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5",
    "WETH":"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
  }
}


module.exports = async function (deployer, network) {
  if(network === 'rinkeby') {
    await deployer.deploy(SmartBank,address.rinkeby.UNISWAP, address.rinkeby.COMP, address.rinkeby.WETH);
  } else if (network === 'mainnet' || network=== 'mainnet_fork') {
    await deployer.deploy(SmartBank,address.mainnet.UNISWAP, address.mainnet.COMP, address.mainnet.WETH);
  }
};
