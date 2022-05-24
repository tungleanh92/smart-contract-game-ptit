require('@nomiclabs/hardhat-waffle');

module.exports = {
  solidity: '0.8.0',
  networks: {
    ropsten: {
      url: 'https://eth-ropsten.alchemyapi.io/v2/j3mi_b8lqxnWBii_fdvR1RgC9WBGg3oS',
      accounts: ['8d4af0ccf0f97f1d9adc0d59b6e034003430f1177aaa724d4a012ba293e1a8a8'],
    },
    rinkeby: {
      url: 'https://eth-rinkeby.alchemyapi.io/v2/H3OjblvwvesbSgIunUJLSbCZzC1jUSqz',
      accounts: ['8d4af0ccf0f97f1d9adc0d59b6e034003430f1177aaa724d4a012ba293e1a8a8'],
    },
  },
};