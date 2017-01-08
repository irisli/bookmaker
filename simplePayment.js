const StellarSdk = require('stellar-sdk');
const version = require('./height');
const BigNumber = require('bignumber.js');

// account should be in the format of StellarSdk.Account
// keypair should be in the format of StellarSdk.Keypair
module.exports = async function simplePayment(Server, account, keypair, opts) {
  let operationOpts = {
    destination: opts.destination,
    asset: opts.asset,
    amount: opts.amount,
  };

  var transaction = new StellarSdk.TransactionBuilder(account)
    .addOperation(StellarSdk.Operation.payment(operationOpts))
    .addMemo(StellarSdk.Memo.text('bookmaker ' + version))
    .build();
  transaction.sign(keypair);

  let transactionResult = await Server.submitTransaction(transaction);
  // console.log('\n');
  // console.log(operationOpts);
  // console.log('View the transaction at: https://www.stellar.org/laboratory/#xdr-viewer?type=TransactionEnvelope&network=public&input=' + encodeURIComponent(transactionResult.envelope_xdr));
  // console.log('\n');
}