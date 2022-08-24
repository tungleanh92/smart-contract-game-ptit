const hre = require("hardhat");
const ethers = require("ethers")
const { networks } = require('../hardhat.config');
const ownAddress = '0xBe5D8f662074e48aC5a363Ee0c7ADA0dBe97c7b0'
const player2Address = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8'
const provider = ethers.providers.getDefaultProvider(networks.goerli.url);

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

  const wallet = new ethers.Wallet(networks.goerli.accounts[0], provider);
  // const walletPlayer2 = new ethers.Wallet(networks.local.accounts[1], provider);

  // const parsedAmount = ethers.utils.parseEther("100000");

  // await ptitTokenContract.connect(wallet).mint(ownAddress, parsedAmount)
  // console.log('checkpoint 1');

  // await ptitTokenContract.connect(wallet).mint(player2Address, parsedAmount)
  // console.log('checkpoint 1b');

  // await ptitTokenContract.connect(wallet).approve(vaultContract.address, parsedAmount)
  // console.log('checkpoint 2');

  // await ptitTokenContract.connect(walletPlayer2).approve(vaultContract.address, parsedAmount)
  // console.log('checkpoint 2b');

  // await vaultContract.connect(wallet).setMintAmount(parsedAmount)
  // console.log('checkpoint 3');

  await vaultContract.connect(wallet).setMintTime('1')
  console.log('checkpoint 4');

  let nonce = await provider.getTransactionCount(ownAddress)
  await ptitTokenContract.connect(wallet).grantPermit(vaultContract.address, {nonce: nonce + 1})
  console.log('checkpoint 5');

  await vaultContract.connect(wallet).grantPermit(gameContract.address, {nonce: nonce + 2})
  console.log('checkpoint 6');

  await vaultContract.connect(wallet).grantPermit(gameContractNonCompetitive.address, {nonce: nonce + 3})
  console.log('checkpoint 7');

  await gameContract.connect(wallet).setVerification('0x6C2B6b1f1B4EA96234b1BD6f84F808Fae63cB3B0', {nonce: nonce + 4})

  await gameContractNonCompetitive.connect(wallet).setVerification('0x6C2B6b1f1B4EA96234b1BD6f84F808Fae63cB3B0', {nonce: nonce + 5})

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