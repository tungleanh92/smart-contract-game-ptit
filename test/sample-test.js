const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Run and test all function", function () {
  it("Should work", async function () {
  const ptitTokenFactory = await hre.ethers.getContractFactory("PtitToken");
  const ptitTokenContract = await ptitTokenFactory.deploy("1");
  await ptitTokenContract.deployed();

  const vaultFactory = await hre.ethers.getContractFactory("Vault");
  const vaultContract = await vaultFactory.deploy(ptitTokenContract.address);
  await vaultContract.deployed();

  const gameFactory = await hre.ethers.getContractFactory("TwoPlayersV1");
  const gameContract = await gameFactory.deploy(vaultContract.address);
  await gameContract.deployed();

  const ownAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
  const expectedAmount = "100.0"
  const expectResult = "99.0"
  const parsedAmount = ethers.utils.parseEther("100");
  const parsedAmountDepositToken = ethers.utils.parseEther("30");
  const gameId = '1'

  // for deposit/withdraw
  let mintTx = await ptitTokenContract.mint(ownAddress, parsedAmount)
  await mintTx.wait()

  let balance = await ptitTokenContract.balanceOf(ownAddress)
  expect(ethers.utils.formatEther(balance)).to.equal(expectedAmount)

  let totalSupply = await ptitTokenContract.totalSupply()
  expect(ethers.utils.formatEther(totalSupply)).to.equal(expectedAmount)

  let approveTx = await ptitTokenContract.approve(vaultContract.address, parsedAmount)
  await approveTx.wait()

  // let allowance = await ptitTokenContract.allowance(ownAddress, vaultContract.address)
  // expect(ethers.utils.formatEther(allowance)).to.equal(expectedAmount)

  // depositToken
  // let depositTokenTx = await vaultContract.depositToken(parsedAmountDepositToken)
  // await depositTokenTx.wait()
  // let depositToken = await vaultContract.playerBalance(ownAddress)
  // expect(ethers.utils.formatEther(depositToken)).to.equal("10.0")

  // for faucet claim
  await vaultContract.setMintAmount(parsedAmount)
  await vaultContract.setMintTime('1')

  let mintAmt = await vaultContract.mintAmt()
  expect(ethers.utils.formatEther(mintAmt)).to.equal(expectedAmount)

  await ptitTokenContract.grantPermit(vaultContract.address)

  let checks = await ptitTokenContract.checks(vaultContract.address)
  expect(checks).to.equal("1")
  
  // faucet claim
  let faucetClaimTx = await vaultContract.faucetClaim(ownAddress)
  await faucetClaimTx.wait()
  let playerBalance = await vaultContract.playerBalance(ownAddress)
  expect(ethers.utils.formatEther(playerBalance)).to.equal(expectedAmount)

  // for join game/win game
  await vaultContract.grantPermit(gameContract.address)

  checks = await vaultContract.checks(gameContract.address)
  expect(checks).to.equal("1")

  await gameContract.setVerification(ownAddress)

  verification = await gameContract.verification()
  expect(verification).to.equal(ownAddress)

  // join game
  let messageHash = ethers.utils.id('randomString');
  let messageHashBytes = ethers.utils.arrayify(messageHash)
  let signWallet = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
  let flatSig = await signWallet.signMessage(messageHashBytes);

  let joinGameTx = await gameContract.joinGame('1', parsedAmountDepositToken, flatSig, messageHash)
  await joinGameTx.wait()
  let playerBalance1 = await vaultContract.playerBalance(ownAddress)
  expect(ethers.utils.formatEther(playerBalance1)).to.equal(expectResult)

  // // winner claim
  // let messageHash = ethers.utils.id("You win!");
  // let messageHashBytes = ethers.utils.arrayify(messageHash)
  // let signWallet = new ethers.Wallet("8d4af0ccf0f97f1d9adc0d59b6e034003430f1177aaa724d4a012ba293e1a8a8");
  // let flatSig = await signWallet.signMessage(messageHashBytes);
  // let winnerClaimTx = await gameContract.winnerClaim(gameId, parsedAmountDepositToken, flatSig, messageHash)
  // await winnerClaimTx.wait()

  });
});
