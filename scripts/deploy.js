const hre = require("hardhat");
const ethers = require("ethers")
const { networks } = require('../hardhat.config');
const ownAddress = '0x90f79bf6eb2c4f870365e785982e1f101e93b906'
const player2Address = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8'
const provider = ethers.providers.getDefaultProvider('http://127.0.0.1:8545/');

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

  const gameContract = await gameFactory.deploy(vaultContract.address);

  await gameContract.deployed();

  console.log("Game address: ", gameContract.address);

  const gameFactoryNonCompetitive = await hre.ethers.getContractFactory("NonCompetitiveGameA");
  
  const gameContractNonCompetitive = await gameFactoryNonCompetitive.deploy(vaultContract.address);

  await gameContractNonCompetitive.deployed();

  console.log("Game NonCompetitive address: ", gameContractNonCompetitive.address);

  const wallet = new ethers.Wallet(networks.local.accounts[0], provider);
  const walletPlayer2 = new ethers.Wallet(networks.local.accounts[1], provider);

  const parsedAmount = ethers.utils.parseEther("100000");

  await ptitTokenContract.connect(wallet).mint(ownAddress, parsedAmount)
  console.log('checkpoint 1');

  await ptitTokenContract.connect(wallet).mint(player2Address, parsedAmount)
  console.log('checkpoint 1b');

  await ptitTokenContract.connect(wallet).approve(vaultContract.address, parsedAmount)
  console.log('checkpoint 2');

  await ptitTokenContract.connect(walletPlayer2).approve(vaultContract.address, parsedAmount)
  console.log('checkpoint 2b');

  await vaultContract.connect(wallet).setMintAmount(parsedAmount)
  console.log('checkpoint 3');

  await vaultContract.connect(wallet).setMintTime('1')
  console.log('checkpoint 4');

  await ptitTokenContract.connect(wallet).grantPermit(vaultContract.address)
  console.log('checkpoint 5');

  await vaultContract.connect(wallet).grantPermit(gameContract.address)
  console.log('checkpoint 6');

  await vaultContract.connect(wallet).grantPermit(gameContractNonCompetitive.address)
  console.log('checkpoint 7');

  await gameContract.connect(wallet).setVerification('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266')

  await gameContractNonCompetitive.connect(wallet).setVerification('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266')

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