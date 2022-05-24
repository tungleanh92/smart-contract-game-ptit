const hre = require("hardhat");
const ethers = require("ethers")
const { networks } = require('../hardhat.config');
const ownAddress = '0x72264E2431bfF059513899d4fF98f880a958CFa9'
const provider = ethers.providers.getDefaultProvider('rinkeby');

const main = async() => {
  const ptitTokenFactory = await hre.ethers.getContractFactory("PtitToken");
  const ptitTokenContract = await ptitTokenFactory.deploy("1");
  await ptitTokenContract.deployed();

  console.log("PtitToken address: ", ptitTokenContract.address);

  const vaultFactory = await hre.ethers.getContractFactory("Vault");
  const vaultContract = await vaultFactory.deploy(ptitTokenContract.address);

  await vaultContract.deployed();

  console.log("Vault address: ", vaultContract.address);

  const gameFactory = await hre.ethers.getContractFactory("TwoPlayersV1");
  // const gameFactory = await hre.ethers.getContractFactory("NonCompetitiveGameA");

  const gameContract = await gameFactory.deploy(vaultContract.address);

  await gameContract.deployed();

  console.log("Game address: ", gameContract.address);

  const wallet = new ethers.Wallet(networks.ropsten.accounts[0], provider);
  const parsedAmount = ethers.utils.parseEther("10000000000");

  const gasEstimated1 = await ptitTokenContract.estimateGas.mint(ownAddress, parsedAmount)
  await ptitTokenContract.connect(wallet).mint(ownAddress, parsedAmount, {
    gasLimit: gasEstimated1 * 1.5 
  })
  console.log(gasEstimated1);
  console.log('checkpoint 1');
  let gasEstimated2 = await ptitTokenContract.estimateGas.approve(vaultContract.address, parsedAmount)

  await ptitTokenContract.connect(wallet).approve(vaultContract.address, parsedAmount, {
    gasLimit: gasEstimated2
  })
  console.log(gasEstimated2);
  console.log('checkpoint 2');

  let gasEstimated3 = await vaultContract.estimateGas.setMintAmount(parsedAmount)
  await vaultContract.connect(wallet).setMintAmount(parsedAmount, {
    gasLimit: gasEstimated3 * 1.5  
  })
  console.log(gasEstimated3);
  console.log('checkpoint 3');

  let gasEstimated4 = await ptitTokenContract.estimateGas.grantPermit(vaultContract.address)
  await ptitTokenContract.connect(wallet).grantPermit(vaultContract.address, {
    gasLimit: gasEstimated4 * 1.5  
  })
  console.log(gasEstimated4);
  console.log('checkpoint 4');

  let gasEstimated5 = await vaultContract.estimateGas.grantPermit(gameContract.address)
  await vaultContract.connect(wallet).grantPermit(gameContract.address, {
    gasLimit: gasEstimated5 * 1.5  
  })
  console.log(gasEstimated5);
  console.log('checkpoint 5');

  let gasEstimated6 = await gameContract.estimateGas.setVerification(ownAddress)
  await gameContract.connect(wallet).setVerification(ownAddress, {
    gasLimit: gasEstimated6 * 1.5  
  })
  console.log(gasEstimated6);
  console.log("Done!");
}

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

runMain();