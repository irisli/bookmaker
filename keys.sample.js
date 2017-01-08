const StellarSdk = require('stellar-sdk');

module.exports = {
  horizon: 'https://horizon.stellar.org', // Live network
  // horizon: 'https://horizon-testnet.stellar.org', // Test network

  // Issuing account
  // GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
  issuer: StellarSdk.Keypair.fromSeed('SAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'),

  // holder of USD; buyer of XLM
  // GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
  seller: StellarSdk.Keypair.fromSeed('SAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'),

  // holder of XLM; seller of XLM; buyer of USD
  // GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
  buyer: StellarSdk.Keypair.fromSeed('SAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'),
};
