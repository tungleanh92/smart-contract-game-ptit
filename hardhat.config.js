require('@nomiclabs/hardhat-waffle');

module.exports = {
  solidity: '0.8.0',
  networks: {
    goerli: {
      url: 'https://eth-goerli.g.alchemy.com/v2/Jlh5CnKSJanNjrRKZ04rkOpF3YuHYvWP',
      accounts: ['82375e1afca0a4ac87ab47d25eaa1fe359710439339bd0983552067c78e8c4b8',
                'aff0f061438b698ab29debb6d3c9efa1855edec3055e70f70751d5f6fad3c927'],
    },
    rinkerby: {
      url: 'https://eth-rinkeby.alchemyapi.io/v2/j3mi_b8lqxnWBii_fdvR1RgC9WBGg3oS',
      accounts: ['82375e1afca0a4ac87ab47d25eaa1fe359710439339bd0983552067c78e8c4b8',
                'aff0f061438b698ab29debb6d3c9efa1855edec3055e70f70751d5f6fad3c927'],
    },
    local: {
      url: 'HTTP://127.0.0.1:8545/',
      accounts: ['0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6',
                '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'],
    },
  },
};