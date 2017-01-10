const StellarSdk = require('stellar-sdk');

module.exports = {
  // horizon: 'https://horizon.stellar.org', // Live network
  horizon: 'https://horizon-testnet.stellar.org', // Test network
  network: StellarSdk.Network.useTestNetwork(),
  // network: StellarSdk.Network.usePublicNetwork(),

  // Issuer
  issuer: StellarSdk.Keypair.random(),

  // holder of USD; buyer of XLM
  seller: StellarSdk.Keypair.random(),

  // holder of XLM; seller of XLM; buyer of USD
  buyer: StellarSdk.Keypair.random(),
};
