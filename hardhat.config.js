require('@nomiclabs/hardhat-waffle');

module.exports = {
  solidity: '0.8.0',
  networks: {
    kovan: {
      url: 'https://kovan.infura.io/v3/66c35a1de4ec4394aec60c6f9d898b9a',
      accounts: ['8d4af0ccf0f97f1d9adc0d59b6e034003430f1177aaa724d4a012ba293e1a8a8',
                '82375e1afca0a4ac87ab47d25eaa1fe359710439339bd0983552067c78e8c4b8'],
    },
    ropsten: {
      url: 'https://eth-ropsten.alchemyapi.io/v2/j3mi_b8lqxnWBii_fdvR1RgC9WBGg3oS',
      accounts: ['8d4af0ccf0f97f1d9adc0d59b6e034003430f1177aaa724d4a012ba293e1a8a8',
                '82375e1afca0a4ac87ab47d25eaa1fe359710439339bd0983552067c78e8c4b8'],
    },
    rinkeby: {
      url: 'https://eth-rinkeby.alchemyapi.io/v2/H3OjblvwvesbSgIunUJLSbCZzC1jUSqz',
      accounts: ['8d4af0ccf0f97f1d9adc0d59b6e034003430f1177aaa724d4a012ba293e1a8a8',
                '82375e1afca0a4ac87ab47d25eaa1fe359710439339bd0983552067c78e8c4b8'],
    },
    local: {
      url: 'HTTP://127.0.0.1:8545/',
      accounts: ['0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6',
                '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'],
    },
    kovan: {
      url: 'HTTP://127.0.0.1:8545',
      accounts: ['82375e1afca0a4ac87ab47d25eaa1fe359710439339bd0983552067c78e8c4b8'],
    },
  },
};